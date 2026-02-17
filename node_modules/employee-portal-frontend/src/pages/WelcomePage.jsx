import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
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
  InputRightElement,
  Link as ChakraLink,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useDisclosure,
  useToast,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaBell,
  FaCheckCircle,
  FaGlobe,
  FaGraduationCap,
  FaMedal,
  FaSearch,
  FaTelegramPlane,
  FaUserCircle,
} from 'react-icons/fa';
import { useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '../utils/apiClient.js';
import { useUserStore } from '../store/user';
import { useLanguage } from '../context/language.jsx';

const translations = {
  en: {
    jobs: 'Jobs',
    login: 'Login',
    register: 'Register',
    scholarships: 'Scholarships',
    freeTrainings: 'Free Trainings',
    homeCtaTitle: 'Enisra connects you to trusted jobs + scholarships.',
    heroSearchPlaceholder: 'Search jobs, scholarships, trainings...',
  },
  am: {
    jobs: 'ስራዎች',
    login: 'ግባ',
    register: 'መመዝገብ',
    scholarships: 'የትምህርት ልዩነቶች',
    freeTrainings: 'ነጻ ስልጠናዎች',
    homeCtaTitle: 'ኢኒስራ እርስዎን ከታማኝ ስራዎችና የትምህርት ልዩነቶች ጋር ያገናኛል።',
    heroSearchPlaceholder: 'ስራዎች፣ ትምህርት ልዩነቶች፣ ስልጠናዎች ፈልግ...',
  },
};

const useTranslations = (lang) => (key) =>
  translations[lang]?.[key] || translations.en[key] || key;

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
  softGoldBg: '#FFF9EE',
  primaryBlue: '#3B82F6',
  softBlueBg: '#EAF1FF',
  bgMain: 'linear-gradient(180deg, #FAFCFB 0%, #F3F7F4 55%, #F7FAFF 100%)',
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


const partnerCompanies = [
  { name: 'Trade Ethiopia', logo: '/logo.jpg' },
  { name: 'Ethio Trade', logo: '/Ethio.jpg' },
  { name: 'Tesbinn', logo: '/tesbinn.jpg' },
  { name: 'Enisra', logo: '/enisra.jpg' },
];

const trainingHighlights = [
  'CV Writing',
  'Interview Skills',
  'Digital Skills for Jobs',
  'International Job Readiness',
];

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

  const [showAllJobs, setShowAllJobs] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [jobFilters, setJobFilters] = useState({
    location: '',
    category: '',
    type: '',
  });
  const [partners, setPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [partnersError, setPartnersError] = useState(null);
  const [partnersRepeatCount, setPartnersRepeatCount] = useState(2);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const currentUser = useUserStore((s) => s.currentUser);
  const [applyingId, setApplyingId] = useState('');
  const [appliedIds, setAppliedIds] = useState(() => new Set());
  const [applyModal, setApplyModal] = useState({ open: false, title: '', message: '', status: 'success' });
  const partnersCarouselRef = useRef(null);
  const partnersCarouselPausedRef = useRef(false);

  const locationOptions = useMemo(() => {
    const values = jobs.map((job) => job.location).filter(Boolean);
    return Array.from(new Set(values));
  }, [jobs]);

  const categoryOptions = useMemo(() => {
    const values = jobs.map((job) => job.category).filter(Boolean);
    return Array.from(new Set(values));
  }, [jobs]);

  const typeOptions = useMemo(() => {
    const baseTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
    const values = jobs.map((job) => job.type).filter(Boolean);
    return Array.from(new Set([...baseTypes, ...values]));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  const fetchJobs = async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const response = await apiClient.get('jobs', {
        params: {
          q: jobSearchTerm.trim() || undefined,
          location: jobFilters.location || undefined,
          category: jobFilters.category || undefined,
          type: jobFilters.type || undefined,
          limit: 100,
        },
      });
      const payload = response?.data?.data ?? response?.data ?? [];
      setJobs(Array.isArray(payload) ? payload : []);
    } catch (error) {
      setJobsError(error?.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleJobSearch = () => {
    fetchJobs();
  };

  const handleJobSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      fetchJobs();
    }
  };

  const handleApply = async (job) => {
    const jobId = job?._id || job?.id;
    if (!jobId) return;

    // 1) Check login
    if (!currentUser?.token) {
      toast({ title: 'Please log in', description: 'You need to log in to apply.', status: 'info', duration: 3000, isClosable: true });
      navigate('/login');
      return;
    }

    // 2) Check profile completion status
    const infoStatus = (currentUser.infoStatus || '').toString().toLowerCase();
    if (infoStatus !== 'completed') {
      toast({ title: 'Complete your profile', description: 'Finish your profile before applying.', status: 'warning', duration: 3500, isClosable: true });
      navigate('/employee/profile');
      return;
    }

    // 3) Prevent duplicate apply on client
    if (appliedIds.has(jobId)) {
      setApplyModal({ open: true, title: 'Already applied', message: 'You have already applied to this job.', status: 'info' });
      return;
    }

    try {
      setApplyingId(jobId);
      await apiClient.post(`jobs/${jobId}/apply`);
      setAppliedIds((prev) => new Set([...prev, jobId]));
      setApplyModal({ open: true, title: 'Application sent', message: 'Your application was submitted and the employer has been notified.', status: 'success' });
    } catch (error) {
      const message = error?.message || 'Could not submit application.';
      setApplyModal({ open: true, title: 'Application failed', message, status: 'error' });
    } finally {
      setApplyingId('');
    }
  };

  const formatDeadline = (value) => {
    if (!value) return 'No deadline';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const visibleJobs = showAllJobs ? jobs : jobs.slice(0, 3);
  const partnerList = partners.length ? partners : partnerCompanies;
  const partnersCarouselItems = useMemo(() => {
    if (!partnerList.length) return [];
    const repeats = Math.max(1, partnersRepeatCount);
    const items = [];
    for (let i = 0; i < repeats; i += 1) {
      items.push(...partnerList);
    }
    return items;
  }, [partnerList, partnersRepeatCount]);


  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setJobsLoading(true);
      setJobsError(null);
      try {
        const response = await apiClient.get('jobs', {
          params: { limit: 100 },
        });
        if (!isMounted) return;
        const payload = response?.data?.data ?? response?.data ?? [];
        setJobs(Array.isArray(payload) ? payload : []);
      } catch (error) {
        if (!isMounted) return;
        setJobsError(error?.message || 'Failed to load jobs');
        setJobs([]);
      } finally {
        if (isMounted) setJobsLoading(false);
      }
    };

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPartners = async () => {
      setPartnersLoading(true);
      setPartnersError(null);
      try {
        const response = await apiClient.get('partners');
        if (!isMounted) return;
        const payload = response?.data?.data ?? response?.data ?? [];
        setPartners(Array.isArray(payload) ? payload : []);
      } catch (error) {
        if (!isMounted) return;
        setPartnersError(error?.message || 'Failed to load partner companies');
        setPartners([]);
      } finally {
        if (isMounted) setPartnersLoading(false);
      }
    };

    loadPartners();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const el = partnersCarouselRef.current;
    if (!el) return;
    if (partnersLoading || partnersError) return;
    if (partnerList.length < 2) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    // Ensure we have enough repeated content so the loop point is reachable even on wide screens.
    const cycleStart = el.children?.[partnerList.length];
    const cycleLength = cycleStart ? cycleStart.offsetLeft : 0;
    const clientWidth = el.clientWidth || 0;
    const halfCycles =
      cycleLength > 0 && clientWidth > 0 ? Math.max(1, Math.ceil(clientWidth / cycleLength)) : 1;
    const desiredRepeatCount = halfCycles * 2;

    if (desiredRepeatCount !== partnersRepeatCount) {
      setPartnersRepeatCount(desiredRepeatCount);
      return;
    }

    // Reset so the loop always starts clean when partners data changes.
    el.scrollLeft = 0;

    let loopPoint = 0;
    const updateLoopPoint = () => {
      const loopIndex = partnerList.length * halfCycles;
      const loopChild = el.children?.[loopIndex];
      loopPoint = loopChild ? loopChild.offsetLeft : el.scrollWidth / 2;
    };

    const handleResize = () => {
      // Re-evaluate repeats if the container width changes (responsive / orientation changes).
      const nextCycleStart = el.children?.[partnerList.length];
      const nextCycleLength = nextCycleStart ? nextCycleStart.offsetLeft : 0;
      const nextClientWidth = el.clientWidth || 0;
      const nextHalfCycles =
        nextCycleLength > 0 && nextClientWidth > 0
          ? Math.max(1, Math.ceil(nextClientWidth / nextCycleLength))
          : 1;
      const nextRepeatCount = nextHalfCycles * 2;

      if (nextRepeatCount !== partnersRepeatCount) {
        setPartnersRepeatCount(nextRepeatCount);
        return;
      }

      updateLoopPoint();
    };

    updateLoopPoint();
    window.addEventListener('resize', handleResize);

    // Pixels per second. Keep it gentle so logos remain readable.
    const speed = 28;
    let rafId = 0;
    let lastTs = performance.now();

    const tick = (ts) => {
      const delta = ts - lastTs;
      lastTs = ts;

      if (!partnersCarouselPausedRef.current) {
        el.scrollLeft += (speed * delta) / 1000;

        if (loopPoint > 0 && el.scrollLeft >= loopPoint) {
          el.scrollLeft -= loopPoint;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [partnersLoading, partnersError, partnerList, partnersRepeatCount]);

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
          <Flex align="center" gap={{ base: 3, md: 6 }} justify="space-between" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
            <HStack spacing={3}>
              <Image
                src="/enisra.jpg"
                alt="Enisra logo"
                boxSize={10}
                objectFit="cover"
                borderRadius="full"
              />
              <Heading size={{ base: 'md', md: 'lg' }} letterSpacing="tight">
                Enisra
              </Heading>
            </HStack>

            <HStack spacing={3} ml="auto">
              <IconButton
                aria-label="Notifications"
                icon={<FaBell />}
                variant="ghost"
                color={primaryGreen}
                _hover={{ bg: softGreenBg }}
              />
              <Button
                as={RouterLink}
                to="/jobs"
                variant="ghost"
                size="sm"
                color={textPrimary}
                _hover={{ bg: softGreenBg }}
              >
                {t('jobs')}
              </Button>
              <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                  size="sm"
                  color={textPrimary}
                >
                  {t('login')}
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
                  {t('register')}
                </Button>
                <Select
                  size="sm"
                  variant="outline"
                  borderColor={border}
                  color={textPrimary}
                  _hover={{ borderColor: primaryGreen }}
                  width="110px"
                  aria-label="Language selector"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="am">Amharic</option>
                </Select>
              </HStack>
              <IconButton
                aria-label="Go to dashboard"
                icon={<FaUserCircle />}
                variant="outline"
                size="sm"
                borderColor={border}
                color={textPrimary}
                _hover={{ borderColor: primaryGreen }}
                display={{ base: 'none', md: 'inline-flex' }}
              />
              <IconButton
                aria-label="Open menu"
                icon={<FaBars />}
                variant="outline"
                size="sm"
                borderColor={border}
                color={textPrimary}
                _hover={{ borderColor: primaryGreen }}
                display={{ base: 'inline-flex', md: 'none' }}
                onClick={onOpen}
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Account</DrawerHeader>
          <DrawerBody>
            <Stack spacing={3} mt={2}>
              <Button as={RouterLink} to="/login" onClick={onClose} variant="ghost">
                {t('login')}
              </Button>
              <Button as={RouterLink} to="/jobs" onClick={onClose} variant="ghost">
                {t('jobs')}
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                onClick={onClose}
                bg={primaryGreen}
                color="white"
                _hover={{ bg: primaryGreenHover }}
              >
                {t('register')}
              </Button>
              <Button
                variant="outline"
                leftIcon={<FaUserCircle />}
                onClick={onClose}
              >
                Profile
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

        <Box as="main">
          <Box py={12} bg={softGoldBg}>
          <Container maxW="7xl">
            <SimpleGrid columns={{ base: 1, lg: 2 }} alignItems="center" spacing={10} mb={10}>
              <Stack spacing={4}>
                <Heading size="2xl" color={textPrimary}>
                  {t('homeCtaTitle')}
                </Heading>
                <Stack spacing={3} w="100%">
                  <Box maxW={{ base: '100%', md: '460px' }} w="100%">
                    <InputGroup size="sm">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaSearch} color="gray.400" />
                      </InputLeftElement>
                      <InputRightElement width="2.25rem">
                        <IconButton
                          aria-label="Search jobs"
                          icon={<FaSearch />}
                          size="xs"
                          variant="ghost"
                          onClick={handleJobSearch}
                          isLoading={jobsLoading}
                        />
                      </InputRightElement>
                      <Input
                        placeholder={t('heroSearchPlaceholder')}
                        bg={softGreenBg}
                        borderColor={border}
                        borderRadius="full"
                        size="sm"
                        color={textPrimary}
                        _focus={{ borderColor: primaryGreen }}
                        _placeholder={{ color: placeholder }}
                        value={jobSearchTerm}
                        onChange={(event) => setJobSearchTerm(event.target.value)}
                        onKeyDown={handleJobSearchKeyDown}
                        pr="2.25rem"
                      />
                    </InputGroup>
                  </Box>
                  <Flex
                    gap={2}
                    flexWrap={{ base: 'wrap', md: 'nowrap' }}
                    overflowX={{ base: 'visible', md: 'auto' }}
                    pb={1}
                    maxW={{ base: '100%', md: '520px' }}
                  >
                    <Box minW={{ base: '120px', md: '140px' }} flex={{ base: '1 1 140px', md: '0 0 140px' }}>
                      <Select
                        placeholder="Location"
                        size="xs"
                        bg={softGreenBg}
                        borderColor={border}
                        _focus={{ borderColor: primaryGreen }}
                        _hover={{ borderColor: primaryGreen }}
                        color={textPrimary}
                        value={jobFilters.location}
                        onChange={(event) =>
                          setJobFilters((prev) => ({ ...prev, location: event.target.value }))
                        }
                      >
                        {locationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Box>
                    <Box minW={{ base: '120px', md: '140px' }} flex={{ base: '1 1 140px', md: '0 0 140px' }}>
                      <Select
                        placeholder="Category"
                        size="xs"
                        bg={softGreenBg}
                        borderColor={border}
                        _focus={{ borderColor: primaryGreen }}
                        _hover={{ borderColor: primaryGreen }}
                        color={textPrimary}
                        value={jobFilters.category}
                        onChange={(event) =>
                          setJobFilters((prev) => ({ ...prev, category: event.target.value }))
                        }
                      >
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Box>
                    <Box minW={{ base: '120px', md: '140px' }} flex={{ base: '1 1 140px', md: '0 0 140px' }}>
                      <Select
                        placeholder="Job Type"
                        size="xs"
                        bg={softGreenBg}
                        borderColor={border}
                        _focus={{ borderColor: primaryGreen }}
                        _hover={{ borderColor: primaryGreen }}
                        color={textPrimary}
                        value={jobFilters.type}
                        onChange={(event) =>
                          setJobFilters((prev) => ({ ...prev, type: event.target.value }))
                        }
                      >
                        {typeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Box>
                  </Flex>
                </Stack>
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
                <HStack spacing={3} mt={4} flexWrap="wrap">
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
                minH={{ base: '220px', md: '360px' }}
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

        <Container maxW="7xl" py={10}>
          <Box
            bg={cardBg}
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            boxShadow="xl"
            border="1px solid"
            borderColor={border}
          >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} alignItems="center">
              <Stack spacing={3}>
                <Heading size="lg" color={textPrimary}>
                  Employers can post jobs here
                </Heading>
                <Text color={textSecondary} fontSize="md">
                  Use the Employer Dashboard to publish job openings, track applicants,
                  and manage your postings in one place.
                </Text>
                <HStack spacing={3} flexWrap="wrap">
                  <Button
                    as={RouterLink}
                    to="/employer/post"
                    bg={primaryGreen}
                    color="white"
                    borderRadius="full"
                    _hover={{ bg: primaryGreenHover }}
                  >
                    Post a Job
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/employer/profile"
                    variant="outline"
                    borderRadius="full"
                    borderColor={primaryGreen}
                    color={primaryGreen}
                    _hover={{ bg: softGreenBg }}
                  >
                    Go to Employer Dashboard
                  </Button>
                </HStack>
              </Stack>
              <Box
                borderRadius="xl"
                bg={softGreenBg}
                p={6}
                border="1px solid"
                borderColor={border}
              >
                <Text fontWeight="semibold" color={textPrimary} mb={2}>
                  Ready to create a new job post?
                </Text>
                <Text color={textSecondary} fontSize="sm" mb={4}>
                  Click “Post a Job” to open the employer job form and publish in minutes.
                </Text>
                <Button
                  as={RouterLink}
                  to="/employer/post"
                  size="sm"
                  bg={primaryGold}
                  color="white"
                  borderRadius="full"
                  _hover={{ bg: primaryGoldHover }}
                >
                  Create Job Post
                </Button>
              </Box>
            </SimpleGrid>
          </Box>
        </Container>
        <Container maxW="7xl" py={12}>
          <Box
            bg={cardBg}
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            boxShadow="xl"
            border="1px solid"
            borderColor={border}
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'flex-start', md: 'center' }}
              justify="space-between"
              gap={4}
              mb={6}
            >
              <Box>
                <Heading size="lg" color={textPrimary}>
                  Companies Worked With Us
                </Heading>
                <Text color={textSecondary} fontSize="sm">
                  Swipe to explore partner companies.
                </Text>
              </Box>
              <Badge colorScheme="green" borderRadius="full">
                Trusted Partners
              </Badge>
            </Flex>
            <Flex
              ref={partnersCarouselRef}
              gap={4}
              flexWrap="nowrap"
              overflowX="auto"
              pb={2}
              onMouseEnter={() => {
                partnersCarouselPausedRef.current = true;
              }}
              onMouseLeave={() => {
                partnersCarouselPausedRef.current = false;
              }}
              onPointerDown={() => {
                partnersCarouselPausedRef.current = true;
              }}
              onPointerUp={() => {
                partnersCarouselPausedRef.current = false;
              }}
              onTouchStart={() => {
                partnersCarouselPausedRef.current = true;
              }}
              onTouchEnd={() => {
                partnersCarouselPausedRef.current = false;
              }}
              onTouchCancel={() => {
                partnersCarouselPausedRef.current = false;
              }}
              sx={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {partnersLoading ? (
                <Flex align="center" gap={2} py={4}>
                  <Spinner size="sm" color={primaryGreen} />
                  <Text color={textSecondary}>Loading partners...</Text>
                </Flex>
              ) : partnersError ? (
                <Text color={warning}>{partnersError}</Text>
              ) : (
                partnersCarouselItems.map((company, idx) => (
                  <Box
                    // Duplicate items for looping, so index is part of the key.
                    key={`${company._id || company.name}-${idx}`}
                    minW={{ base: '160px', md: '200px' }}
                    bg={softGreenBg}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={border}
                    p={4}
                  >
                    <Center
                      boxSize={16}
                      borderRadius="full"
                      bg="white"
                      boxShadow="sm"
                      mb={3}
                    >
                      <Image
                        src={company.logoUrl || company.logo}
                        alt={company.name}
                        boxSize={12}
                        objectFit="cover"
                        borderRadius="full"
                      />
                    </Center>
                    <Text fontWeight="semibold" color={textPrimary} textAlign="center">
                      {company.name}
                    </Text>
                  </Box>
                ))
              )}
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
              <Flex gap={4} align={{ base: 'flex-start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }}>
                <Center w={{ base: 20, md: 24 }} h={{ base: 20, md: 24 }} bg={softBlueBg} borderRadius="md">
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
              maxH={{ base: 'none', lg: '600px' }}
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
              <Stack spacing={4} maxH={{ base: 'none', lg: '420px' }} overflowY={{ base: 'visible', lg: 'auto' }} pr={{ base: 0, lg: 2 }}>
                {jobsLoading ? (
                  <Flex align="center" gap={2} py={6}>
                    <Spinner size="sm" color={primaryGreen} />
                    <Text color={textSecondary}>Loading jobs...</Text>
                  </Flex>
                ) : jobsError ? (
                  <Text color={warning} fontSize="sm">
                    {jobsError}
                  </Text>
                ) : visibleJobs.length ? (
                  visibleJobs.map((job) => {
                    const hasVerifiedFlag = typeof job.verified === 'boolean';
                    const badgeLabel = hasVerifiedFlag
                      ? job.verified
                        ? 'Verified Employer'
                        : 'In Review'
                      : 'Open';
                    const badgeBg = hasVerifiedFlag ? (job.verified ? success : warning) : info;
                    return (
                      <Box
                        key={job._id || job.id}
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
                          <Text fontSize="xl">{job.flag || '💼'}</Text>
                          <Badge bg={badgeBg} color="white">
                            {badgeLabel}
                          </Badge>
                        </Flex>
                        <Heading size="md" mt={3} color={textPrimary}>
                          {job.title}
                        </Heading>
                        <Text color={textSecondary}>{job.location}</Text>
                        <Text mt={2} fontWeight="semibold" color={textPrimary}>
                          Deadline: {formatDeadline(job.deadline)}
                        </Text>
                        <Button
                          mt={4}
                          size="sm"
                          borderRadius="full"
                          bg={primaryGreen}
                          color="white"
                          _hover={{ bg: primaryGreenHover }}
                          onClick={() => handleApply(job)}
                          isLoading={applyingId === (job._id || job.id)}
                          isDisabled={appliedIds.has(job._id || job.id)}
                        >
                          {appliedIds.has(job._id || job.id) ? 'Applied' : 'Apply Now'}
                        </Button>
                      </Box>
                    );
                  })
                ) : (
                  <Text color={textSecondary}>No jobs available yet.</Text>
                )}
              </Stack>
              <Button
                mt={6}
                borderRadius="full"
                border="1px solid"
                borderColor={primaryGreen}
                color={primaryGreen}
                bg="transparent"
                _hover={{ bg: softGreenBg }}
                onClick={() => setShowAllJobs((prev) => !prev)}
                isDisabled={jobs.length <= 3}
              >
                {showAllJobs ? "Show Fewer Jobs" : "View All Jobs"}
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
              <Flex align="center" gap={4} direction={{ base: 'column', sm: 'row' }}>
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
                  w={{ base: '100%', sm: 'auto' }}
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
          <Flex
            align={{ base: 'flex-start', md: 'center' }}
            justify="space-between"
            flexWrap="wrap"
            gap={4}
            direction={{ base: 'column', md: 'row' }}
          >
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
              onClick={() => navigate('/login')}
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

      <Modal isOpen={applyModal.open} onClose={() => setApplyModal({ open: false, title: '', message: '', status: 'success' })} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{applyModal.title || 'Application'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{applyModal.message}</Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setApplyModal({ open: false, title: '', message: '', status: 'success' })} colorScheme={applyModal.status === 'success' ? 'green' : 'red'}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default WelcomePage;
