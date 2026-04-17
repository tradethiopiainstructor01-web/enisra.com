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
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaBell,
  FaCheckCircle,
  FaGlobe,
  FaGraduationCap,
  FaMedal,
  FaMoon,
  FaSearch,
  FaSun,
  FaTelegramPlane,
  FaUserCircle,
} from 'react-icons/fa';
import { useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '../utils/apiClient.js';
import { getJobApplyAccess, getJobApplyAccessMessage, openJobApplicationEmail } from '../utils/jobEmail.js';
import { useLanguage } from '../context/language.jsx';

const translations = {
  en: {
    jobs: 'Jobs',
    login: 'Login',
    register: 'Register',
    scholarships: 'Scholarships',
    freeTrainings: 'Free Trainings',
    homeCtaTitle: 'Enisra connects you to trusted jobs.',
    heroSearchPlaceholder: 'Search jobs, scholarships, trainings...',
  },
  am: {
    jobs: 'ስራዎች',
    login: 'ግባ',
    register: 'መመዝገብ',
    scholarships: 'የትምህርት ልዩነቶች',
    freeTrainings: 'ነጻ ስልጠናዎች',
    homeCtaTitle: 'ኢኒስራ እርስዎን ከታማኝ ስራዎች ጋር ያገናኛል።',
    heroSearchPlaceholder: 'ስራዎች፣ ትምህርት ልዩነቶች፣ ስልጠናዎች ፈልግ...',
  },
};

const heroCards = [
  {
    id: 1,
    title: '🔍 Search Jobs',
    subtitle: 'Local & International',
    cta: 'Browse Jobs',
    ctaLink: '/jobs',
    icon: FaSearch,
    description: 'Refine by skill, location, salary, and remote preferences.',
  },
  {
    id: 2,
    title: '🌍 International Jobs',
    subtitle: 'Top destinations',
    cta: 'View International Jobs',
    ctaLink: '/jobs',
    icon: FaGlobe,
    flags: ['🇺🇸', '🇨🇦', '🇦🇪', '🇬🇧', '🇰🇪', '🇳🇱'],
  },
  {
    id: 3,
    title: '🎁 Win Training Scholarship',
    subtitle: 'Limited slots, high impact reward',
    cta: 'Apply & Get Selected',
    ctaLink: '/jobs',
    icon: FaMedal,
    highlight: true,
  },
];

const darkThemeColors = {
  primaryGreen: '#6366F1',
  primaryGreenHover: '#7C83FF',
  softGreenBg: 'rgba(15, 23, 42, 0.72)',
  primaryGold: '#22D3EE',
  primaryGoldHover: '#67E8F9',
  softGoldBg: 'linear-gradient(180deg, rgba(15, 23, 42, 0.68) 0%, rgba(2, 6, 23, 0.38) 100%)',
  primaryBlue: '#22D3EE',
  softBlueBg: 'rgba(34, 211, 238, 0.12)',
  bgMain:
    'radial-gradient(circle at top left, rgba(99, 102, 241, 0.22), transparent 28%), radial-gradient(circle at top right, rgba(34, 211, 238, 0.14), transparent 24%), linear-gradient(180deg, #0F172A 0%, #020617 100%)',
  cardBg: 'rgba(255, 255, 255, 0.10)',
  border: 'rgba(148, 163, 184, 0.20)',
  sectionDivider: 'rgba(148, 163, 184, 0.18)',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5F5',
  textMuted: '#94A3B8',
  placeholder: '#94A3B8',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#F87171',
  info: '#22D3EE',
  surfaceGlow: '0 24px 60px rgba(2, 6, 23, 0.42)',
  accentGlow: '0 0 0 1px rgba(34, 211, 238, 0.18), 0 18px 45px rgba(34, 211, 238, 0.14)',
  buttonGradient: 'linear-gradient(90deg, #6366F1 0%, #22D3EE 100%)',
  buttonGradientHover: 'linear-gradient(90deg, #7C83FF 0%, #67E8F9 100%)',
  highlightGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.92) 0%, rgba(34, 211, 238, 0.9) 100%)',
};

