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
  SimpleGrid,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { RepeatIcon, SearchIcon } from '@chakra-ui/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import apiClient from '../../utils/apiClient';

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

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 25;

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPages = useMemo(
    () => Math.max(Math.ceil((total || 0) / limit), 1),
    [total]
  );

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
    [search, page]
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
              Browse approved jobs and search by keyword.
            </Text>
          </Box>

          <HStack spacing={2} flexWrap="wrap" justify={{ base: 'flex-start', md: 'flex-end' }}>
            <InputGroup maxW="320px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon />
              </InputLeftElement>
              <Input value={search} onChange={onSearchChange} placeholder="Search jobs..." />
            </InputGroup>
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
      </CardBody>
    </Card>
  );
};

export default EmployeeJobs;

