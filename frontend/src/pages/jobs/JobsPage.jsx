import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  HStack,
  Flex,
  Spinner,
  Badge,
  Card,
  CardBody,
  Divider,
  IconButton,
  Tooltip,
  useToast,
  VStack,
  Image,
  Icon,
  useDisclosure,
  useColorMode,
  } from '@chakra-ui/react';
import { SearchIcon, RepeatIcon } from '@chakra-ui/icons';
import { FiHeart } from 'react-icons/fi';
import { FaBriefcase, FaMapMarkerAlt, FaBuilding, FaArrowRight } from 'react-icons/fa';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import { getJobApplyAccess, getJobApplyAccessMessage, openJobApplicationEmail } from '../../utils/jobEmail';
import { useLanguage } from '../../context/language.jsx';
import JobDetailsDrawer from '../../components/jobs/JobDetailsDrawer.jsx';

const safeDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
};

const getJobIdentifier = (job) => String(job?._id || job?.id || '');
const hasScholarshipAccess = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('scholarshipToken'));
};
const buildScholarshipLoginRedirect = (targetPath) =>
  `/scholarship-login?redirect=${encodeURIComponent(targetPath)}`;

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
  navBg: 'rgba(2, 6, 23, 0.96)',
  navBorder: 'rgba(34, 211, 238, 0.18)',
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
  navBg: 'rgba(2, 6, 23, 0.96)',
  navBorder: 'rgba(34, 211, 238, 0.16)',
};

