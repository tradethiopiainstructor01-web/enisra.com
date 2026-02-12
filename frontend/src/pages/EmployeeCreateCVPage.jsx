import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Spinner,
  Text,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUserStore } from '../store/user';
import EmployeeNavDrawer from '../components/employee/EmployeeNavDrawer';
import EmployeeSidebar from '../components/employee/EmployeeSidebar';
import {
  downloadBlob,
  isLikelyMobileBrowser,
  tryShareBlobAsFile,
} from '../utils/fileDownload';

const formatMonthYear = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'MMM yyyy');
};

const safeFormatDate = (value, pattern = 'PPP') => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, pattern);
};

const SectionTitle = ({ children, color = 'gray.700' }) => (
  <Text
    fontSize="xs"
    fontWeight="bold"
    letterSpacing="0.22em"
    textTransform="uppercase"
    color={color}
    mb={2}
  >
    {children}
  </Text>
);

const EmployeeCreateCVPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const panelBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isDesktop = useBreakpointValue({ base: false, lg: true }) || false;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('employeeSidebarCollapsed') === '1'
  );

  const currentUser = useUserStore((state) => state.currentUser);
  const userId = currentUser?._id || localStorage.getItem('userId');

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const cvRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        if (!userId) {
          setProfile(null);
          return;
        }
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${userId}`);
        const data = await res.json();
        if (!res.ok || !data?.success || !data?.user) {
          throw new Error(data?.message || 'Unable to load profile.');
        }
        setProfile(data.user);
      } catch (error) {
        setProfile(null);
        toast({
          title: 'Failed to load profile',
          description: error?.message || 'Unable to load employee profile.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, toast]);

  useEffect(() => {
    localStorage.setItem('employeeSidebarCollapsed', sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  const fullName = useMemo(() => {
    const parts = [profile?.firstName, profile?.middleName, profile?.lastName]
      .map((v) => (v || '').toString().trim())
      .filter(Boolean);
    if (parts.length) return parts.join(' ');
    return (
      profile?.fullName ||
      currentUser?.username ||
      currentUser?.email ||
      'Employee'
    );
  }, [profile, currentUser]);

  const contactEmail = useMemo(() => {
    return (
      profile?.workEmail ||
      profile?.personalEmail ||
      profile?.email ||
      currentUser?.email ||
      ''
    );
  }, [profile, currentUser]);

  const companyWebsite = 'www.enisra.com';

  const handleDownloadPdf = async () => {
    if (!cvRef.current) return;

    const filename = `CV_${fullName.replace(/\s+/g, '_')}.pdf`;
    const isMobile = isLikelyMobileBrowser();

    setIsExporting(true);
    try {
      // Allow the UI to hide any external images before capture.
      await new Promise((r) => setTimeout(r, 50));

      const canvas = await html2canvas(cvRef.current, {
        scale: isMobile ? 1.5 : 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const blob = pdf.output('blob');

      if (isMobile) {
        const shared = await tryShareBlobAsFile(blob, filename, { title: filename });
        if (shared) return;

        // Mobile browsers often block programmatic "downloads". Navigating to the PDF is more reliable.
        const url = URL.createObjectURL(blob);
        setTimeout(() => URL.revokeObjectURL(url), 5 * 60_000);
        const opened = window.open(url, '_blank');
        if (!opened) window.location.assign(url);
        return;
      }

      downloadBlob(blob, filename);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error?.message || 'Unable to export CV PDF.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const education = Array.isArray(profile?.educationBackground)
    ? profile.educationBackground.filter((e) => e && (e.institutionName || e.fieldOfStudy || e.highestEducationLevel))
    : [];

  const experience = Array.isArray(profile?.workExperience)
    ? profile.workExperience.filter((w) => w && (w.previousCompanyName || w.jobTitle))
    : [];

  const technicalSkills = Array.isArray(profile?.technicalSkills)
    ? profile.technicalSkills.filter(Boolean)
    : [];

  const softSkills = Array.isArray(profile?.softSkills)
    ? profile.softSkills.filter(Boolean)
    : [];

  const languages = Array.isArray(profile?.languagesSpoken)
    ? profile.languagesSpoken.filter((l) => l && l.language)
    : [];

  const headerBadges = [
    profile?.jobTitle,
    profile?.department,
    profile?.position,
    profile?.workLocation,
  ]
    .map((v) => (v || '').toString().trim())
    .filter(Boolean);

  const jobLine = [profile?.jobTitle, profile?.department, profile?.position]
    .map((v) => (v || '').toString().trim())
    .filter(Boolean)
    .join(' | ');

  const locationLine = [profile?.city, profile?.country]
    .map((v) => (v || '').toString().trim())
    .filter(Boolean)
    .join(', ');

  const addressLine = [profile?.currentAddress, profile?.city, profile?.country]
    .map((v) => (v || '').toString().trim())
    .filter(Boolean)
    .join(', ');

  const joinedLabel = safeFormatDate(profile?.dateOfJoining);

  return (
    <Box
      maxW={{ base: '100%', sm: '95%', md: '100%', lg: '95%', xl: '85%' }}
      mx="auto"
      p={6}
      position="relative"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
      boxShadow="xl"
      mt="10"
    >
      {!isDesktop ? (
        <IconButton
          aria-label="Open menu"
          icon={<HamburgerIcon />}
          position="absolute"
          top="4"
          left="4"
          onClick={onOpen}
          borderRadius="full"
          boxShadow="lg"
          size="lg"
          colorScheme="teal"
        />
      ) : null}
      <IconButton
        aria-label="Toggle theme"
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        position="absolute"
        top="4"
        right="4"
        onClick={toggleColorMode}
        borderRadius="full"
        boxShadow="lg"
        size="lg"
        colorScheme={colorMode === 'light' ? 'teal' : 'yellow'}
      />

      <Flex
        direction={{ base: 'column', lg: 'row' }}
        gap={6}
        align="flex-start"
        justify={{ base: 'flex-start', lg: 'center' }}
      >
        {isDesktop ? (
          <EmployeeSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
          />
        ) : null}
        <Flex
          flex="1"
          direction="column"
          bg={panelBg}
          p={6}
          borderRadius="lg"
          boxShadow="lg"
        >
          <Heading as="h2" size="lg" textAlign="center" mb={6}>
            Create CV
          </Heading>

          <HStack spacing={3} mb={4} flexWrap="wrap" justify="center">
            <Button
              colorScheme="teal"
              onClick={handleDownloadPdf}
              isLoading={isExporting}
              isDisabled={!profile || isLoading}
            >
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              isDisabled={!profile || isLoading}
            >
              Print
            </Button>
          </HStack>

          {isLoading ? (
            <Flex justify="center" py={10}>
              <Spinner size="xl" />
            </Flex>
          ) : !profile ? (
            <Text color="gray.500" textAlign="center">
              Please login and complete your profile first.
            </Text>
          ) : (
            <Box
              ref={cvRef}
              bg="white"
              color="gray.900"
              borderRadius="lg"
              overflow="hidden"
              borderWidth="1px"
            >
              <Box
                px={{ base: 6, md: 10 }}
                py={{ base: 6, md: 8 }}
                bgGradient="linear(to-r, teal.800, gray.900)"
                color="white"
              >
                <Flex justify="space-between" align="flex-start" gap={6} flexWrap="wrap">
                  <Box flex="1" minW={{ base: '100%', md: '360px' }}>
                    <Text fontSize="xs" letterSpacing="0.28em" textTransform="uppercase" opacity={0.9}>
                      ENISRA
                    </Text>
                    <Heading size="lg" mt={2} fontFamily="Georgia, serif">
                      {fullName}
                    </Heading>
                    <Text mt={2} fontSize="sm" opacity={0.95}>
                      {jobLine || 'Employee'}
                    </Text>

                    {headerBadges.length ? (
                      <HStack mt={4} spacing={2} flexWrap="wrap">
                        {headerBadges.map((label) => (
                          <Badge
                            key={label}
                            px={2}
                            py={0.5}
                            bg="whiteAlpha.200"
                            color="white"
                            borderWidth="1px"
                            borderColor="whiteAlpha.300"
                            borderRadius="full"
                          >
                            {label}
                          </Badge>
                        ))}
                      </HStack>
                    ) : null}
                  </Box>

                  <HStack align="flex-start" spacing={6}>
                    <VStack align="flex-end" spacing={1}>
                      <Text fontSize="sm" fontWeight="semibold">
                        {companyWebsite}
                      </Text>
                      {contactEmail ? (
                        <Text fontSize="sm" opacity={0.92}>
                          {contactEmail}
                        </Text>
                      ) : null}
                      {profile?.phone ? (
                        <Text fontSize="sm" opacity={0.92}>
                          {profile.phone}
                        </Text>
                      ) : null}
                      {locationLine ? (
                        <Text fontSize="sm" opacity={0.92}>
                          {locationLine}
                        </Text>
                      ) : null}
                    </VStack>

                    {!isExporting && profile?.photoUrl ? (
                      <Image
                        src={profile.photoUrl}
                        alt="Profile"
                        boxSize="110px"
                        objectFit="cover"
                        borderRadius="md"
                        borderWidth="2px"
                        borderColor="whiteAlpha.700"
                        crossOrigin="anonymous"
                      />
                    ) : null}
                  </HStack>
                </Flex>
              </Box>

              <Flex direction={{ base: 'column', md: 'row' }}>
                <Box
                  width={{ base: '100%', md: '35%' }}
                  bg="gray.50"
                  px={{ base: 6, md: 8 }}
                  py={{ base: 6, md: 8 }}
                  borderRightWidth={{ base: 0, md: '1px' }}
                  borderColor="gray.200"
                >
                  <SectionTitle>Contact</SectionTitle>
                  <VStack align="start" spacing={2} mb={6}>
                    {contactEmail ? <Text fontSize="sm">{contactEmail}</Text> : null}
                    {profile?.phone ? <Text fontSize="sm">{profile.phone}</Text> : null}
                    {addressLine ? <Text fontSize="sm">{addressLine}</Text> : null}
                  </VStack>

                  {profile?.employeeId || profile?.employmentType || profile?.dateOfJoining || profile?.employmentStatus ? (
                    <Box mb={6}>
                      <SectionTitle>Employment</SectionTitle>
                      <VStack align="start" spacing={2}>
                        {profile?.employeeId ? (
                          <Text fontSize="sm">
                            <Text as="span" fontWeight="semibold">
                              ID:
                            </Text>{' '}
                            {profile.employeeId}
                          </Text>
                        ) : null}
                        {profile?.employmentType ? (
                          <Text fontSize="sm">
                            <Text as="span" fontWeight="semibold">
                              Type:
                            </Text>{' '}
                            {profile.employmentType}
                          </Text>
                        ) : null}
                        {joinedLabel ? (
                          <Text fontSize="sm">
                            <Text as="span" fontWeight="semibold">
                              Joined:
                            </Text>{' '}
                            {joinedLabel}
                          </Text>
                        ) : null}
                        {profile?.employmentStatus ? (
                          <Text fontSize="sm">
                            <Text as="span" fontWeight="semibold">
                              Status:
                            </Text>{' '}
                            {profile.employmentStatus}
                          </Text>
                        ) : null}
                      </VStack>
                    </Box>
                  ) : null}

                  {technicalSkills.length ? (
                    <Box mb={6}>
                      <SectionTitle>Technical Skills</SectionTitle>
                      <HStack spacing={2} flexWrap="wrap">
                        {technicalSkills.map((skill) => (
                          <Badge key={skill} colorScheme="blue" variant="subtle">
                            {skill}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  ) : null}

                  {softSkills.length ? (
                    <Box mb={6}>
                      <SectionTitle>Soft Skills</SectionTitle>
                      <HStack spacing={2} flexWrap="wrap">
                        {softSkills.map((skill) => (
                          <Badge key={skill} colorScheme="purple" variant="subtle">
                            {skill}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  ) : null}

                  {languages.length ? (
                    <Box>
                      <SectionTitle>Languages</SectionTitle>
                      <VStack align="start" spacing={2}>
                        {languages.map((lang, idx) => (
                          <Text key={`${lang.language}-${idx}`} fontSize="sm">
                            <Text as="span" fontWeight="semibold">
                              {lang.language}
                            </Text>
                            {lang.proficiency ? ` - ${lang.proficiency}` : ''}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  ) : null}
                </Box>

                <Box flex="1" px={{ base: 6, md: 10 }} py={{ base: 6, md: 8 }}>
                  {experience.length ? (
                    <Box mb={8}>
                      <SectionTitle color="gray.800">Work Experience</SectionTitle>
                      <VStack align="start" spacing={5}>
                        {experience.map((item, idx) => {
                          const dateLabel = [formatMonthYear(item.startDate), formatMonthYear(item.endDate)]
                            .filter(Boolean)
                            .join(' - ');
                          return (
                            <Box key={`${item.previousCompanyName || 'exp'}-${idx}`} width="full">
                              <Text fontWeight="semibold">
                                {item.jobTitle || 'Role'}
                                {item.previousCompanyName ? ` @ ${item.previousCompanyName}` : ''}
                              </Text>
                              {dateLabel ? (
                                <Text fontSize="sm" color="gray.600">
                                  {dateLabel}
                                </Text>
                              ) : null}
                              {item.keyResponsibilities ? (
                                <Text fontSize="sm" mt={2} whiteSpace="pre-wrap">
                                  {item.keyResponsibilities}
                                </Text>
                              ) : null}
                            </Box>
                          );
                        })}
                      </VStack>
                    </Box>
                  ) : null}

                  {education.length ? (
                    <Box mb={8}>
                      <SectionTitle color="gray.800">Education</SectionTitle>
                      <VStack align="start" spacing={4}>
                        {education.map((item, idx) => (
                          <Box key={`${item.institutionName || 'edu'}-${idx}`} width="full">
                            <Text fontWeight="semibold">
                              {[item.highestEducationLevel, item.fieldOfStudy].filter(Boolean).join(' - ') || 'Education'}
                            </Text>
                            {item.institutionName ? (
                              <Text fontSize="sm" color="gray.700">
                                {item.institutionName}
                              </Text>
                            ) : null}
                            {item.graduationYear ? (
                              <Text fontSize="sm" color="gray.600">
                                Graduation Year: {item.graduationYear}
                              </Text>
                            ) : null}
                            {item.certifications ? (
                              <Text fontSize="sm" mt={2} whiteSpace="pre-wrap">
                                Certifications: {item.certifications}
                              </Text>
                            ) : null}
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  ) : null}

                  <Divider my={6} />

                  <Text fontSize="xs" color="gray.500">
                    Generated on {format(new Date(), 'PPP')} | {companyWebsite}
                  </Text>
                </Box>
              </Flex>
            </Box>
          )}
        </Flex>
      </Flex>

      <EmployeeNavDrawer isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default EmployeeCreateCVPage;