const lightThemeColors = {
  primaryGreen: '#6366F1',
  primaryGreenHover: '#7C83FF',
  softGreenBg: 'rgba(99, 102, 241, 0.08)',
  primaryGold: '#0891b2',
  primaryGoldHover: '#06b6d4',
  softGoldBg: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
  primaryBlue: '#0891b2',
  softBlueBg: 'rgba(8, 145, 178, 0.08)',
  bgMain:
    'radial-gradient(circle at top left, rgba(99, 102, 241, 0.12), transparent 28%), radial-gradient(circle at top right, rgba(8, 145, 178, 0.08), transparent 24%), linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)',
  cardBg: 'rgba(255, 255, 255, 0.7)',
  border: 'rgba(203, 213, 225, 0.5)',
  sectionDivider: 'rgba(203, 213, 225, 0.4)',
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  textMuted: '#64748B',
  placeholder: '#64748B',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#0891b2',
  surfaceGlow: '0 24px 60px rgba(2, 6, 23, 0.08)',
  accentGlow: '0 0 0 1px rgba(8, 145, 178, 0.15), 0 18px 45px rgba(8, 145, 178, 0.1)',
  buttonGradient: 'linear-gradient(90deg, #6366F1 0%, #0891b2 100%)',
  buttonGradientHover: 'linear-gradient(90deg, #7C83FF 0%, #06b6d4 100%)',
  highlightGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.85) 0%, rgba(8, 145, 178, 0.8) 100%)',
};

const trainingHighlights = [
  'CV Writing',
  'Interview Skills',
  'Digital Skills for Jobs',
  'International Job Readiness',
];

const heroImageUrl = '/assets/newhero.png';

const partnerDescriptions = {
  'trade ethiopia':
    'Trade Ethiopia connects businesses with market opportunities, partnerships, and practical growth support.',
  tradeethiopia:
    'Trade Ethiopia connects businesses with market opportunities, partnerships, and practical growth support.',
  tesbinn:
    'TESBINN equips learners and business communities with practical trade, innovation, and business skills through focused training programs.',
  'addis ababa university':
    'Addis Ababa University is a leading Ethiopian public university offering broad academic, research, and community programs.',
  "st. mary's university":
    "St. Mary's University is a private higher education institution in Addis Ababa offering undergraduate and graduate programs.",
  'st mary university':
    "St. Mary's University is a private higher education institution in Addis Ababa offering undergraduate and graduate programs.",
};

const staticPartnerEntries = [
  {
    _id: 'static-tradeethiopia-group',
    name: 'TradeEthiopia Group',
    logoUrl: '/assets/tradeethiopia-group.jpg',
    website: 'https://www.tradethiopia.com',
  },
  {
    _id: 'static-tesbinn-school',
    name: 'TradeEthiopia Business and Innovation School',
    logoUrl: '/assets/tesbinn-school.jpg',
    website: 'https://tesbinn.com/',
  },
  {
    _id: 'static-addis-ababa-university',
    name: 'Addis Ababa University',
    logoUrl: '/assets/addis-ababa-university.jpg',
    website: 'https://www.aau.edu.et',
  },
  {
    _id: 'static-st-mary-university',
    name: "St. Mary's University",
    logoUrl: 'https://www.edmap.et/wp-content/uploads/2022/11/pict0-3583.jpg',
    website: 'https://smuc.edu.et',
  },
];

const normalizeWebsiteUrl = (value = '') => {
  const trimmed = value.toString().trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const telegramChannelUrl = normalizeWebsiteUrl(
  import.meta.env.VITE_TELEGRAM_CHANNEL_URL || 'https://t.me/enisrajobmatching'
);

const getPartnerWebsite = (company) => {
  const directWebsite = normalizeWebsiteUrl(company?.website || '');
  if (directWebsite) return directWebsite;

  const companyName = (company?.name || '').toString().toLowerCase();
  if (companyName.includes('trade ethiopia') || companyName.includes('tradeethiopia')) {
    return 'https://www.tradethiopia.com';
  }
  if (companyName.includes("st. mary's university") || companyName.includes('st mary university')) {
    return 'https://smuc.edu.et';
  }
  return '';
};

const getPartnerDescription = (company) => {
  const companyName = (company?.name || '').toString().toLowerCase();
  const matched = Object.entries(partnerDescriptions).find(([key]) => companyName.includes(key));
  if (matched) return matched[1];
  return 'Visit the company website to learn more about their services and opportunities.';
};

const getPartnerImageFit = (company) => {
  const companyName = (company?.name || '').toString().toLowerCase();
  if (companyName.includes("st. mary's university") || companyName.includes('st mary university')) {
    return 'contain';
  }
  return 'contain';
};

const isMobileInteraction = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches;
};
const hasScholarshipAccess = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('scholarshipToken'));
};
const buildScholarshipLoginRedirect = (targetPath) =>
  `/scholarship-login?redirect=${encodeURIComponent(targetPath)}`;

