import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { RepeatIcon, SearchIcon } from '@chakra-ui/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import apiClient from '../../utils/apiClient';
import { openJobApplicationEmail } from '../../utils/jobEmail';

const safeDateLabel = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'PPP');
};

const EmployeeJobs = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedText = useColorModeValue('gray.600', 'gray.300');
  const jobCardBg = useColorModeValue('gray.50', 'gray.900');
  const promoBg = useColorModeValue('gray.50', 'gray.800');

  const [search, setSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const limit = 25;

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [partners, setPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnersError, setPartnersError] = useState('');

  const totalPages = useMemo(
    () => Math.max(Math.ceil((total || 0) / limit), 1),
    [total]
  );

  const locationOptions = useMemo(() => {
    const values = jobs.map((j) => j.location).filter(Boolean);
    return Array.from(new Set(values));
  }, [jobs]);

  const categoryOptions = useMemo(() => {
    const values = jobs.map((j) => j.category).filter(Boolean);
    return Array.from(new Set(values));
  }, [jobs]);

  const typeOptions = useMemo(() => {
    const base = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
    const values = jobs.map((j) => j.type).filter(Boolean);
    return Array.from(new Set([...base, ...values]));
  }, [jobs]);

  const fetchJobs = useCallback(
    async (signal) => {
      setIsLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/jobs', {
          params: {
            q: search || undefined,
            page,
            limit,
            location: filterLocation || undefined,
            category: filterCategory || undefined,
            type: filterType || undefined,
          },
          signal,
        });

        const payload = res?.data;
        if (!payload?.success) {
          throw new Error(payload?.message || 'Failed to fetch jobs.');
        }

        setJobs(Array.isArray(payload.data) ? payload.data : []);
        setTotal(typeof payload.total === 'number' ? payload.total : 0);
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        setError(err?.message || 'Failed to fetch jobs.');
        setJobs([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [search, page, filterLocation, filterCategory, filterType]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => fetchJobs(controller.signal), 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchJobs]);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const onFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  // Load partner promotions
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
        setPartnersError(err?.message || 'Failed to load partner promotions.');
        setPartners([]);
      } finally {
        setPartnersLoading(false);
      }
    };
    loadPartners();
    return () => controller.abort();
  }, []);

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
            <Heading size="md">Jobs</Heading>
            <Text fontSize="sm" color={mutedText} mt={1}>
              Browse approved jobs and search or filter by keyword, location, category, or type.
            </Text>
          </Box>

          <HStack spacing={2} flexWrap="wrap" justify={{ base: 'flex-start', md: 'flex-end' }}>
            <InputGroup maxW="280px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon />
              </InputLeftElement>
              <Input value={search} onChange={onSearchChange} placeholder="Search jobs..." />
            </InputGroup>
            <Select
              placeholder="Location"
              maxW="180px"
              value={filterLocation}
              onChange={onFilterChange(setFilterLocation)}
            >
              {locationOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Category"
              maxW="180px"
              value={filterCategory}
              onChange={onFilterChange(setFilterCategory)}
            >
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Type"
              maxW="160px"
              value={filterType}
              onChange={onFilterChange(setFilterType)}
            >
              {typeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
            <Button
              leftIcon={<RepeatIcon />}
              variant="outline"
              onClick={() => fetchJobs()}
              isLoading={isLoading}
            >
              Refresh
            </Button>
          </HStack>
        </Flex>

        {error ? (
          <Text color="red.500" mb={4}>
            {error}
          </Text>
        ) : null}

        {isLoading ? (
          <Flex justify="center" py={10}>
            <Spinner size="xl" />
          </Flex>
        ) : jobs.length === 0 ? (
          <Text color={mutedText}>No jobs found.</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {jobs.map((job) => (
              <Box
                key={job._id}
                p={5}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                bg={jobCardBg}
              >
                <Heading size="sm">{job.title || 'Untitled job'}</Heading>

                <HStack mt={2} spacing={2} flexWrap="wrap">
                  {job.category ? <Badge colorScheme="purple">{job.category}</Badge> : null}
                  {job.type ? <Badge colorScheme="blue">{job.type}</Badge> : null}
                  {job.location ? <Badge colorScheme="green">{job.location}</Badge> : null}
                </HStack>

                {job.department ? (
                  <Text mt={3} fontSize="sm">
                    <Text as="span" fontWeight="semibold">
                      Department:
                    </Text>{' '}
                    {job.department}
                  </Text>
                ) : null}

                {job.salary ? (
                  <Text mt={1} fontSize="sm">
                    <Text as="span" fontWeight="semibold">
                      Salary:
                    </Text>{' '}
                    {job.salary}
                  </Text>
                ) : null}

                {job.deadline ? (
                  <Text mt={1} fontSize="sm">
                    <Text as="span" fontWeight="semibold">
                      Deadline:
                    </Text>{' '}
                    {safeDateLabel(job.deadline)}
                  </Text>
                ) : null}

                {job.description ? (
                  <Text mt={3} fontSize="sm" noOfLines={5}>
                    {job.description}
                  </Text>
                ) : null}

                <Button
                  mt={4}
                  size="sm"
                  colorScheme="teal"
                  onClick={() => {
                    const didOpenMailClient = openJobApplicationEmail(
                      job,
                      'Hello,\n\nI would like to apply for this position. Please find my details attached.\n\nThank you.'
                    );
                    if (!didOpenMailClient) {
                      window.alert('No contact email provided for this job.');
                      return;
                    }
                  }}
                >
                  Apply
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        )}

        <HStack justify="space-between" mt={8} flexWrap="wrap" gap={3}>
          <Text fontSize="sm" color={mutedText}>
            Page {page} of {totalPages} {total ? `(${total} jobs)` : ''}
          </Text>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              isDisabled={page <= 1}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              isDisabled={page >= totalPages}
            >
              Next
            </Button>
          </HStack>
        </HStack>

        {/* Promotions / Partner companies */}
        <Box mt={10} p={5} borderWidth="1px" borderColor={borderColor} borderRadius="xl" bg={promoBg}>
          <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
            <Heading size="md">Promoted Companies</Heading>
            <Badge colorScheme="teal">{partners.length || 0} partners</Badge>
          </Flex>
          {partnersLoading ? (
            <Flex align="center" gap={2}>
              <Spinner size="sm" />
              <Text color={mutedText}>Loading companies…</Text>
            </Flex>
          ) : partnersError ? (
            <Text color="red.500">{partnersError}</Text>
          ) : partners.length === 0 ? (
            <Text color={mutedText}>No partner promotions available right now.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
              {partners.map((partner) => (
                <Box
                  key={partner._id || partner.name}
                  p={4}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  bg={cardBg}
                >
                  <Heading size="sm" mb={2}>
                    {partner.name || 'Partner'}
                  </Heading>
                  {partner.description ? (
                    <Text fontSize="sm" color={mutedText} noOfLines={3}>
                      {partner.description}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color={mutedText}>
                      Trusted company working with us.
                    </Text>
                  )}
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </CardBody>
    </Card>
  );
};

export default EmployeeJobs;
