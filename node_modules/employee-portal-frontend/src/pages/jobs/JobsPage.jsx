import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
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
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerCloseButton,
  VStack,
  Image,
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon, RepeatIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import { getJobApplyAccess, getJobApplyAccessMessage, openJobApplicationEmail } from '../../utils/jobEmail';
import { useLanguage } from '../../context/language.jsx';

const safeDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
};

const JobsPage = () => {
  const navigate = useNavigate();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const muted = useColorModeValue('gray.600', 'gray.300');
  const promoBg = useColorModeValue('gray.50', 'gray.800');
  const navBg = useColorModeValue('white', 'gray.800');
  const navBorder = useColorModeValue('gray.200', 'gray.700');
  const { t } = useLanguage();

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

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => fetchJobs(controller.signal), 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchJobs]);

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

  return (
    <Box bg={bg} minH="100vh" py={{ base: 8, md: 10 }}>
      <Box
        position="sticky"
        top={0}
        zIndex="sticky"
        bg={navBg}
        borderBottomWidth="1px"
        borderColor={navBorder}
        boxShadow="sm"
        py={3}
      >
        <Container maxW="7xl">
          <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
            <Heading size="md">{t('jobs')}</Heading>
            <HStack spacing={2} flexWrap="wrap" justify="flex-end">
              <Button as={RouterLink} to="/" size="sm" variant="ghost">
                {t('home')}
              </Button>
              <Button as={RouterLink} to="/scholarships" size="sm" variant="ghost">
                {t('scholarships')}
              </Button>
              <Button as={RouterLink} to="/free-trainings" size="sm" variant="ghost">
                {t('freeTrainings')}
              </Button>
              <Button as={RouterLink} to="/employee/profile" size="sm" variant="ghost">
                {t('profile')}
              </Button>
              <Button as={RouterLink} to="/login" size="sm" colorScheme="teal">
                {t('login')}
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl">
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="2xl" boxShadow="lg">
          <CardBody>
            <Heading size="lg" mb={2}>{t('jobs')}</Heading>
            <Text color={muted} mb={5}>
              {t('browseJobsSubtitle')}
            </Text>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3} mb={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon />
                </InputLeftElement>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('heroSearchPlaceholder')}
              />
            </InputGroup>
            <Select
              placeholder={t('location')}
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
                {filteredLocations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </Select>
            <Select
              placeholder={t('category')}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
                {filteredCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            <Select
              placeholder={t('type')}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
                {filteredTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </SimpleGrid>

            <HStack spacing={2} mb={6} justify="flex-start">
              <Button leftIcon={<RepeatIcon />} variant="outline" onClick={() => fetchJobs()} isLoading={loading}>
                {t('refresh')}
              </Button>
              <Button variant="ghost" onClick={resetFilters}>
                {t('clearFilters')}
              </Button>
            </HStack>

            {error ? (
              <Text color="red.500" mb={4}>{error}</Text>
            ) : null}

            {loading ? (
              <Flex justify="center" py={8}><Spinner size="xl" /></Flex>
            ) : jobs.length === 0 ? (
              <Text color={muted}>{t('noJobs')}</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {jobs.map((job) => (
                  <Box
                    key={job._id}
                    p={4}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    bg={cardBg}
                    boxShadow="sm"
                  >
                    <Heading size="sm" mb={1}>{job.title || 'Untitled job'}</Heading>
                    <HStack spacing={2} flexWrap="wrap" mb={2}>
                      {job.category ? <Badge colorScheme="purple">{job.category}</Badge> : null}
                      {job.type ? <Badge colorScheme="blue">{job.type}</Badge> : null}
                      {job.location ? <Badge colorScheme="green">{job.location}</Badge> : null}
                    </HStack>
                    {job.company ? (
                      <Text fontSize="sm" color={muted}>{t('company')}: {job.company}</Text>
                    ) : null}
                    {job.companyAddress ? (
                      <Text fontSize="sm" color={muted}>Company address: {job.companyAddress}</Text>
                    ) : null}
                    {job.deadline ? (
                      <Text fontSize="sm" color={muted}>{t('deadline')}: {safeDate(job.deadline)}</Text>
                    ) : null}
                    {job.description ? (
                      <Text fontSize="sm" mt={2} noOfLines={3}>{job.description}</Text>
                    ) : null}
                    <HStack spacing={3} mt={4}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedJob(job);
                          onOpen();
                        }}
                      >
                        Read more
                      </Button>
                  <Button
                    size="sm"
                    colorScheme="teal"
                    onClick={() => {
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
                        return;
                      }
                    }}
                  >
                    Apply
                  </Button>
                </HStack>
              </Box>
                ))}
              </SimpleGrid>
            )}

            <Divider my={8} />

            <Box bg={promoBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" p={4}>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'flex-start', md: 'center' }}
                justify="space-between"
                gap={4}
                mb={4}
              >
                <Box>
                  <Heading size="md">Companies That Work With Us</Heading>
                  <Text color={muted} fontSize="sm">
                    Swipe to explore partner companies.
                  </Text>
                </Box>
                <Badge colorScheme="teal" borderRadius="full">
                  Trusted Partners
                </Badge>
              </Flex>
              {partnersLoading ? (
                <Flex align="center" gap={2} py={4}>
                  <Spinner size="sm" />
                  <Text color={muted}>Loading partners...</Text>
                </Flex>
              ) : partnersError ? (
                <Text color="red.500">{partnersError}</Text>
              ) : partnerList.length === 0 ? (
                <Text color={muted}>No partner companies to show right now.</Text>
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
                      borderColor={borderColor}
                      borderRadius="xl"
                      bg={cardBg}
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
                      <Text fontWeight="semibold" color={muted} textAlign="center">
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

      <Drawer isOpen={isOpen} placement="left" onClose={() => { setSelectedJob(null); onClose(); }}>
        <DrawerOverlay />
        <DrawerContent maxW="420px">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            {selectedJob?.title || 'Job details'}
          </DrawerHeader>
          <DrawerBody>
            {selectedJob ? (
              <VStack align="stretch" spacing={3}>
                <Text fontWeight="semibold">{selectedJob.company || 'Company not specified'}</Text>
                {selectedJob.companyAddress ? (
                  <Text fontSize="sm" color={muted}>Company address: {selectedJob.companyAddress}</Text>
                ) : null}
                <HStack spacing={2} flexWrap="wrap">
                  {selectedJob.category ? <Badge colorScheme="purple">{selectedJob.category}</Badge> : null}
                  {selectedJob.type ? <Badge colorScheme="blue">{selectedJob.type}</Badge> : null}
                  {selectedJob.location ? <Badge colorScheme="green">{selectedJob.location}</Badge> : null}
                </HStack>
                {selectedJob.deadline ? (
                  <Text fontSize="sm" color={muted}>
                    Deadline: {safeDate(selectedJob.deadline)}
                  </Text>
                ) : null}
                {selectedJob.salary ? (
                  <Text fontSize="sm" color={muted}>
                    Salary: {selectedJob.salary}
                </Text>
              ) : null}
              <Divider />
              <Text fontSize="sm" whiteSpace="pre-wrap">
                {selectedJob.description || 'No description provided.'}
              </Text>
              <Button
                colorScheme="teal"
                onClick={() => {
                  const applyAccess = getJobApplyAccess();
                  if (!applyAccess.allowed) {
                    window.alert(getJobApplyAccessMessage(applyAccess.reason));
                    if (applyAccess.reason === 'not_authenticated') {
                      navigate('/login');
                    }
                    return;
                  }

                  const didOpenMailClient = openJobApplicationEmail(selectedJob);
                  if (!didOpenMailClient) {
                    window.alert('No contact email provided for this job.');
                    return;
                  }
                }}
              >
                Apply via email
              </Button>
            </VStack>
          ) : (
            <Text color={muted}>Select a job to view details.</Text>
          )}
        </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default JobsPage;


