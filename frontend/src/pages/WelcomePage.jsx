import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Link as ChakraLink,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FaBell,
  FaCheckCircle,
  FaChevronDown,
  FaGlobe,
  FaGraduationCap,
  FaMedal,
  FaSearch,
  FaShieldAlt,
  FaTelegramPlane,
  FaUserCircle,
  FaLinkedin,
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient.js';

const heroCards = [
  {
    id: 1,
    title: '🔍 Search Jobs',
    subtitle: 'Local & International',
    cta: 'Browse Jobs',
    icon: FaSearch,
    description: 'Refine by skill, location, salary, and remote preferences.',
  },
  {
    id: 2,
    title: '🌍 International Jobs',
    subtitle: 'Top destinations',
    cta: 'View International Jobs',
    icon: FaGlobe,
    flags: ['🇺🇸', '🇨🇦', '🇦🇪', '🇬🇧', '🇰🇪', '🇳🇱'],
  },
  {
    id: 3,
    title: '🎁 Win Training Scholarship',
    subtitle: 'Limited slots, high impact reward',
    cta: 'Apply & Get Selected',
    icon: FaMedal,
    highlight: true,
  },
];

const themeColors = {
  primaryGreen: '#4F7F3A',
  primaryGreenHover: '#3E6A2F',
  softGreenBg: '#E9F3E4',
  primaryGold: '#D9A441',
  primaryGoldHover: '#C28E2C',
  softGoldBg: '#FFF4DC',
  primaryBlue: '#3B82F6',
  softBlueBg: '#EAF1FF',
  bgMain: '#F7F8FA',
  cardBg: '#FFFFFF',
  border: '#E5E7EB',
  sectionDivider: '#D1D5DB',
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  placeholder: '#9CA3AF',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#2563EB',
};

const jobList = [
  {
    id: 1,
    title: 'Warehouse Assistant',
    location: 'Dubai, UAE',
    flag: '🇦🇪',
    deadline: '7 days left',
    verified: true,
  },
  {
    id: 2,
    title: 'Customer Success Rep',
    location: 'Addis Ababa, Ethiopia',
    flag: '🇪🇹',
    deadline: '4 days left',
    verified: true,
  },
  {
    id: 3,
    title: 'Sales Associate',
    location: 'Nairobi, Kenya',
    flag: '🇰🇪',
    deadline: '10 days left',
    verified: false,
  },
  {
    id: 4,
    title: 'Data Analyst',
    location: 'Toronto, Canada',
    flag: '🇨🇦',
    deadline: '2 days left',
    verified: true,
  },
];

const employerProfileDefaults = {
  name: 'Enisra Talent & Placement',
  logo: '/logo.jpg',
  industry: 'Talent solutions, career services & international placement',
  size: '200–500 employees',
  locations: ['Addis Ababa, Ethiopia', 'Dubai, UAE', 'Remote global team'],
  description:
    'We build trusted bridges between Ethiopian talent and international employers by blending data, coaching, and local insight.',
  website: 'https://enisra.com',
  social: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/company/enisra', icon: FaLinkedin },
    { label: 'Telegram', url: 'https://t.me/enisrajobmatching', icon: FaTelegramPlane },
  ],
  verified: true,
  dashboardUrl: '/employer/dashboard',
  profileEditUrl: '/employer/profile/edit',
};

const socialIconMap = {
  LinkedIn: FaLinkedin,
  Telegram: FaTelegramPlane,
};

const normalizeEmployerProfile = (rawProfile = {}) => {
  const mergedProfile = {
    ...employerProfileDefaults,
    ...rawProfile,
  };

  mergedProfile.social = (rawProfile.social || employerProfileDefaults.social).map((social) => ({
    ...social,
    icon: social.icon || socialIconMap[social.label] || FaGlobe,
  }));

  return mergedProfile;
};

const trainingHighlights = [
  'CV Writing',
  'Interview Skills',
  'Digital Skills for Jobs',
  'International Job Readiness',
];

const navFilters = ['Location', 'Category', 'Job Type'];
const heroImageUrl = '/assets/hero-people.png';

