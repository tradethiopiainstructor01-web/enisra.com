import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUserStore } from '../../store/user';
import { MIN_CV_PROFILE_COMPLETION, getEmployeeProfileCompletion } from '../../utils/employeeProfileCompletion';
import apiClient from '../../utils/apiClient';
import {
  downloadBlob,
  isLikelyMobileBrowser,
  openPreparingWindow,
  tryShareBlobAsFile,
} from '../../utils/fileDownload';

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

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const resolveContactPhone = (profile = {}) => {
  const nationalId = (profile?.nationalIdOrPassportNumber || '').toString().trim();
  const phone = (profile?.phone || '').toString().trim();
  const username = (profile?.username || '').toString().trim();
  if (phone && phone !== nationalId) return phone;
  if (username && username !== nationalId) return username;
  return phone || username || '';
};

const buildAddressLine = (profile = {}) => {
  const parts = [profile?.currentAddress, profile?.city, profile?.country]
    .map((v) => (v || '').toString().trim())
    .filter(Boolean);
  return parts.join(', ');
};

const formatFooterDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'MMMM do yyyy');
};

// Function to filter out placeholder/dummy content
const isPlaceholderContent = (text) => {
  if (!text) return true;
  
  const trimmedText = text.toString().trim().toLowerCase();
  
  // Common placeholder patterns
  const placeholderPatterns = [
    'lorem ipsum',
    'et animi',
    'minim amet',
    'ut sint nemo',
    'dolor sit amet',
    'consectetur adipiscing',
    'placeholder',
    'sample text',
    'dummy text',
    'test data',
  ];
  
  // Check if text matches any placeholder pattern
  return placeholderPatterns.some(pattern => {
    if (typeof pattern === 'string') {
      return trimmedText.includes(pattern);
    } else if (pattern instanceof RegExp) {
      return pattern.test(trimmedText);
    }
    return false;
  });
};

// Safe text renderer that filters placeholder content
const SafeText = ({ children, fallback = '', ...props }) => {
  if (!children || isPlaceholderContent(children)) {
    return fallback ? <Text {...props}>{fallback}</Text> : null;
  }
  return <Text {...props}>{children}</Text>;
};

const SectionTitle = ({ children, color = 'teal.600', fontSize = 'xs', withDivider = false }) => (
  <Box mb={withDivider ? 4 : 2}>
    <Text
      fontSize={fontSize}
      fontWeight="bold"
      letterSpacing="0.22em"
      textTransform="uppercase"
      color={color}
      mb={2}
    >
      {children}
    </Text>
    {withDivider && (
      <Box height="2px" width="50px" bg="teal.500" borderRadius="full" />
    )}
  </Box>
);