const JobsPage = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const toast = useToast();
  const { jobId } = useParams();
  const { t } = useLanguage();
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
    primaryBlue,
    softBlueBg,
    success,
    warning,
    info,
    surfaceGlow,
    accentGlow,
    buttonGradient,
    buttonGradientHover,
    navBg,
    navBorder,
  } = colorMode === 'light' ? lightThemeColors : darkThemeColors;

  const [jobs, setJobs] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [error, setError] = useState('');
  const [partnersError, setPartnersError] = useState('');
  const [partnersRepeatCount, setPartnersRepeatCount] = useState(2);
  const [selectedJob, setSelectedJob] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const partnersCarouselRef = useRef(null);
  const partnersCarouselPausedRef = useRef(false);

  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [favoriteJobId, setFavoriteJobId] = useState('');

  const handleApply = useCallback((job) => {
    const applyAccess = getJobApplyAccess();
    if (!applyAccess.allowed) {
      window.alert(getJobApplyAccessMessage(applyAccess.reason));
      if (applyAccess.reason === 'not_authenticated') {
        navigate('/login');
      }
      return;
    }

    const didOpenMailClient = openJobApplicationEmail(job);
    if (!didOpenMailClient) {
      window.alert('No contact email provided for this job.');
    }
  }, [navigate]);

  const openJobDetails = useCallback((job) => {
    if (!job) return;

    const nextJobId = getJobIdentifier(job);
    if (!hasScholarshipAccess()) {
      const redirectTo = nextJobId ? `/jobs/${nextJobId}` : '/jobs';
      navigate(buildScholarshipLoginRedirect(redirectTo), {
        state: { redirectTo: nextJobId ? `/jobs/${nextJobId}` : '/jobs' },
      });
      return;
    }

    setSelectedJob(job);
    onOpen();

    if (nextJobId && String(jobId) !== nextJobId) {
      navigate(`/jobs/${nextJobId}`);
    }
  }, [jobId, navigate, onOpen]);

  const filteredLocations = useMemo(() => {
    const vals = jobs.map((j) => j.location).filter(Boolean);
    return Array.from(new Set(vals));
  }, [jobs]);

  const filteredCategories = useMemo(() => {
    const vals = jobs.map((j) => j.category).filter(Boolean);
    return Array.from(new Set(vals));
  }, [jobs]);

  const filteredTypes = useMemo(() => {
    const base = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
    const vals = jobs.map((j) => j.type).filter(Boolean);
    return Array.from(new Set([...base, ...vals]));
  }, [jobs]);

  const partnerList = partners;
  const partnersCarouselItems = useMemo(() => {
    if (!partnerList.length) return [];
    const repeats = Math.max(1, partnersRepeatCount);
    const items = [];
    for (let i = 0; i < repeats; i += 1) {
      items.push(...partnerList);
    }
    return items;
  }, [partnerList, partnersRepeatCount]);

  const fetchJobs = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/jobs', {
        params: {
          q: search || undefined,
          location: locationFilter || undefined,
          category: categoryFilter || undefined,
          type: typeFilter || undefined,
          limit: 100,
        },
        signal,
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      setJobs(Array.isArray(payload) ? payload : []);
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      setError(err?.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [search, locationFilter, categoryFilter, typeFilter]);

  const attemptedDirectJobLoadRef = useRef('');

  const fetchJobById = useCallback(async (id, signal) => {
    const response = await apiClient.get(`/jobs/${id}`, { signal });
    const payload = response?.data?.data ?? null;
    return payload;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => fetchJobs(controller.signal), 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchJobs]);

  const fetchFavorites = useCallback(async (signal) => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('userToken');
    if (!token) {
      setFavoriteIds(new Set());
      return;
    }

    try {
      const response = await apiClient.get('/favorites', { signal });
      const favorites = Array.isArray(response?.data?.data) ? response.data.data : [];
      const ids = new Set(
        favorites
          .map((favorite) => favorite?.jobId?._id || favorite?.jobId)
          .filter(Boolean)
          .map((id) => String(id))
      );
      setFavoriteIds(ids);
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      setFavoriteIds(new Set());
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchFavorites(controller.signal);
    return () => controller.abort();
  }, [fetchFavorites]);

  const handleFavoriteToggle = async (jobIdentifier) => {
    if (!jobIdentifier || favoriteJobId === jobIdentifier) return;

    if (typeof window !== 'undefined' && !localStorage.getItem('userToken')) {
      window.alert('Please log in to save favorite jobs.');
      navigate('/login');
      return;
    }

    const isFavorite = favoriteIds.has(jobIdentifier);
    setFavoriteJobId(jobIdentifier);

    try {
      if (isFavorite) {
        await apiClient.delete(`/favorites/${jobIdentifier}`);
      } else {
        await apiClient.post(`/favorites/${jobIdentifier}`);
      }

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFavorite) {
          next.delete(jobIdentifier);
        } else {
          next.add(jobIdentifier);
        }
        return next;
      });
    } catch (err) {
      if (err?.status === 409) {
        setFavoriteIds((prev) => new Set([...prev, jobIdentifier]));
      } else if (err?.status === 404) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(jobIdentifier);
          return next;
        });
      } else {
        toast({
          title: 'Unable to update favorite',
          description: err?.message || 'Please try again.',
          status: 'error',
          duration: 2500,
          isClosable: true,
        });
      }
    } finally {
      setFavoriteJobId('');
    }
  };

  useEffect(() => {
    if (!jobId) {
      attemptedDirectJobLoadRef.current = '';
      return;
    }

    if (!hasScholarshipAccess()) {
      navigate(buildScholarshipLoginRedirect(`/jobs/${jobId}`), {
        replace: true,
        state: { redirectTo: `/jobs/${jobId}` },
      });
      return;
    }

    const matched = jobs.find((job) => getJobIdentifier(job) === String(jobId));
    if (matched) {
      attemptedDirectJobLoadRef.current = String(jobId);
      setSelectedJob(matched);
      onOpen();
      return;
    }

    if (loading || attemptedDirectJobLoadRef.current === String(jobId)) {
      return;
    }

    attemptedDirectJobLoadRef.current = String(jobId);
    const controller = new AbortController();

    fetchJobById(jobId, controller.signal)
      .then((job) => {
        if (!job) {
          navigate('/jobs', { replace: true });
          return;
        }

        setSelectedJob(job);
        onOpen();
      })
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
          return;
        }

        toast({
          title: 'Job not available',
          description: 'That job could not be opened. Showing the latest listings instead.',
          status: 'info',
          duration: 3500,
          isClosable: true,
        });
        navigate('/jobs', { replace: true });
      });

    return () => controller.abort();
  }, [fetchJobById, jobId, jobs, loading, navigate, onOpen, toast]);

  useEffect(() => {
    const controller = new AbortController();
    const loadPartners = async () => {
      setPartnersLoading(true);
      setPartnersError('');
      try {
        const res = await apiClient.get('/partners', { signal: controller.signal });
        const payload = res?.data?.data ?? res?.data ?? [];
        setPartners(Array.isArray(payload) ? payload : []);
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        setPartnersError(err?.message || 'Failed to load partner companies');
        setPartners([]);
      } finally {
        setPartnersLoading(false);
      }
    };
    loadPartners();
    return () => controller.abort();
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

    // Ensure enough repeated items so looping remains smooth on wide screens.
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

    el.scrollLeft = 0;

    let loopPoint = 0;
    const updateLoopPoint = () => {
      const loopIndex = partnerList.length * halfCycles;
      const loopChild = el.children?.[loopIndex];
      loopPoint = loopChild ? loopChild.offsetLeft : el.scrollWidth / 2;
    };

    const handleResize = () => {
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

  const resetFilters = () => {
    setSearch('');
    setLocationFilter('');
    setCategoryFilter('');
    setTypeFilter('');
  };

  const handleCloseJobDrawer = () => {
    setSelectedJob(null);
    onClose();

    if (jobId) {
      navigate('/jobs', { replace: true });
    }
  };

  return (
    <Box bg={bgMain} minH="100vh" pt={0} pb={{ base: 8, md: 10 }}>
      <Box
        as="header"
        position="sticky"
        top={0}
        left={0}
        right={0}
        width="100%"
        zIndex={50}
        bg={navBg}
        borderBottomWidth="1px"
        borderColor={navBorder}
        boxShadow={surfaceGlow}
        backdropFilter="blur(20px)"
      >
        <Container maxW="7xl" py={4}>
          <Flex
            align="center"
            justify="space-between"
            gap={{ base: 3, md: 6 }}
            flexWrap={{ base: 'wrap', md: 'nowrap' }}
          >
            <Heading
              size={{ base: 'md', md: 'lg' }}
              color="white"
              letterSpacing="tight"
              pl={{ base: 1, md: 2 }}
            >
              {t('jobs')}
            </Heading>
            <HStack spacing={2} flexWrap="wrap" justify="flex-end" ml="auto">
              <Button
                as={RouterLink}
                to="/"
                size="sm"
                variant="ghost"
                borderRadius="full"
                color="white"
                _hover={{ bg: softBlueBg, color: primaryBlue }}
              >
                {t('home')}
              </Button>
              <Button
                as={RouterLink}
                to="/scholarship-login"
                size="sm"
                variant="ghost"
                borderRadius="full"
                color="white"
                _hover={{ bg: softBlueBg, color: primaryBlue }}
              >
                {t('scholarships')}
              </Button>
              <Button
                as={RouterLink}
                to="/free-training-courses"
                size="sm"
                variant="ghost"
                borderRadius="full"
                color="white"
                _hover={{ bg: softBlueBg, color: primaryBlue }}
              >
                {t('freeTrainings')}
              </Button>
              <Button
                as={RouterLink}
                to="/employee/profile"
                size="sm"
                variant="ghost"
                borderRadius="full"
                color="white"
                _hover={{ bg: softBlueBg, color: primaryBlue }}
              >
                {t('profile')}
              </Button>
              <Button
                as={RouterLink}
                to="/login"
                size="sm"
                borderRadius="full"
                color="white"
                bgGradient={buttonGradient}
                _hover={{ bgGradient: buttonGradientHover, boxShadow: accentGlow }}
              >
                {t('login')}
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl">
        <Card
          mt={{ base: 6, md: 8 }}
          bg={cardBg}
          borderWidth="1px"
          borderColor={border}
          borderRadius="2xl"
          boxShadow={surfaceGlow}
          backdropFilter="blur(18px)"
          overflow="hidden"
        >
          <CardBody>
            <Box
              mb={6}
              px={{ base: 4, md: 5 }}
              py={{ base: 4, md: 5 }}
              borderRadius="2xl"
              bg={softBlueBg}
              borderWidth="1px"
              borderColor={border}
            >
              <Heading size="lg" mb={2} color={textPrimary}>{t('jobs')}</Heading>
              <Text color={textSecondary}>
                {t('browseJobsSubtitle')}
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3} mb={4}>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none" color={placeholder}>
                  <SearchIcon />
                </InputLeftElement>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('heroSearchPlaceholder')}
                  borderRadius="xl"
                  borderColor={border}
                  bg={softBlueBg}
                  color={textPrimary}
                  _placeholder={{ color: placeholder }}
                  _hover={{ borderColor: primaryBlue }}
                  _focusVisible={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
                />
              </InputGroup>
              <Select
                placeholder={t('location')}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                size="lg"
                borderRadius="xl"
                borderColor={border}
                bg={softBlueBg}
                color={textPrimary}
                _hover={{ borderColor: primaryBlue }}
                _focusVisible={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
              >
                {filteredLocations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </Select>
              <Select
                placeholder={t('category')}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                size="lg"
                borderRadius="xl"
                borderColor={border}
                bg={softBlueBg}
                color={textPrimary}
                _hover={{ borderColor: primaryBlue }}
                _focusVisible={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
              >
                {filteredCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
              <Select
                placeholder={t('type')}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                size="lg"
                borderRadius="xl"
                borderColor={border}
                bg={softBlueBg}
                color={textPrimary}
                _hover={{ borderColor: primaryBlue }}
                _focusVisible={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
              >
                {filteredTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </SimpleGrid>

            <HStack spacing={2} mb={6} justify="flex-start">
              <Button
                leftIcon={<RepeatIcon />}
                variant="outline"
                onClick={() => fetchJobs()}
                isLoading={loading}
                borderRadius="full"
                borderColor={primaryBlue}
                color={primaryBlue}
                bg="rgba(255,255,255,0.03)"
                _hover={{ bg: softBlueBg, borderColor: primaryBlue }}
              >
                {t('refresh')}
              </Button>
              <Button variant="ghost" onClick={resetFilters} borderRadius="full" color={textSecondary} _hover={{ bg: softBlueBg, color: primaryBlue }}>
                {t('clearFilters')}
              </Button>
            </HStack>

            {error ? (
              <Text color={warning} mb={4}>{error}</Text>
            ) : null}

            {loading ? (
              <Flex justify="center" py={8}><Spinner size="xl" color={primaryGreen} /></Flex>
            ) : jobs.length === 0 ? (
              <Text color={textMuted}>{t('noJobs')}</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {jobs.map((job) => {
                  const jobIdentifier = getJobIdentifier(job);
                  const isFavorite = jobIdentifier ? favoriteIds.has(jobIdentifier) : false;
                  const hasVerifiedFlag = typeof job.verified === 'boolean';
                  const badgeLabel = hasVerifiedFlag
                    ? job.verified
                      ? 'Verified Employer'
                      : 'In Review'
                    : 'Open';
                  const badgeBg = hasVerifiedFlag ? (job.verified ? success : warning) : info;

                  return (
                    <Box
                      key={job._id || job.id || job.title}
                      p={4}
                      borderWidth="1px"
                      borderColor={border}
                      borderRadius="lg"
                      bg={cardBg}
                      boxShadow={surfaceGlow}
                      backdropFilter="blur(18px)"
                      transition="border-color 0.2s ease, transform 0.2s ease"
                      _hover={{ borderColor: primaryBlue, boxShadow: accentGlow, transform: 'translateY(-2px)' }}
                    >
                      <Flex justify="space-between" align="flex-start" gap={3} mb={1}>
                        <VStack align="flex-start" spacing={2} flex="1">
                          <Flex justify="space-between" align="center" w="full">
                            <HStack spacing={2}>
                              <Icon as={FaBriefcase} color={primaryBlue} />
                              <Badge bg={badgeBg} color="white" borderRadius="full">
                                {badgeLabel}
                              </Badge>
                            </HStack>
                          </Flex>
                          <Heading size="sm" color={textPrimary}>{job.title || 'Untitled job'}</Heading>
                        </VStack>
                        {jobIdentifier ? (
                          <Tooltip label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                            <IconButton
                              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                              icon={<FiHeart />}
                              size="sm"
                              variant={isFavorite ? 'solid' : 'ghost'}
                              bg={isFavorite ? 'rgba(248, 113, 113, 0.16)' : 'transparent'}
                              color={isFavorite ? warning : textMuted}
                              _hover={{ bg: softBlueBg, color: primaryBlue }}
                              isLoading={favoriteJobId === jobIdentifier}
                              onClick={() => handleFavoriteToggle(jobIdentifier)}
                            />
                          </Tooltip>
                        ) : null}
                      </Flex>

                      <HStack spacing={2} flexWrap="wrap" mb={2}>
                        {job.category ? <Badge bg="rgba(99, 102, 241, 0.14)" color={primaryGreen}>{job.category}</Badge> : null}
                        {job.type ? <Badge bg={softBlueBg} color={primaryBlue}>{job.type}</Badge> : null}
                        {job.location ? <Badge bg="rgba(34, 197, 94, 0.14)" color={success}>{job.location}</Badge> : null}
                      </HStack>
                      {job.company ? (
                        <HStack spacing={2} align="flex-start">
                          <Icon as={FaBuilding} color={textMuted} mt="3px" />
                          <Text fontSize="sm" color={textSecondary}>{t('company')}: {job.company}</Text>
                        </HStack>
                      ) : null}
                      {job.companyAddress ? (
                        <Text fontSize="sm" color={textMuted}>Company address: {job.companyAddress}</Text>
                      ) : null}
                      {job.deadline ? (
                        <Text fontSize="sm" color={textSecondary} mt={2}>{t('deadline')}: {safeDate(job.deadline)}</Text>
                      ) : null}
                      {job.location ? (
                        <HStack spacing={2} mt={2}>
                          <Icon as={FaMapMarkerAlt} color={textMuted} />
                          <Text fontSize="sm" color={textMuted}>{job.location}</Text>
                        </HStack>
                      ) : null}
                      {job.description ? (
                        <Text fontSize="sm" mt={2} noOfLines={3} color={textSecondary}>{job.description}</Text>
                      ) : null}
                      <HStack spacing={3} mt={4}>
                        <Button
                          size="sm"
                          variant="outline"
                          borderRadius="full"
                          borderColor={primaryBlue}
                          color={primaryBlue}
                          bg="rgba(255,255,255,0.03)"
                          _hover={{ bg: softBlueBg }}
                          onClick={() => openJobDetails(job)}
                        >
                          Read more
                        </Button>
                        <Button
                          size="sm"
                          borderRadius="full"
                          color="white"
                          bgGradient={buttonGradient}
                          rightIcon={<FaArrowRight />}
                          _hover={{ bgGradient: buttonGradientHover, boxShadow: accentGlow }}
                          onClick={() => handleApply(job)}
                        >
                          Apply
                        </Button>
                      </HStack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}

            <Divider my={8} borderColor={sectionDivider} />

            <Box bg={softBlueBg} borderWidth="1px" borderColor={border} borderRadius="lg" p={4} backdropFilter="blur(18px)">
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'flex-start', md: 'center' }}
                justify="space-between"
                gap={4}
                mb={4}
              >
                <Box>
                  <Heading size="md" color={textPrimary}>Companies That Work With Us</Heading>
                  <Text color={textSecondary} fontSize="sm">
                    Swipe to explore partner companies.
                  </Text>
                </Box>
                <Badge bg={softBlueBg} color={primaryBlue} borderRadius="full" border="1px solid" borderColor={border}>
                  Trusted Partners
                </Badge>
              </Flex>
              {partnersLoading ? (
                <Flex align="center" gap={2} py={4}>
                  <Spinner size="sm" color={primaryGreen} />
                  <Text color={textSecondary}>Loading partners...</Text>
                </Flex>
              ) : partnersError ? (
                <Text color={warning}>{partnersError}</Text>
              ) : partnerList.length === 0 ? (
                <Text color={textMuted}>No partner companies to show right now.</Text>
              ) : (
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
                  {partnersCarouselItems.map((partner, idx) => (
                    <Box
                      key={`${partner._id || partner.name}-${idx}`}
                      minW={{ base: '160px', md: '200px' }}
                      p={4}
                      borderWidth="1px"
                      borderColor={border}
                      borderRadius="xl"
                      bg={cardBg}
                      boxShadow={surfaceGlow}
                      backdropFilter="blur(18px)"
                    >
                      <Box
                        w="100%"
                        h={{ base: '88px', md: '96px' }}
                        borderRadius="lg"
                        overflow="hidden"
                        bg="white"
                        boxShadow="sm"
                        mb={3}
                      >
                        <Image
                          src={partner.logoUrl || partner.logo}
                          alt={partner.name || 'Partner'}
                          w="100%"
                          h="100%"
                          objectFit="contain"
                          p={3}
                        />
                      </Box>
                      <Text fontWeight="semibold" color={textSecondary} textAlign="center">
                        {partner.name || 'Partner'}
                      </Text>
                    </Box>
                  ))}
                </Flex>
              )}
            </Box>
          </CardBody>
        </Card>
      </Container>

      <JobDetailsDrawer
        applyLabel="Apply via email"
        formatDate={safeDate}
        isOpen={isOpen}
        job={selectedJob}
        onApply={handleApply}
        onClose={handleCloseJobDrawer}
      />
    </Box>
  );
};

export default JobsPage;