const WelcomePage = () => {
  const { colorMode, toggleColorMode } = useColorMode();

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
    surfaceGlow,
    accentGlow,
    buttonGradient,
    buttonGradientHover,
    highlightGradient,
  } = colorMode === 'light' ? lightThemeColors : darkThemeColors;

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
  const {
    isOpen: isPartnerDrawerOpen,
    onOpen: onPartnerDrawerOpen,
    onClose: onPartnerDrawerClose,
  } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const partnersCarouselRef = useRef(null);
  const partnersCarouselPausedRef = useRef(false);
  const jobsSectionRef = useRef(null);
  const [hoveredPartner, setHoveredPartner] = useState(null);

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

  const fetchJobs = async (signal) => {
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
        signal,
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

  const handleJobSearch = async () => {
    setShowAllJobs(true);
    await fetchJobs();
    if (jobsSectionRef.current) {
      jobsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleJobSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleJobSearch();
    }
  };

  const handleApply = (job) => {
    const applyAccess = getJobApplyAccess();
    if (!applyAccess.allowed) {
      toast({
        title: 'Apply access restricted',
        description: getJobApplyAccessMessage(applyAccess.reason),
        status: 'warning',
        duration: 3500,
        isClosable: true,
      });
      if (applyAccess.reason === 'not_authenticated') {
        navigate('/login');
      }
      return;
    }

    const didOpenMailClient = openJobApplicationEmail(
      job,
      `Hello,\n\nI would like to apply for the ${job?.title || 'role'}.\nPlease find my CV attached.\n\nThank you.`
    );

    if (!didOpenMailClient) {
      toast({
        title: 'Contact email missing',
        description: 'No contact email provided for this job.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  };

  const formatDeadline = (value) => {
    if (!value) return 'No deadline';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const visibleJobs = showAllJobs ? jobs : jobs.slice(0, 3);
  const partnerList = partners;
  const partnersCarouselItems = useMemo(() => partnerList, [partnerList]);

  const openPartnerDrawer = (company) => {
    setHoveredPartner(company);
    onPartnerDrawerOpen();
  };


  useEffect(() => {
    const controller = new AbortController();
    fetchJobs(controller.signal);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!showAllJobs) return;
    const controller = new AbortController();
    const timer = setTimeout(() => fetchJobs(controller.signal), 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [jobSearchTerm, jobFilters.location, jobFilters.category, jobFilters.type, showAllJobs]);

  useEffect(() => {
    let isMounted = true;

    const loadPartners = async () => {
      setPartnersLoading(true);
      setPartnersError(null);
      try {
        const response = await apiClient.get('partners');
        if (!isMounted) return;
        const payload = response?.data?.data ?? response?.data ?? [];
        const apiPartners = Array.isArray(payload) ? payload : [];
        const mergedPartners = [...apiPartners];

        staticPartnerEntries.forEach((entry) => {
          const alreadyIncluded = mergedPartners.some((partner) =>
            (partner?.name || '').toString().trim().toLowerCase() === entry.name.toLowerCase()
          );
          if (!alreadyIncluded) {
            mergedPartners.push(entry);
          }
        });

        setPartners(mergedPartners);
      } catch (error) {
        if (!isMounted) return;
        setPartnersError(error?.message || 'Failed to load partner companies');
        setPartners(staticPartnerEntries);
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
    return;
  }, [partnersLoading, partnersError, partnerList, partnersRepeatCount]);

  return (
    <Box minH="100vh" bg={bgMain} color={textPrimary}>
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={50}
        bg="rgba(15, 23, 42, 0.92)"
        color="white"
        borderBottom="1px solid"
        borderColor="rgba(148, 163, 184, 0.20)"
        backdropFilter="blur(20px)"
        boxShadow="0 24px 60px rgba(2, 6, 23, 0.42)"
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
                aria-label="Toggle color mode"
                icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
                onClick={toggleColorMode}
                variant="ghost"
                color={primaryGreen}
                _hover={{ bg: softBlueBg, color: primaryBlue }}
              />
              <IconButton
                aria-label="Notifications"
                icon={<FaBell />}
                variant="ghost"
                color={primaryGreen}
                _hover={{ bg: softBlueBg, color: primaryBlue }}
              />
              <Button
                as={RouterLink}
                to="/jobs"
                variant="ghost"
                size="sm"
                color="white"
                _hover={{ bg: 'rgba(34, 211, 238, 0.12)', color: '#22D3EE' }}
              >
                {t('jobs')}
              </Button>
              <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                  size="sm"
                  color="white"
                  _hover={{ color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.12)' }}
                >
                  {t('login')}
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  size="sm"
                  bgGradient={buttonGradient}
                  color="white"
                  borderRadius="full"
                  boxShadow="0 12px 28px rgba(99, 102, 241, 0.32)"
                  _hover={{ bgGradient: buttonGradientHover, boxShadow: '0 14px 32px rgba(34, 211, 238, 0.24)' }}
                >
                  {t('register')}
                </Button>
                <Select
                  size="sm"
                  variant="outline"
                  borderColor="rgba(148, 163, 184, 0.20)"
                  color="white"
                  bg="rgba(255, 255, 255, 0.10)"
                  backdropFilter="blur(16px)"
                  _hover={{ borderColor: '#22D3EE' }}
                  width="110px"
                  aria-label="Language selector"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  sx={{ '> option': { background: '#0F172A', color: '#F8FAFC' } }}
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
                borderColor="rgba(148, 163, 184, 0.20)"
                color="white"
                bg="rgba(255, 255, 255, 0.10)"
                backdropFilter="blur(16px)"
                _hover={{ borderColor: '#22D3EE', color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.12)' }}
                display={{ base: 'none', md: 'inline-flex' }}
              />
              <IconButton
                aria-label="Open menu"
                icon={<FaBars />}
                variant="outline"
                size="sm"
                borderColor="rgba(148, 163, 184, 0.20)"
                color="white"
                bg="rgba(255, 255, 255, 0.10)"
                backdropFilter="blur(16px)"
                _hover={{ borderColor: '#22D3EE', color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.12)' }}
                display={{ base: 'inline-flex', md: 'none' }}
                onClick={onOpen}
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
        <DrawerContent bg="rgba(15, 23, 42, 0.94)" color={textPrimary} borderLeft="1px solid" borderColor={border}>
          <DrawerCloseButton />
          <DrawerHeader>Account</DrawerHeader>
          <DrawerBody>
            <Stack spacing={3} mt={2}>
              <Button
                leftIcon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
                onClick={toggleColorMode}
                variant="ghost"
                color={textPrimary}
                _hover={{ bg: softBlueBg, color: primaryBlue }}
              >
                {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Button>
              <Button as={RouterLink} to="/login" onClick={onClose} variant="ghost" color={textPrimary} _hover={{ bg: softBlueBg, color: primaryBlue }}>
                {t('login')}
              </Button>
              <Button as={RouterLink} to="/jobs" onClick={onClose} variant="ghost" color={textPrimary} _hover={{ bg: softBlueBg, color: primaryBlue }}>
                {t('jobs')}
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                onClick={onClose}
                bgGradient={buttonGradient}
                color="white"
                _hover={{ bgGradient: buttonGradientHover, boxShadow: '0 14px 32px rgba(34, 211, 238, 0.24)' }}
              >
                {t('register')}
              </Button>
              <Button
                variant="outline"
                leftIcon={<FaUserCircle />}
                onClick={onClose}
                color={textPrimary}
                borderColor={border}
                bg={cardBg}
                _hover={{ borderColor: primaryBlue, color: primaryBlue, bg: softBlueBg }}
              >
                Profile
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer isOpen={isPartnerDrawerOpen} placement="left" onClose={onPartnerDrawerClose} size="sm">
        <DrawerOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
        <DrawerContent onMouseLeave={onPartnerDrawerClose} bg="white" color="gray.900" borderRight="1px solid" borderColor="gray.200">
          <DrawerCloseButton />
          <DrawerHeader color="gray.900">{hoveredPartner?.name || 'Company'}</DrawerHeader>
          <DrawerBody>
            <Stack spacing={4}>
              <Box
                w="100%"
                h="120px"
                borderRadius="lg"
                overflow="hidden"
                bg="white"
                boxShadow={accentGlow}
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Image
                  src={hoveredPartner?.logoUrl || hoveredPartner?.logo}
                  alt={hoveredPartner?.name || 'Company logo'}
                  w="100%"
                  h="100%"
                  objectFit={getPartnerImageFit(hoveredPartner)}
                  p={getPartnerImageFit(hoveredPartner) === 'cover' ? 0 : 3}
                />
              </Box>
              <Text color="gray.700">{getPartnerDescription(hoveredPartner)}</Text>
              {getPartnerWebsite(hoveredPartner) ? (
                <Button
                  as={ChakraLink}
                  href={getPartnerWebsite(hoveredPartner)}
                  target="_blank"
                  rel="noopener noreferrer"
                  bgGradient={buttonGradient}
                  color="white"
                  _hover={{ bgGradient: buttonGradientHover, boxShadow: '0 14px 32px rgba(34, 211, 238, 0.24)' }}
                >
                  Visit Website
                </Button>
              ) : (
                <Text color={textMuted} fontSize="sm">
                  Website not available.
                </Text>
              )}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

        <Box as="main" display="flex" flexDirection="column">
          <Box py={12} bg={softGoldBg} order={0}>
          <Container maxW="7xl">
            <SimpleGrid columns={{ base: 1, lg: 2 }} alignItems="center" spacing={10} mb={10}>
              <Stack spacing={4}>
                <Heading size="2xl" color={textPrimary}>
                  {t('Enisra connects you to trusted jobs')}
                </Heading>
                <Stack spacing={3} w="100%">
                  <Box maxW={{ base: '100%', md: '460px' }} w="100%">
                    <InputGroup size="sm">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaSearch} color={textMuted} />
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
                        backdropFilter="blur(18px)"
                        _focus={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
                        _placeholder={{ color: placeholder }}
                        value={jobSearchTerm}
                        onChange={(event) => {
                          setShowAllJobs(true);
                          setJobSearchTerm(event.target.value);
                        }}
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
                        backdropFilter="blur(18px)"
                        _focus={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
                        _hover={{ borderColor: primaryBlue }}
                        color={textPrimary}
                        value={jobFilters.location}
                        sx={{ '> option': { background: '#0F172A', color: '#F8FAFC' } }}
                        onChange={(event) =>
                          setJobFilters((prev) => {
                            setShowAllJobs(true);
                            return { ...prev, location: event.target.value };
                          })
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
                        backdropFilter="blur(18px)"
                        _focus={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
                        _hover={{ borderColor: primaryBlue }}
                        color={textPrimary}
                        value={jobFilters.category}
                        sx={{ '> option': { background: '#0F172A', color: '#F8FAFC' } }}
                        onChange={(event) =>
                          setJobFilters((prev) => {
                            setShowAllJobs(true);
                            return { ...prev, category: event.target.value };
                          })
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
                        backdropFilter="blur(18px)"
                        _focus={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
                        _hover={{ borderColor: primaryBlue }}
                        color={textPrimary}
                        value={jobFilters.type}
                        sx={{ '> option': { background: '#0F172A', color: '#F8FAFC' } }}
                        onChange={(event) =>
                          setJobFilters((prev) => {
                            setShowAllJobs(true);
                            return { ...prev, type: event.target.value };
                          })
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
                    bgGradient={buttonGradient}
                    color="white"
                    borderRadius="full"
                    boxShadow="0 14px 34px rgba(99, 102, 241, 0.34)"
                    _hover={{ bgGradient: buttonGradientHover, boxShadow: '0 18px 38px rgba(34, 211, 238, 0.24)' }}
                  >
                    Register as Employer
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/jobs"
                    w="fit-content"
                    variant="outline"
                    color={textPrimary}
                    borderColor="rgba(34, 211, 238, 0.42)"
                    borderRadius="full"
                    bg="rgba(255,255,255,0.04)"
                    _hover={{ bg: softBlueBg, color: primaryBlue, borderColor: primaryBlue }}
                  >
                    Browse trusted jobs
                  </Button>
                </Stack>
                <HStack spacing={3} mt={4} flexWrap="wrap">
                  <Badge bg={softBlueBg} color={primaryBlue} borderRadius="full" border="1px solid" borderColor="rgba(34, 211, 238, 0.18)">
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
                boxShadow={accentGlow}
                bg="rgba(255,255,255,0.08)"
                border="1px solid"
                borderColor={border}
                position="relative"
                w="100%"
                ml="0"
              >
                <Center
                  position="absolute"
                  inset={0}
                  bgGradient="linear(to-br, rgba(99, 102, 241, 0.16), rgba(34, 211, 238, 0.12))"
                  mixBlendMode="screen"
                  pointerEvents="none"
                />
                <Image
                  src={heroImageUrl}
                  alt="Three professionals reviewing a phone"
                  objectFit="contain"
                  w="100%"
                  h="auto"
                  display="block"
                  position="relative"
                  zIndex={1}
                />
              </Box>
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              {heroCards.map((card) => {
                const isHighlight = card.highlight;
                return (
                  <Box
                    key={card.id}
                    as={RouterLink}
                    to={card.ctaLink || '/jobs'}
                    display="block"
                    textDecoration="none"
                    cursor="pointer"
                    bg={isHighlight ? undefined : cardBg}
                    borderWidth={isHighlight ? 0 : '1px'}
                    borderColor={isHighlight ? 'transparent' : border}
                    bgGradient={
                      isHighlight
                        ? highlightGradient
                        : undefined
                    }
                    color={isHighlight ? 'white' : textPrimary}
                    p={6}
                    borderRadius="xl"
                    backdropFilter="blur(18px)"
                    boxShadow={isHighlight ? accentGlow : surfaceGlow}
                    transition="border-color 0.3s ease, transform 0.3s ease"
                    _hover={{
                      borderColor: isHighlight ? 'rgba(255,255,255,0.2)' : primaryBlue,
                      transform: 'translateY(-2px)',
                    }}
                    _focusVisible={{
                      boxShadow: `0 0 0 1px ${primaryBlue}, ${accentGlow}`,
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
                      as="span"
                      pointerEvents="none"
                      mt={6}
                      size="sm"
                      borderRadius="full"
                      bgGradient={buttonGradient}
                      color="white"
                      _hover={{
                        bgGradient: buttonGradientHover,
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

        <Container maxW="7xl" py={12} order={2}>
          <Box
            bg={cardBg}
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            boxShadow={surfaceGlow}
            border="1px solid"
            borderColor={border}
            backdropFilter="blur(22px)"
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
              <Badge bg={softBlueBg} color={primaryBlue} borderRadius="full" border="1px solid" borderColor="rgba(34, 211, 238, 0.18)">
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
              ) : partnerList.length === 0 ? (
                <Text color={textSecondary}>No partner companies to show right now.</Text>
              ) : (
                partnersCarouselItems.map((company, idx) => (
                  (() => {
                    const isActivePartner =
                      (hoveredPartner?._id || hoveredPartner?.name) === (company?._id || company?.name);

                    return (
                  <Box
                    key={`${company._id || company.name}-${idx}`}
                    as={getPartnerWebsite(company) ? ChakraLink : 'div'}
                    href={getPartnerWebsite(company) || undefined}
                    target={getPartnerWebsite(company) ? '_blank' : undefined}
                    rel={getPartnerWebsite(company) ? 'noopener noreferrer' : undefined}
                    minW={{ base: '160px', md: '200px' }}
                    minH={{ base: '196px', md: '214px' }}
                    bg={isActivePartner ? 'white' : cardBg}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={isActivePartner ? primaryBlue : border}
                    backdropFilter="blur(18px)"
                    boxShadow={isActivePartner ? accentGlow : surfaceGlow}
                    p={4}
                    display="block"
                    textDecoration="none"
                    cursor={getPartnerWebsite(company) ? 'pointer' : 'default'}
                    transition="transform 0.2s ease, border-color 0.2s ease"
                    onMouseEnter={() => openPartnerDrawer(company)}
                    onClick={(event) => {
                      if (isMobileInteraction()) {
                        event.preventDefault();
                        openPartnerDrawer(company);
                      }
                    }}
                    _hover={{
                      transform: 'translateY(-2px)',
                      borderColor: primaryBlue,
                      boxShadow: accentGlow,
                    }}
                  >
                    <Box
                      w="100%"
                      h={{ base: '104px', md: '120px' }}
                      borderRadius="lg"
                      overflow="hidden"
                      bg="rgba(255,255,255,0.10)"
                      boxShadow={accentGlow}
                      mb={3}
                    >
                      <Image
                        src={company.logoUrl || company.logo}
                        alt={company.name}
                        w="100%"
                        h="100%"
                        objectFit={getPartnerImageFit(company)}
                        p={getPartnerImageFit(company) === 'cover' ? 0 : 3}
                      />
                    </Box>
                    <Text
                      fontWeight="semibold"
                      color={isActivePartner ? 'gray.900' : textPrimary}
                      textAlign="center"
                      noOfLines={2}
                    >
                      {company.name}
                    </Text>
                    {getPartnerWebsite(company) ? (
                      <Text
                        mt={2}
                        fontSize="xs"
                        color={isActivePartner ? 'gray.600' : textSecondary}
                        textAlign="center"
                        noOfLines={1}
                      >
                        {getPartnerWebsite(company).replace(/^https?:\/\//, '')}
                      </Text>
                    ) : null}
                  </Box>
                    );
                  })()
                ))
              )}
            </Flex>
          </Box>
        </Container>


        <Container maxW="7xl" py={12} order={3}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box
              bg={cardBg}
              borderRadius="xl"
              p={6}
              boxShadow={surfaceGlow}
              borderColor={border}
              borderWidth="1px"
              backdropFilter="blur(18px)"
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color={textPrimary}>
                  🎓 Scholarships & Free Trainings
                </Heading>
                <Badge bg={softBlueBg} color={primaryBlue} borderRadius="full" border="1px solid" borderColor="rgba(34, 211, 238, 0.18)">
                  Local & International
                </Badge>
              </Flex>
              <Text mb={6} color={textSecondary}>
                Thousands of learners accelerated through career-ready scholarships and free online trainings.
              </Text>
              <Button
                bgGradient={buttonGradient}
                color="white"
                borderRadius="full"
                _hover={{ bgGradient: buttonGradientHover, boxShadow: '0 14px 32px rgba(34, 211, 238, 0.24)' }}
              >
                Explore Opportunities
              </Button>
            </Box>

            <Box
              bg={cardBg}
              borderRadius="xl"
              p={6}
              boxShadow={surfaceGlow}
              borderColor={border}
              borderWidth="1px"
              backdropFilter="blur(18px)"
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color={textPrimary}>
                  📢 Telegram Job Alerts
                </Heading>
                <Badge bg="rgba(99, 102, 241, 0.14)" color={primaryGreen} borderRadius="full" border="1px solid" borderColor="rgba(99, 102, 241, 0.18)">
                  Real-time
                </Badge>
              </Flex>
              <Text mb={6} color={textSecondary}>
                Scan the QR code or follow the link to join curated alerts for remote jobs, scholarships, and trainings.
              </Text>
              <Flex
                gap={4}
                align={{ base: 'center', sm: 'center' }}
                direction={{ base: 'column', sm: 'row' }}
              >
                <Box
                  w={{ base: 28, sm: 20, md: 24 }}
                  h={{ base: 28, sm: 20, md: 24 }}
                  bg="white"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="rgba(34, 211, 238, 0.18)"
                  overflow="hidden"
                  flexShrink={0}
                  mx={{ base: 'auto', sm: 0 }}
                >
                  <Image
                    src="/assets/telegram-qr.png"
                    alt="Enisra Telegram QR code"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                </Box>
                <Button
                  as={ChakraLink}
                  href={telegramChannelUrl}
                  bgGradient={buttonGradient}
                  color="white"
                  borderRadius="full"
                  rightIcon={<FaTelegramPlane />}
                  _hover={{ bgGradient: buttonGradientHover, boxShadow: '0 14px 32px rgba(34, 211, 238, 0.24)' }}
                  alignSelf={{ base: 'center', sm: 'flex-start' }}
                >
                  Join Telegram Job Alerts
                </Button>
              </Flex>
            </Box>

          </SimpleGrid>
        </Container>

        <Container ref={jobsSectionRef} maxW="7xl" py={12} order={1}>
          <SimpleGrid columns={1} spacing={8}>
            <Box
              bg={cardBg}
              borderRadius="xl"
              p={6}
              boxShadow={surfaceGlow}
              maxH={{ base: 'none', lg: '600px' }}
              borderWidth="1px"
              borderColor={border}
              backdropFilter="blur(18px)"
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color={textPrimary}>
                  Latest Jobs
                </Heading>
                <Text color={textSecondary}>Scrollable list</Text>
              </Flex>
              <Divider borderColor={sectionDivider} mb={4} />
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={4}
                maxH={{ base: 'none', lg: '420px' }}
                overflowY={{ base: 'visible', lg: 'auto' }}
                pr={{ base: 0, lg: 2 }}
              >
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
                        boxShadow={surfaceGlow}
                        transition="border-color 0.2s ease"
                        backdropFilter="blur(18px)"
                        _hover={{ borderColor: primaryBlue, boxShadow: accentGlow }}
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
                        <HStack mt={4} spacing={3}>
                          <Button
                            size="sm"
                            borderRadius="full"
                            bgGradient={buttonGradient}
                            color="white"
                            _hover={{ bgGradient: buttonGradientHover, boxShadow: '0 12px 28px rgba(34, 211, 238, 0.22)' }}
                            onClick={() => handleApply(job)}
                          >
                            Apply Now
                          </Button>
                          <Button
                            size="sm"
                            borderRadius="full"
                            variant="outline"
                            borderColor={primaryBlue}
                            color={primaryBlue}
                            bg="rgba(255,255,255,0.03)"
                            _hover={{ bg: softBlueBg }}
                            onClick={() => {
                              const jobId = job?._id || job?.id;
                              const targetPath = jobId ? `/jobs/${jobId}` : '/jobs';
                              if (!hasScholarshipAccess()) {
                                navigate(buildScholarshipLoginRedirect(targetPath), {
                                  state: { redirectTo: targetPath },
                                });
                                return;
                              }
                              navigate(targetPath);
                            }}
                          >
                            Read more
                          </Button>
                        </HStack>
                      </Box>
                    );
                  })
                ) : (
                  <Text color={textSecondary}>No jobs available yet.</Text>
                )}
              </SimpleGrid>
              <Button
                mt={6}
                borderRadius="full"
                border="1px solid"
                borderColor="rgba(34, 211, 238, 0.42)"
                color={primaryBlue}
                bg="rgba(255,255,255,0.03)"
                _hover={{ bg: softBlueBg, borderColor: primaryBlue }}
                onClick={() => setShowAllJobs((prev) => !prev)}
                isDisabled={jobs.length <= 3}
              >
                {showAllJobs ? "Show Fewer Jobs" : "View All Jobs"}
              </Button>
            </Box>

          </SimpleGrid>
        </Container>

        <Box
          order={4}
          bgGradient={highlightGradient}
          color="white"
          borderRadius="2xl"
          mx="auto"
          px={8}
          py={6}
          maxW="7xl"
          my={6}
          boxShadow={accentGlow}
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
              bg="rgba(255,255,255,0.12)"
              color="white"
              borderRadius="full"
              border="1px solid"
              borderColor="rgba(255,255,255,0.18)"
              _hover={{ bg: 'rgba(255,255,255,0.18)' }}
              onClick={() => navigate('/login')}
            >
              Apply Now
            </Button>
          </Flex>
        </Box>
      </Box>

      <Box as="footer" bg="rgba(15, 23, 42, 0.92)" color="white" py={8} borderTop="1px solid" borderColor="rgba(148, 163, 184, 0.20)" backdropFilter="blur(18px)">
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <VStack align="flex-start" spacing={2}>
              <Heading size="md" color="white">
                Enisra
              </Heading>
              <Text color="rgba(255,255,255,0.7)">Copyright © TradEthiopia</Text>
            </VStack>
              <VStack align="flex-start" spacing={2}>
                <Heading size="sm" color="white">
                  Quick Links
                </Heading>
                <ChakraLink as={RouterLink} to="/" color="rgba(255,255,255,0.8)" _hover={{ color: primaryBlue }}>Jobs</ChakraLink>
                <ChakraLink as={RouterLink} to="/" color="rgba(255,255,255,0.8)" _hover={{ color: primaryBlue }}>Trainings</ChakraLink>
                <ChakraLink as={RouterLink} to="/" color="rgba(255,255,255,0.8)" _hover={{ color: primaryBlue }}>Scholarships</ChakraLink>
              </VStack>
              <VStack align="flex-start" spacing={2}>
                <Heading size="sm" color="white">
                  Contact
                </Heading>
                <ChakraLink color="rgba(255,255,255,0.8)" _hover={{ color: primaryBlue }} href={telegramChannelUrl}>
                  Telegram
                </ChakraLink>
              </VStack>
          </SimpleGrid>
        </Container>
      </Box>

    </Box>
  );
};

export default WelcomePage;
