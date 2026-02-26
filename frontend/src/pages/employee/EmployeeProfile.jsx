import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Link,
  Progress,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import {
  FiBriefcase,
  FiCamera,
  FiDownload,
  FiEdit,
  FiExternalLink,
  FiFileText,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiUser,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import { useUserStore } from '../../store/user';
import EmployeeInfoForm from '../EmployeeInfoForm';
import { MIN_CV_PROFILE_COMPLETION, getEmployeeProfileCompletion } from '../../utils/employeeProfileCompletion';

const safeFormatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'PPP');
};

const resolveContactPhone = (user = {}) => {
  const nationalId = (user?.nationalIdOrPassportNumber || '').toString().trim();
  const phone = (user?.phone || '').toString().trim();
  const username = (user?.username || '').toString().trim();

  if (phone && phone !== nationalId) return phone;
  if (username && username !== nationalId) return username;
  return phone || username || '';
};

const resolveCurrentAddress = (user = {}) => {
  const nationalId = (user?.nationalIdOrPassportNumber || '').toString().trim();
  const primary = (user?.currentAddress || '').toString().trim();
  const fallback = (user?.location || '').toString().trim();

  if (primary && primary !== nationalId) return primary;
  if (fallback && fallback !== nationalId) return fallback;
  return primary || fallback || '';
};

const toTitleCase = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const buildAddressLine = (user = {}) => {
  const rawParts = [resolveCurrentAddress(user), user?.city, user?.country]
    .map((value) => (value || '').toString().trim())
    .filter(Boolean)
    .flatMap((value) => value.split(',').map((part) => part.trim()).filter(Boolean));

  const seen = new Set();
  const uniqueParts = [];

  for (const part of rawParts) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueParts.push(toTitleCase(part));
  }

  return uniqueParts.join(', ');
};

const InfoItem = ({ label, value }) => (
  <Box>
    <Text fontSize="xs" letterSpacing="0.14em" textTransform="uppercase" color="gray.500">
      {label}
    </Text>
    <Text fontSize="sm" fontWeight="semibold" mt={1}>
      {value || '-'}
    </Text>
  </Box>
);