const WelcomePage = () => {
  const {
    bgMain,
    cardBg,
    border,
    sectionDivider,
    textPrimary,
    textSecondary,
    textMuted,
    placeholder,
    primaryGreen,
    primaryGreenHover,
    softGreenBg,
    primaryGold,
    primaryGoldHover,
    softGoldBg,
    primaryBlue,
    softBlueBg,
    success,
    warning,
    info,
  } = themeColors;

  const [employerProfile, setEmployerProfile] = useState(employerProfileDefaults);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('employer-profile');
        if (!isMounted) return;

        const fetchedProfile = response?.data?.data;
        if (response?.data?.success && fetchedProfile) {
          setEmployerProfile(normalizeEmployerProfile(fetchedProfile));
          setProfileError(null);
        } else if (fetchedProfile) {
          setEmployerProfile(normalizeEmployerProfile(fetchedProfile));
          setProfileError(response?.data?.message || null);
        } else {
          setProfileError('Employer profile unavailable right now.');
        }
      } catch (error) {
        if (!isMounted) return;
        setProfileError(error?.message || 'Failed to load employer profile');
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box minH="100vh" bg={bgMain} color={textPrimary}>
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={50}
        bg={cardBg}
        borderBottom="1px solid"
        borderColor={border}
        boxShadow="sm"
      >
        <Container maxW="7xl" py={4}>
          <Flex align="center" gap={6}>
            <HStack spacing={3}>
              <Icon as={FaShieldAlt} boxSize={6} color={primaryGreen} />
              <Heading size="lg" letterSpacing="tight">
                Enisra
              </Heading>
            </HStack>

            <Stack flex={1} spacing={3}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search jobs, scholarships, trainings..."
                  bg={softGreenBg}
                  borderColor={border}
                  borderRadius="full"
                  size="lg"
                  color={textPrimary}
                  _focus={{ borderColor: primaryGreen }}
                  _placeholder={{ color: placeholder }}
                />
              </InputGroup>
              <Flex gap={3}>
                {navFilters.map((filter) => (
                  <Select
                    key={filter}
                    placeholder={filter}
                    size="sm"
                    bg={softGreenBg}
                    borderColor={border}
                    _focus={{ borderColor: primaryGreen }}
                    _hover={{ borderColor: primaryGreen }}
                    color={textPrimary}
                  >
                    <option value="any">Any {filter}</option>
                    <option value="primary">Top {filter}</option>
                  </Select>
                ))}
              </Flex>
            </Stack>

            <HStack spacing={3}>
              <IconButton
                aria-label="Notifications"
                icon={<FaBell />}
                variant="ghost"
                color={primaryGreen}
                _hover={{ bg: softGreenBg }}
              />
              <HStack spacing={2}>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                  size="sm"
                  color={textPrimary}
                >
                  Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  size="sm"
                  bg={primaryGreen}
                  color="white"
                  borderRadius="full"
                  _hover={{ bg: primaryGreenHover }}
                >
                  Register
                </Button>
              </HStack>
              <IconButton
                aria-label="Go to dashboard"
                icon={<FaUserCircle />}
                variant="outline"
                size="sm"
                borderColor={border}
                color={textPrimary}
                _hover={{ borderColor: primaryGreen }}
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

        <Box as="main">
          <Box py={12} bg={softGoldBg}>
          <Container maxW="7xl">
            <SimpleGrid columns={{ base: 1, lg: 2 }} alignItems="center" spacing={10} mb={10}>
              <Stack spacing={4}>
                <Heading size="2xl" color={textPrimary}>
                  Enisra connects you to trusted jobs + scholarships.
                </Heading>
                <Text color={textSecondary} fontSize="lg">
                  Scan curated listings, join Telegram alerts, and secure verified international placements with ease.
                </Text>
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} align="center">
                  <Button
                    as={RouterLink}
                    to="/register"
                    w="fit-content"
                    bg={primaryGreen}
                    color="white"
                    borderRadius="full"
                    _hover={{ bg: primaryGreenHover }}
                    boxShadow="lg"
                  >
                    Register as Employer
                  </Button>
                  <Button
                    w="fit-content"
                    variant="outline"
                    color={primaryGreen}
                    borderRadius="full"
                    _hover={{ bg: softGreenBg }}
                  >
                    Browse trusted jobs
                  </Button>
                </Stack>
                <HStack spacing={3} mt={4}>
                  <Badge colorScheme="green" borderRadius="full">
                    HR-safe
                  </Badge>
                  <Text color={textSecondary} fontSize="sm">
                    Trusted by over 1,200 employers
                  </Text>
                </HStack>
              </Stack>
              <Box
                borderRadius="xl"
                overflow="hidden"
                boxShadow="dark-lg"
                bg="white"
                position="relative"
              >
                <Center
                  position="absolute"
                  inset={0}
                  bgGradient="linear(to-br, rgba(247, 248, 250, 0.85), rgba(233, 243, 228, 0.8))"
                  mixBlendMode="soft-light"
                  pointerEvents="none"
                />
                <Image
                  src={heroImageUrl}
                  alt="Three professionals reviewing a phone"
                  objectFit="cover"
                  width="100%"
                  height="100%"
                />
              </Box>
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              {heroCards.map((card) => {
                const isHighlight = card.highlight;
                return (
                  <Box
                    key={card.id}
                    bg={isHighlight ? undefined : cardBg}
                    borderWidth={isHighlight ? 0 : '1px'}
                    borderColor={isHighlight ? 'transparent' : border}
                    bgGradient={
                      isHighlight
                        ? `linear(to-br, ${primaryGold}, ${primaryGoldHover})`
                        : undefined
                    }
                    color={isHighlight ? 'white' : textPrimary}
                    p={6}
                    borderRadius="xl"
                    boxShadow="xl"
                    transition="border-color 0.3s ease, transform 0.3s ease"
                    _hover={{
                      borderColor: isHighlight ? border : primaryGreen,
                      transform: 'translateY(-2px)',
                    }}
                  >
                    <Flex align="center" justify="space-between">
                      <Heading size="md" color={isHighlight ? 'white' : textPrimary}>
                        {card.title}
                      </Heading>
                      <Icon as={card.icon} boxSize={6} color={isHighlight ? 'white' : primaryGreen} />
                    </Flex>
                    <Text mt={4} fontSize="sm" color={isHighlight ? 'rgba(255,255,255,0.8)' : textSecondary}>
                      {card.subtitle}
                    </Text>
                    {card.description && (
                      <Text my={4} fontSize="sm" color={isHighlight ? 'rgba(255,255,255,0.8)' : textMuted}>
                        {card.description}
                      </Text>
                    )}
                    {card.flags && (
                      <HStack mt={4} spacing={2}>
                        {card.flags.map((flag) => (
                          <Center
                            key={flag}
                            w={8}
                            h={8}
                            bg={softBlueBg}
                            borderRadius="md"
                          >
                            <Text fontSize="xl">{flag}</Text>
                          </Center>
                        ))}
                      </HStack>
                    )}
                    <Button
                      mt={6}
                      size="sm"
                      borderRadius="full"
                      bg={isHighlight ? primaryGold : primaryGreen}
                      color="white"
                      _hover={{
                        bg: isHighlight ? primaryGoldHover : primaryGreenHover,
                      }}
                    >
                      {card.cta}
                    </Button>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Container>
        </Box>

        <Container maxW="7xl" py={12}>
          <Box
            bg={cardBg}
            borderRadius="2xl"
            p={6}
            boxShadow="xl"
            border="1px solid"
            borderColor={border}
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align="flex-start"
              justify="space-between"
              gap={6}
              mb={4}
            >
              <HStack align="center" spacing={4}>
                <Box
                  boxSize={16}
                  borderRadius="xl"
                  overflow="hidden"
                  border="1px solid"
                  borderColor={softGreenBg}
                  bg={softGreenBg}
                >
                  <Image
                    src={employerProfile.logo}
                    alt={`${employerProfile.name} logo`}
                    boxSize={16}
                    objectFit="cover"
                  />
                </Box>
                <VStack align="flex-start" spacing={0}>
                  <Flex align="center" gap={2}>
                    <Heading size="lg" color={textPrimary}>
                      {employerProfile.name}
                    </Heading>
                    {employerProfile.verified && (
                      <Badge colorScheme="green" borderRadius="full">
                        Verified
                      </Badge>
                    )}
                  </Flex>
                  <Text fontSize="sm" color={textSecondary} maxW="lg">
                    {employerProfile.industry}
                  </Text>
                </VStack>
              </HStack>
              <Flex gap={4} flexWrap="wrap">
                <Badge variant="solid" colorScheme="green" borderRadius="full">
                  Company size: {employerProfile.size}
                </Badge>
                <Badge variant="subtle" colorScheme="teal" borderRadius="full">
                  HR verified
                </Badge>
              </Flex>
            </Flex>

            <Text mb={4} color={textSecondary}>
              {employerProfile.description}
            </Text>

            {profileLoading && (
              <Flex align="center" gap={2} mb={4}>
                <Spinner size="sm" color={primaryGreen} />
                <Text fontSize="sm" color={textSecondary}>
                  Loading employer profile…
                </Text>
              </Flex>
            )}
            {profileError && (
              <Text fontSize="sm" color={warning} mb={4}>
                {profileError}
              </Text>
            )}

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
              <Box>
                <Text fontSize="xs" color={textMuted}>
                  Headquarters
                </Text>
                <Text fontWeight="semibold" color={textPrimary}>
                  {employerProfile.locations[0]}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={textMuted}>
                  Additional presence
                </Text>
                <Text fontWeight="semibold" color={textPrimary}>
                  {employerProfile.locations.slice(1).join(' · ')}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={textMuted}>
                  Status
                </Text>
                <Text fontWeight="semibold" color={textPrimary}>
                  Trusted Partner for Ethiopia
                </Text>
              </Box>
            </SimpleGrid>

            <Divider borderColor={sectionDivider} mb={4} />

            <Flex direction={{ base: 'column', md: 'row' }} gap={6} align="center" flexWrap="wrap">
              <Stack spacing={1}>
                <Text fontSize="xs" color={textMuted}>
                  Website
                </Text>
                <ChakraLink
                  href={employerProfile.website}
                  isExternal
                  fontWeight="semibold"
                  color={primaryBlue}
                >
                  {employerProfile.website}
                </ChakraLink>
              </Stack>
              <Stack direction="row" spacing={4} flexWrap="wrap">
                {employerProfile.social.map((social) => (
                  <ChakraLink
                    key={social.label}
                    href={social.url}
                    isExternal
                    display="inline-flex"
                    alignItems="center"
                    gap={2}
                    fontWeight="medium"
                    color={textPrimary}
                  >
                    <Icon as={social.icon} boxSize={4} />
                    {social.label}
                  </ChakraLink>
                ))}
              </Stack>
            </Flex>
            <Flex mt={6} gap={3} flexWrap="wrap">
              <Button
                as={RouterLink}
                to={employerProfile.profileEditUrl || '/employer/profile/edit'}
                variant="outline"
                borderRadius="full"
              >
                Edit Company Profile
              </Button>
              <Button
                as={RouterLink}
                to={employerProfile.dashboardUrl || '/employer/dashboard'}
                bg={primaryGreen}
                color="white"
                borderRadius="full"
                _hover={{ bg: primaryGreenHover }}
              >
                Open Employer Dashboard
              </Button>
            </Flex>
          </Box>
        </Container>

        <Container maxW="7xl" py={12}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box
              bg={cardBg}
              borderRadius="xl"
              p={6}
              boxShadow="md"
              borderColor={border}
              borderWidth="1px"
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color={textPrimary}>
                  🎓 Scholarships & Free Trainings
                </Heading>
                <Badge colorScheme="green" borderRadius="full">
                  Local & International
                </Badge>
              </Flex>
              <Text mb={6} color={textSecondary}>
                Thousands of learners accelerated through career-ready scholarships and free online trainings.
              </Text>
              <Button
                bg={primaryGreen}
                color="white"
                borderRadius="full"
                _hover={{ bg: primaryGreenHover }}
              >
                Explore Opportunities
              </Button>
            </Box>

            <Box
              bg={cardBg}
              borderRadius="xl"
              p={6}
              boxShadow="md"
              borderColor={border}
              borderWidth="1px"
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color={textPrimary}>
                  📢 Telegram Job Alerts
                </Heading>
                <Badge colorScheme="yellow" borderRadius="full">
                  Real-time
                </Badge>
              </Flex>
              <Text mb={4} color={textSecondary}>
                Scan the QR code or follow the link to join curated alerts for remote jobs, scholarships, and trainings.
              </Text>
              <Flex gap={6} align="center">
                <Center w={24} h={24} bg={softBlueBg} borderRadius="md">
                  QR
                </Center>
                <Button
                  as={ChakraLink}
                  href="https://t.me/enisrajobmatching"
                  bg={primaryBlue}
                  color="white"
                  borderRadius="full"
                  rightIcon={<FaTelegramPlane />}
                  _hover={{ bg: info }}
                >
                  Join Telegram Job Alerts
                </Button>
              </Flex>
            </Box>
          </SimpleGrid>
        </Container>

        <Container maxW="7xl" py={12}>
          <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8}>
            <Box
              bg={cardBg}
              borderRadius="xl"
              p={6}
              boxShadow="md"
              maxH="600px"
              borderWidth="1px"
              borderColor={border}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color={textPrimary}>
                  Latest Jobs
                </Heading>
                <Text color={textSecondary}>Scrollable list</Text>
              </Flex>
              <Divider borderColor={sectionDivider} mb={4} />
              <Stack spacing={4} maxH="420px" overflowY="auto" pr={2}>
                {jobList.map((job) => (
                  <Box
                    key={job.id}
                    p={4}
                    borderRadius="lg"
                    bg={cardBg}
                    borderWidth="1px"
                    borderColor={border}
                    boxShadow="sm"
                    transition="border-color 0.2s ease"
                    _hover={{ borderColor: primaryGreen }}
                  >
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xl">{job.flag}</Text>
                      <Badge bg={job.verified ? success : warning} color="white">
                        {job.verified ? 'Verified Employer' : 'In Review'}
                      </Badge>
                    </Flex>
                    <Heading size="md" mt={3} color={textPrimary}>
                      {job.title}
                    </Heading>
                    <Text color={textSecondary}>{job.location}</Text>
                    <Text mt={2} fontWeight="semibold" color={textPrimary}>
                      Deadline: {job.deadline}
                    </Text>
                    <Button
                      mt={4}
                      size="sm"
                      borderRadius="full"
                      bg={primaryGreen}
                      color="white"
                      _hover={{ bg: primaryGreenHover }}
                    >
                      Apply Now
                    </Button>
                  </Box>
                ))}
              </Stack>
              <Button
                mt={6}
                borderRadius="full"
                border="1px solid"
                borderColor={primaryGreen}
                color={primaryGreen}
                bg="transparent"
                _hover={{ bg: softGreenBg }}
              >
                View All Jobs
              </Button>
            </Box>

            <Box
              bg={cardBg}
              borderRadius="xl"
              p={6}
              boxShadow="md"
              borderWidth="1px"
              borderColor={border}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color={textPrimary}>
                  Free Training Section
                </Heading>
                <Badge variant="subtle" colorScheme="teal">
                  Learn & Grow
                </Badge>
              </Flex>
              <Stack spacing={3} mb={4}>
                {trainingHighlights.map((topic) => (
                  <Flex
                    key={topic}
                    justify="space-between"
                    align="center"
                    bg={softBlueBg}
                    p={3}
                    borderRadius="md"
                  >
                    <Text color={textPrimary}>{topic}</Text>
                    <Icon as={FaCheckCircle} color={success} />
                  </Flex>
                ))}
              </Stack>
              <Flex align="center" gap={6}>
                <Button
                  color="white"
                  bg={primaryGreen}
                  borderRadius="full"
                  _hover={{ bg: primaryGreenHover }}
                >
                  Start Free Training
                </Button>
                <Box
                  flex={1}
                  h="120px"
                  bgGradient={`linear(to-br, ${primaryGold}, ${primaryBlue})`}
                  borderRadius="xl"
                />
              </Flex>
            </Box>
          </SimpleGrid>
        </Container>

        <Box
          bgGradient={`linear(to-r, ${primaryGold}, ${primaryGoldHover})`}
          color="white"
          borderRadius="2xl"
          mx="auto"
          px={8}
          py={6}
          maxW="7xl"
          my={6}
        >
          <Flex align="center" justify="space-between" flexWrap="wrap" gap={4}>
            <HStack spacing={3}>
              <Icon as={FaGraduationCap} boxSize={7} />
              <Box>
                <Text fontWeight="bold">Complete your profile to increase chances</Text>
                <Text fontSize="sm">Update skills, upload CV, and connect with mentors.</Text>
              </Box>
            </HStack>
            <Button
              bg={primaryGreen}
              color="white"
              borderRadius="full"
              _hover={{ bg: primaryGreenHover }}
            >
              Apply Now
            </Button>
          </Flex>
        </Box>
      </Box>

      <Box as="footer" bg="#0F172A" color="white" py={8} borderTop="1px solid" borderColor={border}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <VStack align="flex-start" spacing={2}>
              <Heading size="md" color="white">
                Enisra
              </Heading>
              <Text color="whiteAlpha.700">Copyright © Enisra</Text>
            </VStack>
              <VStack align="flex-start" spacing={2}>
                <Heading size="sm" color="whiteAlpha.900">
                  Quick Links
                </Heading>
                <ChakraLink color={primaryBlue}>Jobs</ChakraLink>
                <ChakraLink color={primaryBlue}>Trainings</ChakraLink>
                <ChakraLink color={primaryBlue}>Scholarships</ChakraLink>
              </VStack>
              <VStack align="flex-start" spacing={2}>
                <Heading size="sm" color="whiteAlpha.900">
                  Contact
                </Heading>
                <ChakraLink color={primaryBlue} href="https://t.me/enisrajobmatching">
                  Telegram
                </ChakraLink>
                <ChakraLink color={primaryBlue} href="mailto:hello@enisra.com">
                  Email
                </ChakraLink>
                <ChakraLink color={primaryBlue}>Contact</ChakraLink>
              </VStack>
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomePage;