const EmployeeCreateCV = () => {
  const toast = useToast();
  const currentUser = useUserStore((state) => state.currentUser);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const cvRef = useRef(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedText = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        if (!currentUser?.token) {
          setProfile(null);
          return;
        }
        const res = await apiClient.get('/users/me');
        const payload = res?.data;
        if (!payload?.success || !payload?.data) {
          throw new Error(payload?.message || 'Unable to load profile.');
        }
        setProfile(payload.data);
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
  }, [currentUser?.token, toast]);

  const fullName = useMemo(() => {
    const parts = [profile?.firstName, profile?.middleName, profile?.lastName]
      .map((v) => (v || '').toString().trim())
      .filter(Boolean);
    if (parts.length) return parts.join(' ');
    return profile?.fullName || currentUser?.username || currentUser?.email || 'Employee';
  }, [profile, currentUser]);

  const contactEmail = useMemo(() => {
    return profile?.workEmail || profile?.altEmail || profile?.email || currentUser?.email || '';
  }, [profile, currentUser]);
  const contactPhone = useMemo(() => resolveContactPhone(profile), [profile]);

  const companyWebsite = 'www.enisra.com';

  const education = Array.isArray(profile?.educationBackground)
    ? profile.educationBackground.filter((e) => e && (e.institutionName || e.fieldOfStudy || e.highestEducationLevel) && !isPlaceholderContent(e.institutionName) && !isPlaceholderContent(e.fieldOfStudy))
    : [];

  const experience = Array.isArray(profile?.workExperience)
    ? profile.workExperience.filter((w) => w && (w.previousCompanyName || w.jobTitle) && !isPlaceholderContent(w.previousCompanyName) && !isPlaceholderContent(w.jobTitle))
    : [];

  const technicalSkills = normalizeList(profile?.technicalSkills).filter((skill) => !isPlaceholderContent(skill));
  const softSkills = normalizeList(profile?.softSkills).filter((skill) => !isPlaceholderContent(skill));
  const languages = Array.isArray(profile?.languagesSpoken) ? profile.languagesSpoken.filter((l) => l && l.language && !isPlaceholderContent(l.language)) : [];

  const headerBadges = [
    profile?.jobTitle,
    profile?.department,
    profile?.position,
    profile?.workLocation,
  ]
    .map((v) => (v || '').toString().trim())
    .filter(Boolean)
    .filter(label => !isPlaceholderContent(label));

  const jobLine = [profile?.jobTitle, profile?.department, profile?.position]
    .map((v) => (v || '').toString().trim())
    .filter(Boolean)
    .join(' | ');

  const locationLine = [profile?.city, profile?.country]
    .map((v) => (v || '').toString().trim())
    .filter(Boolean)
    .join(', ');

  const addressLine = buildAddressLine(profile);

  const joinedLabel = safeFormatDate(profile?.hireDate);
  const currentEmploymentRows = [
    { label: 'Job Title', value: profile?.jobTitle },
    { label: 'Department', value: profile?.department },
    { label: 'Position', value: profile?.position },
    { label: 'Employment Type', value: profile?.employmentType },
    { label: 'Employment Status', value: profile?.employmentStatus },
    { label: 'Date of Joining', value: joinedLabel },
    { label: 'Work Location', value: profile?.workLocation },
    { label: 'Reporting Manager', value: profile?.reportingManager },
  ].filter((item) => (item.value || '').toString().trim());
  const profileCompletion = useMemo(() => getEmployeeProfileCompletion(profile), [profile]);
  const canCreateCv = profileCompletion.meetsCvRequirement;
  const missingForCv = profileCompletion.missing.slice(0, 6);

  const handleDownloadPdf = async () => {
    if (!cvRef.current || !canCreateCv) return;

    const filename = `CV_${fullName.replace(/\s+/g, '_')}.pdf`;
    const isMobile = isLikelyMobileBrowser();
    const preparingWindow = isMobile
      ? openPreparingWindow(filename, 'Preparing your CV PDF...')
      : null;

    setIsExporting(true);
    try {
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

      // Add a real PDF footer on every page.
      const footerText = `Generated on ${formatFooterDate(new Date())} | Professional CV created with ENISRA`;
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i += 1) {
        pdf.setPage(i);
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, pdfHeight - 24, pdfWidth, 24, 'F');
        pdf.setDrawColor(220, 226, 234);
        pdf.line(24, pdfHeight - 24, pdfWidth - 24, pdfHeight - 24);
        pdf.setTextColor(90, 104, 121);
        pdf.setFontSize(8);
        pdf.text(footerText, pdfWidth / 2, pdfHeight - 9, { align: 'center' });
      }

      const blob = pdf.output('blob');

      if (isMobile) {
        const shared = await tryShareBlobAsFile(blob, filename, {
          title: filename,
        });
        if (shared) {
          if (preparingWindow && !preparingWindow.closed) preparingWindow.close();
          return;
        }

        // Mobile browsers often block programmatic "downloads". Navigating to the PDF is more reliable.
        const url = URL.createObjectURL(blob);
        setTimeout(() => URL.revokeObjectURL(url), 5 * 60_000);
        if (preparingWindow && !preparingWindow.closed) {
          try {
            preparingWindow.location.href = url;
            if (typeof preparingWindow.focus === 'function') preparingWindow.focus();
            return;
          } catch (error) {
            // Fall through to regular window.open / navigation fallback.
          }
        }

        const opened = window.open(url, '_blank');
        if (!opened) window.location.assign(url);
        return;
      }

      downloadBlob(blob, filename);
    } catch (error) {
      if (preparingWindow && !preparingWindow.closed) {
        try {
          preparingWindow.close();
        } catch (closeError) {
          // ignore
        }
      }
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

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="2xl" boxShadow="lg">
      <CardBody>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ md: 'center' }}
          gap={3}
          mb={5}
        >
          <Box>
            <Heading size="md">Create CV</Heading>
            <Text fontSize="sm" color={mutedText} mt={1}>
              Export a clean CV built from your saved profile.
            </Text>
            {!isLoading && profile ? (
              <HStack spacing={2} mt={2} flexWrap="wrap">
                <Badge colorScheme={canCreateCv ? 'green' : 'orange'}>
                  Profile {profileCompletion.percentage}%
                </Badge>
                {!canCreateCv ? (
                  <Badge colorScheme="red">
                    Minimum {MIN_CV_PROFILE_COMPLETION}% required
                  </Badge>
                ) : null}
              </HStack>
            ) : null}
          </Box>

          <HStack spacing={2} flexWrap="wrap">
            <Button
              colorScheme="teal"
              onClick={handleDownloadPdf}
              isLoading={isExporting}
              isDisabled={!profile || isLoading || !canCreateCv}
            >
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => window.print()} isDisabled={!profile || isLoading || !canCreateCv}>
              Print
            </Button>
          </HStack>
        </Flex>

        {isLoading ? (
          <Flex justify="center" py={10}>
            <Spinner size="xl" />
          </Flex>
        ) : !profile ? (
          <Text color={mutedText}>Please login and complete your profile first.</Text>
        ) : !canCreateCv ? (
          <Box borderWidth="1px" borderColor={borderColor} borderRadius="lg" p={5}>
            <Text fontWeight="semibold" color="orange.500">
              Complete at least {MIN_CV_PROFILE_COMPLETION}% of your profile to build a CV.
            </Text>
            <Text color={mutedText} mt={2}>
              Current completion: {profileCompletion.percentage}%.
            </Text>
            {missingForCv.length ? (
              <Box mt={4}>
                <Text fontSize="sm" fontWeight="semibold">
                  Missing profile sections:
                </Text>
                <VStack align="start" spacing={1} mt={2}>
                  {missingForCv.map((item) => (
                    <Text key={item.key} fontSize="sm" color={mutedText}>
                      - {item.label}
                    </Text>
                  ))}
                </VStack>
                {profileCompletion.missing.length > missingForCv.length ? (
                  <Text fontSize="sm" color={mutedText} mt={2}>
                    ...and {profileCompletion.missing.length - missingForCv.length} more
                  </Text>
                ) : null}
              </Box>
            ) : null}
          </Box>
        ) : (
          <Box ref={cvRef} bg="white" color="gray.900" borderRadius="lg" overflow="hidden" borderWidth="1px" boxShadow="xl">
            {/* Header Section with Modern Design */}
            <Box
              px={{ base: 6, md: 12 }}
              py={{ base: 8, md: 10 }}
              bgGradient="linear(to-r, teal.600, teal.700, blue.600)"
              color="white"
              position="relative"
            >
              {/* Decorative Elements */}
              <Box position="absolute" top="20px" right="20px" opacity="0.1">
                <Box boxSize="80px" borderRadius="full" bg="white" />
              </Box>
              
              <Flex justify="space-between" align="center" gap={8} flexWrap="nowrap">
                <Box flex="1" minW={0}>
                  <HStack align="flex-start" spacing={4}>
                    {profile?.photoUrl ? (
                      <Box
                        boxSize="94px"
                        borderRadius="md"
                        overflow="hidden"
                        borderWidth="3px"
                        borderColor="white"
                        boxShadow="0 10px 25px rgba(0,0,0,0.2)"
                        flexShrink={0}
                      >
                        <Image
                          src={profile.photoUrl}
                          alt="Profile"
                          width="100%"
                          height="100%"
                          objectFit="cover"
                          crossOrigin="anonymous"
                        />
                      </Box>
                    ) : null}

                    <Box minW={0}>
                      <Text
                        fontSize="sm"
                        letterSpacing="0.3em"
                        textTransform="uppercase"
                        opacity={0.9}
                        fontWeight="medium"
                      >
                        Professional Profile
                      </Text>
                      <Heading
                        size="xl"
                        mt={2}
                        fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        fontWeight="700"
                        lineHeight="1.3"
                      >
                        <SafeText fallback="Employee Name">{fullName}</SafeText>
                      </Heading>
                      <Text mt={2} fontSize="lg" opacity={0.95} fontWeight="500" lineHeight="1.35">
                        <SafeText fallback="Professional">{jobLine || 'Professional'}</SafeText>
                      </Text>
                    </Box>
                  </HStack>

                  {profile?.professionalSummary && !isPlaceholderContent(profile.professionalSummary) ? (
                    <Text mt={4} fontSize="md" opacity={0.9} maxW="600px" lineHeight="1.6">
                      {profile.professionalSummary}
                    </Text>
                  ) : null}

                  {headerBadges.length ? (
                    <HStack mt={6} spacing={3} flexWrap="wrap" justify="center">
                      {headerBadges.map((label) => (
                        <Badge
                          key={label}
                          px={3}
                          py={1}
                          bg="whiteAlpha.200"
                          color="white"
                          borderWidth="1px"
                          borderColor="whiteAlpha.300"
                          borderRadius="full"
                          fontSize="sm"
                          fontWeight="500"
                        >
                          {label}
                        </Badge>
                      ))}
                    </HStack>
                  ) : null}
                </Box>

                <VStack align="flex-end" spacing={2} flexShrink={0} minW="340px">
                  <Text fontSize="lg" fontWeight="bold">ENISRA</Text>
                  <Text fontSize="sm" opacity={0.95}>Transforming Business Through Innovation</Text>
                  {contactEmail ? <Text fontSize="sm" opacity={0.92}>{contactEmail}</Text> : null}
                  {contactPhone ? <Text fontSize="sm" opacity={0.92}>Phone: {contactPhone}</Text> : null}
                  {locationLine ? <Text fontSize="sm" opacity={0.92}>Location: {locationLine}</Text> : null}
                  {profile?.website || profile?.linkedin ? (
                    <HStack spacing={3} mt={2}>
                      {profile.website ? <Text fontSize="sm" opacity={0.92}>{profile.website}</Text> : null}
                      {profile.linkedin ? <Text fontSize="sm" opacity={0.92}>LinkedIn</Text> : null}
                    </HStack>
                  ) : null}
                </VStack>
              </Flex>
            </Box>

            <Flex direction={{ base: 'column', md: 'row' }}>
              {/* Sidebar Section */}
              <Box
                width={{ base: '100%', md: '38%' }}
                bg="gray.50"
                px={{ base: 6, md: 8 }}
                py={{ base: 8, md: 10 }}
                borderRightWidth={{ base: 0, md: '1px' }}
                borderColor="gray.200"
              >
                {/* Contact Information */}
                <SectionTitle withDivider>CONTACT</SectionTitle>
                <VStack align="start" spacing={3} mb={8}>
                  {contactEmail && (
                    <Flex align="center" gap={3}>
                      <Box boxSize="8px" borderRadius="full" bg="teal.500" />
                      <Text fontSize="sm" fontWeight="500">{contactEmail}</Text>
                    </Flex>
                  )}
                  {contactPhone && (
                    <Flex align="center" gap={3}>
                      <Box boxSize="8px" borderRadius="full" bg="teal.500" />
                      <Text fontSize="sm" fontWeight="500">{contactPhone}</Text>
                    </Flex>
                  )}
                  {addressLine && (
                    <Flex align="center" gap={3}>
                      <Box boxSize="8px" borderRadius="full" bg="teal.500" />
                      <Text fontSize="sm" fontWeight="500">{addressLine}</Text>
                    </Flex>
                  )}
                </VStack>

                {/* Professional Summary */}
                {profile?.professionalSummary && (
                  <Box mb={8}>
                    <SectionTitle>PROFESSIONAL SUMMARY</SectionTitle>
                    <Text fontSize="sm" lineHeight="1.6" color="gray.700">
                      {profile.professionalSummary}
                    </Text>
                  </Box>
                )}

                {/* Skills Section */}
                {(technicalSkills.length > 0 || softSkills.length > 0) && (
                  <Box mb={8}>
                    <SectionTitle withDivider>SKILLS</SectionTitle>
                    
                    {technicalSkills.length > 0 && (
                      <Box mb={4}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2}>TECHNICAL</Text>
                        <HStack spacing={2} flexWrap="wrap" justify="flex-start" pl={2}>
                          {technicalSkills.map((skill) => (
                            <Badge
                              key={skill} 
                              colorScheme="teal" 
                              variant="solid"
                              borderRadius="full"
                              px={3}
                              py={1}
                              fontSize="xs"
                              fontWeight="500"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                    )}
                    
                    {softSkills.length > 0 && (
                      <Box minW={0}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2}>SOFT SKILLS</Text>
                        <HStack spacing={2} flexWrap="wrap" justify="flex-start" pl={2}>
                          {softSkills.map((skill) => (
                            <Badge
                              key={skill} 
                              colorScheme="purple" 
                              variant="solid"
                              borderRadius="full"
                              px={3}
                              py={1}
                              fontSize="xs"
                              fontWeight="500"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Languages */}
                {languages.length > 0 && (
                  <Box mb={8}>
                    <SectionTitle withDivider>LANGUAGES</SectionTitle>
                    <VStack align="start" spacing={2}>
                      {languages.map((lang, idx) => (
                        <Flex key={`${lang.language}-${idx}`} justify="space-between" w="100%">
                          <Text fontSize="sm" fontWeight="500">
                            {lang.language}
                          </Text>
                          {lang.proficiencyLevel && (
                            <Text fontSize="sm" color="gray.600">
                              {lang.proficiencyLevel}
                            </Text>
                          )}
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Additional Information */}
                {(profile?.nationality || profile?.dateOfBirth || profile?.maritalStatus) && (
                  <Box>
                    <SectionTitle withDivider>PERSONAL</SectionTitle>
                    <VStack align="start" spacing={2}>
                      {profile?.nationality && (
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="semibold">Nationality:</Text> {profile.nationality}
                        </Text>
                      )}
                      {profile?.dateOfBirth && (
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="semibold">Date of Birth:</Text> {safeFormatDate(profile.dateOfBirth)}
                        </Text>
                      )}
                      {profile?.maritalStatus && (
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="semibold">Marital Status:</Text> {profile.maritalStatus}
                        </Text>
                      )}
                    </VStack>
                  </Box>
                )}
              </Box>

              {/* Main Content Section */}
              <Box flex="1" px={{ base: 6, md: 10 }} py={{ base: 8, md: 10 }}>
                {/* Work Experience */}
                {experience.length > 0 && (
                  <Box mb={10}>
                    <SectionTitle color="gray.800" fontSize="sm" withDivider>WORK EXPERIENCE</SectionTitle>
                    <VStack align="start" spacing={6}>
                      {experience.map((item, idx) => {
                        const startLabel = formatMonthYear(item.startDate);
                        const endLabel =
                          item.currentlyEmployed === true || item.currentlyEmployed === 'yes'
                            ? 'Present'
                            : formatMonthYear(item.endDate);
                        const dateLabel = [startLabel, endLabel].filter(Boolean).join(' - ') || 'Present';
                        return (
                          <Box key={`${item.previousCompanyName || 'exp'}-${idx}`} width="full" position="relative" pl={6}>
                            {/* Timeline indicator */}
                            <Box 
                              position="absolute" 
                              left="0" 
                              top="8px" 
                              boxSize="12px" 
                              borderRadius="full" 
                              bg="teal.500" 
                            />
                            <Box 
                              position="absolute" 
                              left="5px" 
                              top="20px" 
                              width="2px" 
                              height="calc(100% + 24px)" 
                              bg="teal.200" 
                            />
                            
                            <Box minW={0}>
                              <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                <SafeText fallback="Role">
                                  {item.jobTitle || 'Role'}
                                </SafeText>
                                {item.previousCompanyName && !isPlaceholderContent(item.previousCompanyName) && (
                                  <Text as="span" fontWeight="normal" color="gray.600"> @ {item.previousCompanyName}</Text>
                                )}
                              </Text>
                              <Text fontSize="sm" color="teal.600" fontWeight="500" mt={1}>
                                {dateLabel}
                              </Text>
                              {item.keyResponsibilities && !isPlaceholderContent(item.keyResponsibilities) && (
                                <Text fontSize="sm" mt={3} lineHeight="1.6" color="gray.700">
                                  {item.keyResponsibilities}
                                </Text>
                              )}
                              {item.achievements && !isPlaceholderContent(item.achievements) && (
                                <Box mt={3}>
                                  <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                                    KEY ACHIEVEMENTS:
                                  </Text>
                                  <Text fontSize="sm" lineHeight="1.5" color="gray.700">
                                    {item.achievements}
                                  </Text>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </VStack>
                  </Box>
                )}

                {/* Current Employment Detail */}
                {currentEmploymentRows.length > 0 && (
                  <Box mb={10}>
                    <SectionTitle color="gray.800" fontSize="sm" withDivider>CURRENT EMPLOYMENT DETAIL</SectionTitle>
                    <VStack align="start" spacing={2} w="full">
                      {currentEmploymentRows.map((row) => (
                        <Text key={row.label} fontSize="sm" color="gray.700">
                          <Text as="span" fontWeight="semibold">{row.label}:</Text> {row.value}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Education */}
                {education.length > 0 && (
                  <Box mb={10}>
                    <SectionTitle color="gray.800" fontSize="sm" withDivider>EDUCATION</SectionTitle>
                    <VStack align="start" spacing={5}>
                      {education.map((item, idx) => (
                        <Box key={`${item.institutionName || 'edu'}-${idx}`} width="full" position="relative" pl={6}>
                          {/* Education indicator */}
                          <Box 
                            position="absolute" 
                            left="0" 
                            top="8px" 
                            boxSize="12px" 
                            borderRadius="full" 
                            bg="blue.500" 
                          />
                          
                          <Box minW={0}>
                            <Text fontWeight="bold" fontSize="lg" color="gray.800">
                              <SafeText fallback="Education">
                                {[item.highestEducationLevel, item.fieldOfStudy].filter(Boolean).join(' - ') || 'Education'}
                              </SafeText>
                            </Text>
                            {item.institutionName && !isPlaceholderContent(item.institutionName) && (
                              <Text fontSize="md" color="blue.600" fontWeight="500" mt={1}>
                                {item.institutionName}
                              </Text>
                            )}
                            {item.graduationYear && (
                              <Text fontSize="sm" color="gray.600" mt={1}>
                                Graduated: {item.graduationYear}
                              </Text>
                            )}
                            {item.gpa && (
                              <Text fontSize="sm" color="gray.600">
                                GPA: {item.gpa}
                              </Text>
                            )}
                            {item.certifications && !isPlaceholderContent(item.certifications) && (
                              <Box mt={3}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                                  CERTIFICATIONS:
                                </Text>
                                <Text fontSize="sm" lineHeight="1.5" color="gray.700">
                                  {item.certifications}
                                </Text>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Projects (if available) */}
                {profile?.projects && profile.projects.length > 0 && (
                  <Box mb={10}>
                    <SectionTitle color="gray.800" fontSize="sm" withDivider>PROJECTS</SectionTitle>
                    <VStack align="start" spacing={4}>
                      {profile.projects.map((project, idx) => (
                        <Box key={`project-${idx}`} width="full">
                          <Text fontWeight="bold" fontSize="md" color="gray.800">
                            <SafeText fallback={`Project ${idx + 1}`}>
                              {project.name}
                            </SafeText>
                          </Text>
                          {project.description && !isPlaceholderContent(project.description) && (
                            <Text fontSize="sm" mt={2} lineHeight="1.5" color="gray.700">
                              {project.description}
                            </Text>
                          )}
                          {project.technologies && project.technologies.length > 0 && (
                            <HStack spacing={2} mt={2} flexWrap="wrap">
                              {project.technologies
                                .filter(tech => !isPlaceholderContent(tech))
                                .map((tech, techIdx) => (
                                  <Badge 
                                    key={`tech-${techIdx}`} 
                                    colorScheme="green" 
                                    variant="subtle"
                                    fontSize="xs"
                                  >
                                    {tech}
                                  </Badge>
                                ))}
                            </HStack>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Footer text is stamped directly into the PDF at export time. */}
              </Box>
            </Flex>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};

export default EmployeeCreateCV;
