import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon, RepeatIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import { useLanguage } from '../../context/language.jsx';

const safeDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
};

const JobsPage = () => {
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
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [error, setError] = useState('');
  const [partnersError, setPartnersError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
                      const email = job.contactEmail;
                      if (!email) {
                        window.alert('No contact email provided for this job.');
                        return;
                      }
                      const subject = encodeURIComponent(`Application for ${job.title || 'job'}`);
                      window.location.href = `mailto:${email}?subject=${subject}`;
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
              <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={3}>
                <Heading size="md">Companies That Work With Us</Heading>
                <Badge colorScheme="teal">{partners.length || 0} partners</Badge>
              </Flex>
              {partnersLoading ? (
                <Flex align="center" gap={2}><Spinner size="sm" /><Text color={muted}>Loading companies�</Text></Flex>
              ) : partnersError ? (
                <Text color="red.500">{partnersError}</Text>
              ) : partners.length === 0 ? (
                <Text color={muted}>No partner companies to show right now.</Text>
              ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                  {partners.map((partner) => (
                    <Box
                      key={partner._id || partner.name}
                      p={3}
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="md"
                      bg={cardBg}
                    >
                      <Heading size="sm" mb={1}>{partner.name || 'Partner'}</Heading>
                      <Text fontSize="sm" color={muted} noOfLines={3}>
                        {partner.description || 'Trusted company partnered with us.'}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
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
                  const email = selectedJob?.contactEmail;
                  if (!email) {
                    window.alert('No contact email provided for this job.');
                    return;
                  }
                  const subject = encodeURIComponent(`Application for ${selectedJob.title || 'job'}`);
                  window.location.href = `mailto:${email}?subject=${subject}`;
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