const DocLink = ({ label, href }) => (
  <Flex align="center" justify="space-between" gap={3}>
    <Text fontSize="sm">{label}</Text>
    {href ? (
      <Link href={href} isExternal color="teal.600" fontSize="sm">
        View <Icon as={FiExternalLink} mb="-1px" ml={1} />
      </Link>
    ) : (
      <Text fontSize="sm" color="gray.500">
        Not uploaded
      </Text>
    )}
  </Flex>
);

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const currentUser = useUserStore((s) => s.currentUser);
  const setCurrentUser = useUserStore((s) => s.setCurrentUser);
  const toast = useToast();
  const avatarInputRef = useRef(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const sectionCardBg = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedText = useColorModeValue('gray.600', 'gray.300');
  const heroGradient = useColorModeValue(
    'linear(to-r, teal.600, cyan.600)',
    'linear(to-r, teal.700, cyan.700)'
  );

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const resolvedUserId = profile?._id || currentUser?._id || localStorage.getItem('userId');

  const fetchProfile = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/users/me', { signal });
      const payload = res?.data;
      const profileData = payload?.data;
      if (!payload?.success || !profileData) {
        throw new Error(payload?.message || 'Unable to load profile.');
      }
      setProfile(profileData);
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      setError(err?.message || 'Unable to load profile.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProfile(controller.signal);
    return () => controller.abort();
  }, [fetchProfile]);

  useEffect(() => {
    const onUpdated = () => {
      const controller = new AbortController();
      fetchProfile(controller.signal);
    };
    window.addEventListener('employee-profile-updated', onUpdated);
    return () => window.removeEventListener('employee-profile-updated', onUpdated);
  }, [fetchProfile]);

  const triggerAvatarPicker = () => {
    if (isAvatarUploading) return;
    if (avatarInputRef.current) avatarInputRef.current.click();
  };

  const handleAvatarKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerAvatarPicker();
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !resolvedUserId) return;

    setIsAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('userId', resolvedUserId);
      formData.append('photo', file);

      const response = await apiClient.post('/upload-info', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = response?.data?.user || {};
      const newPhotoUrl = updatedUser.photoUrl || profile?.photoUrl || '';

      setProfile((prev) => ({
        ...(prev || {}),
        ...updatedUser,
        photoUrl: newPhotoUrl,
      }));

      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          photo: updatedUser.photo ?? currentUser.photo,
          photoUrl: newPhotoUrl || currentUser.photoUrl,
          token: currentUser.token,
        });
      }

      window.dispatchEvent(new Event('employee-profile-updated'));

      toast({
        title: 'Profile image updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError?.response?.data?.message || uploadError?.message || 'Could not update profile image.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsAvatarUploading(false);
      event.target.value = '';
    }
  };

  const fullName = useMemo(() => {
    const parts = [profile?.firstName, profile?.middleName, profile?.lastName]
      .map((v) => (v || '').toString().trim())
      .filter(Boolean);
    if (parts.length) return parts.join(' ');
    return profile?.fullName || currentUser?.username || currentUser?.email || 'Employee';
  }, [profile, currentUser]);

  const subtitle = useMemo(() => {
    const pieces = [profile?.jobTitle, profile?.department, profile?.position]
      .map((v) => (v || '').toString().trim())
      .filter(Boolean);
    return pieces.length ? pieces.join(' | ') : 'Profile overview';
  }, [profile]);

  const locationLine = useMemo(() => {
    const pieces = [profile?.city, profile?.country]
      .map((v) => (v || '').toString().trim())
      .filter(Boolean);
    return pieces.join(', ');
  }, [profile]);

  const addressLine = useMemo(() => buildAddressLine(profile), [profile]);

  const contactPhone = useMemo(() => resolveContactPhone(profile), [profile]);

  const isInfoComplete = (profile?.infoStatus || '').toString().toLowerCase() === 'completed';
  const profileCompletion = useMemo(() => getEmployeeProfileCompletion(profile), [profile]);
  const canCreateCv = Boolean(profile) && !loading && profileCompletion.meetsCvRequirement;
  const cvRequirementMessage = `Complete at least ${MIN_CV_PROFILE_COMPLETION}% of your profile to create a CV. Current completion: ${profileCompletion.percentage}%.`;

  return (
    <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="teal">
      <TabList>
        <Tab>Overview</Tab>
        <Tab>Edit profile</Tab>
      </TabList>

      <TabPanels>
        <TabPanel px={0} pt={6}>
          <Card
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="lg"
          >
            <Box bgGradient={heroGradient} color="white" px={{ base: 5, md: 8 }} py={{ base: 6, md: 7 }}>
              <Flex justify="space-between" align="flex-start" gap={6} flexWrap="wrap">
                <HStack spacing={4} align="center">
                  {loading ? (
                    <SkeletonCircle size="12" />
                  ) : (
                    <Box position="relative">
                      <Box
                        role="button"
                        tabIndex={0}
                        onClick={triggerAvatarPicker}
                        onKeyDown={handleAvatarKeyDown}
                        aria-label="Change profile image"
                        cursor={isAvatarUploading ? 'not-allowed' : 'pointer'}
                        opacity={isAvatarUploading ? 0.75 : 1}
                      >
                        <Avatar
                          size="lg"
                          name={fullName}
                          src={profile?.photoUrl || undefined}
                          icon={<FiUser />}
                          bg="whiteAlpha.300"
                          borderWidth="2px"
                          borderColor="whiteAlpha.700"
                        />
                      </Box>
                      <Box
                        position="absolute"
                        right="-1"
                        bottom="-1"
                        bg="white"
                        color="teal.600"
                        borderRadius="full"
                        borderWidth="1px"
                        borderColor="teal.100"
                        p={1}
                        boxShadow="sm"
                      >
                        {isAvatarUploading ? <Spinner size="xs" thickness="2px" /> : <Icon as={FiCamera} boxSize={3.5} />}
                      </Box>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                      />
                    </Box>
                  )}
                  <Box>
                    <Text fontSize="xs" letterSpacing="0.22em" textTransform="uppercase" opacity={0.9}>
                      www.enisra.com
                    </Text>
                    <Heading size="lg" mt={1} fontFamily="Georgia, serif">
                      {loading ? <Skeleton height="28px" width="240px" /> : fullName}
                    </Heading>
                    <Text mt={2} opacity={0.92}>
                      {loading ? <Skeleton height="18px" width="320px" /> : subtitle}
                    </Text>
                    <HStack spacing={2} mt={3} flexWrap="wrap">
                      <Badge bg="whiteAlpha.200" borderWidth="1px" borderColor="whiteAlpha.300" borderRadius="full">
                        {profile?.employeeId ? `ID: ${profile.employeeId}` : 'Employee'}
                      </Badge>
                      <Badge bg="whiteAlpha.200" borderWidth="1px" borderColor="whiteAlpha.300" borderRadius="full">
                        {profile?.status || currentUser?.status || 'active'}
                      </Badge>
                      <Badge bg="whiteAlpha.200" borderWidth="1px" borderColor="whiteAlpha.300" borderRadius="full">
                        {loading ? 'Profile --' : `Profile ${profileCompletion.percentage}%`}
                      </Badge>
                      <Badge bg="whiteAlpha.200" borderWidth="1px" borderColor="whiteAlpha.300" borderRadius="full">
                        {isInfoComplete ? 'Profile completed' : 'Profile pending'}
                      </Badge>
                    </HStack>

                    {!loading ? (
                      <Box mt={4} maxW={{ base: '100%', md: '420px' }}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight="semibold" opacity={0.95}>
                            Completion
                          </Text>
                          <Badge colorScheme={canCreateCv ? 'green' : 'orange'}>
                            {canCreateCv ? 'CV unlocked' : `CV locked (${MIN_CV_PROFILE_COMPLETION}% required)`}
                          </Badge>
                        </HStack>
                        <Box position="relative">
                          <Progress
                            value={profileCompletion.percentage}
                            colorScheme={canCreateCv ? 'green' : 'orange'}
                            size="lg"
                            borderRadius="md"
                            bg="whiteAlpha.200"
                          />
                          <Box
                            position="absolute"
                            left={`${MIN_CV_PROFILE_COMPLETION}%`}
                            top={0}
                            height="100%"
                            width="2px"
                            bg="red.300"
                            transform="translateX(-1px)"
                            borderRadius="full"
                          />
                        </Box>
                        {!canCreateCv ? (
                          <Text mt={2} fontSize="sm" opacity={0.92}>
                            {cvRequirementMessage}
                          </Text>
                        ) : null}
                      </Box>
                    ) : null}
                  </Box>
                </HStack>

                <Stack spacing={2} align={{ base: 'stretch', md: 'flex-end' }}>
                  <HStack spacing={2} flexWrap="wrap">
                    <Button
                      leftIcon={<Icon as={FiRefreshCw} />}
                      variant="outline"
                      size="sm"
                      onClick={() => fetchProfile()}
                      isLoading={loading}
                    >
                      Refresh
                    </Button>
                    <Button
                      leftIcon={<Icon as={FiEdit} />}
                      variant="solid"
                      colorScheme="blackAlpha"
                      size="sm"
                      onClick={() => setActiveTab(1)}
                    >
                      Edit profile
                    </Button>
                    <Button
                      leftIcon={<Icon as={FiBriefcase} />}
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/employee/jobs')}
                    >
                      Jobs
                    </Button>
                    <Button
                      leftIcon={<Icon as={FiFileText} />}
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/employee/create-cv')}
                      isDisabled={!canCreateCv}
                    >
                      Create CV
                    </Button>
                  </HStack>
                  {!loading && profile && !canCreateCv ? (
                    <Text fontSize="xs" color="orange.100" maxW="340px">
                      {cvRequirementMessage}
                    </Text>
                  ) : null}
                </Stack>
              </Flex>
            </Box>

            <CardBody px={{ base: 5, md: 8 }} py={{ base: 6, md: 7 }}>
              {error ? (
                <Text color="red.500" mb={4}>
                  {error}
                </Text>
              ) : null}

              {loading ? (
                <Stack spacing={6}>
                  <SkeletonText noOfLines={3} spacing="3" />
                  <SkeletonText noOfLines={5} spacing="3" />
                </Stack>
              ) : (
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  <Card bg={sectionCardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl">
                    <CardBody>
                      <Heading size="sm" mb={4}>
                        Contact
                      </Heading>
                      <Stack spacing={3}>
                        <HStack spacing={3} align="flex-start">
                          <Icon as={FiMail} color={mutedText} mt={0.5} />
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold">
                              Work email
                            </Text>
                            <Text fontSize="sm" color={mutedText}>
                              {profile?.email || '-'}
                            </Text>
                            <Text fontSize="sm" fontWeight="semibold" mt={2}>
                              Personal email
                            </Text>
                            <Text fontSize="sm" color={mutedText}>
                              {profile?.altEmail || '-'}
                            </Text>
                          </Box>
                        </HStack>

                        <HStack spacing={3} align="flex-start">
                          <Icon as={FiPhone} color={mutedText} mt={0.5} />
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold">
                              Phone
                            </Text>
                            <Text fontSize="sm" color={mutedText}>
                              {contactPhone || '-'}
                            </Text>
                            <Text fontSize="sm" fontWeight="semibold" mt={2}>
                              Emergency contact
                            </Text>
                            <Text fontSize="sm" color={mutedText}>
                              {[profile?.emergencyContactName, profile?.altPhone].filter(Boolean).join(' | ') || '-'}
                            </Text>
                          </Box>
                        </HStack>

                        <HStack spacing={3} align="flex-start">
                          <Icon as={FiMapPin} color={mutedText} mt={0.5} />
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold">
                              Address
                            </Text>
                            <Text fontSize="sm" color={mutedText}>
                              {addressLine || '-'}
                            </Text>
                          </Box>
                        </HStack>
                      </Stack>
                    </CardBody>
                  </Card>

                  <Card bg={sectionCardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl">
                    <CardBody>
                      <Heading size="sm" mb={4}>
                        Current Employment Details
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <InfoItem label="Employee ID" value={profile?.employeeId} />
                        <InfoItem label="Job title" value={profile?.jobTitle} />
                        <InfoItem label="Department" value={profile?.department} />
                        <InfoItem label="Role / position" value={profile?.position} />
                        <InfoItem label="Employment type" value={profile?.employmentType} />
                        <InfoItem label="Work location" value={profile?.workLocation} />
                        <InfoItem label="Reporting manager" value={profile?.reportingManager} />
                        <InfoItem label="Joined" value={safeFormatDate(profile?.hireDate)} />
                        <InfoItem label="Employment status" value={profile?.employmentStatus} />
                        <InfoItem label="City / country" value={locationLine} />
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  <Card bg={sectionCardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl">
                    <CardBody>
                      <Heading size="sm" mb={4}>
                        Personal
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <InfoItem label="First name" value={profile?.firstName} />
                        <InfoItem label="Middle name" value={profile?.middleName} />
                        <InfoItem label="Last name" value={profile?.lastName} />
                        <InfoItem label="Gender" value={profile?.gender} />
                        <InfoItem label="Date of birth" value={safeFormatDate(profile?.dateOfBirth)} />
                        <InfoItem label="Nationality" value={profile?.nationality} />
                        <InfoItem label="Marital status" value={profile?.maritalStatus} />
                        <InfoItem label="Fayda Registration Number" value={profile?.nationalIdOrPassportNumber} />
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  <Card bg={sectionCardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl">
                    <CardBody>
                      <Heading size="sm" mb={4}>
                        Documents
                      </Heading>
                      <Stack spacing={3}>
                        <DocLink label="CV / Resume" href={profile?.cvResumeUrl} />
                        <DocLink label="ID / Passport" href={profile?.idPassportUrl} />
                        <DocLink label="Contract document" href={profile?.contractDocumentUrl} />
                      </Stack>
                      <Divider my={4} />
                      <Text fontSize="sm" color={mutedText}>
                        Upload files in the profile form to keep your documents up to date.
                      </Text>
                      <Button
                        leftIcon={<Icon as={FiDownload} />}
                        size="sm"
                        mt={4}
                        variant="outline"
                        onClick={() => navigate('/employee/create-cv')}
                        isDisabled={!canCreateCv}
                      >
                        Download CV PDF
                      </Button>
                      {!loading && profile && !canCreateCv ? (
                        <Text fontSize="xs" color={mutedText} mt={2}>
                          {cvRequirementMessage}
                        </Text>
                      ) : null}
                    </CardBody>
                  </Card>
                </SimpleGrid>
              )}
            </CardBody>
          </Card>
        </TabPanel>

        <TabPanel px={0} pt={6}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="2xl" boxShadow="lg">
            <CardBody>
              <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap={3} wrap="wrap" mb={6}>
                <Box>
                  <Heading size="md">Edit profile</Heading>
                  <Text fontSize="sm" color={mutedText} mt={1}>
                    Save changes to update your profile in the backend.
                  </Text>
                </Box>
                <Button
                  leftIcon={<Icon as={FiFileText} />}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/employee/create-cv')}
                  isDisabled={!canCreateCv}
                >
                  Create CV
                </Button>
              </Flex>

              <EmployeeInfoForm />
            </CardBody>
          </Card>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default EmployeeProfile;
