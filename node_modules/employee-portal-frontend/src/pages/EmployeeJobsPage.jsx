import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Text,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { HamburgerIcon, MoonIcon, RepeatIcon, SearchIcon, SunIcon } from '@chakra-ui/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import apiClient from '../utils/apiClient';
import { openJobApplicationEmail } from '../utils/jobEmail';
import EmployeeNavDrawer from '../components/employee/EmployeeNavDrawer';
import EmployeeSidebar from '../components/employee/EmployeeSidebar';

const safeDateLabel = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'PPP');
};

const EmployeeJobsPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const panelBg = useColorModeValue('white', 'gray.700');
  const jobCardBg = useColorModeValue('gray.50', 'gray.800');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isDesktop = useBreakpointValue({ base: false, lg: true }) || false;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('employeeSidebarCollapsed') === '1'
  );

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

  useEffect(() => {
    localStorage.setItem('employeeSidebarCollapsed', sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <Box
      maxW={{ base: '100%', sm: '95%', md: '100%', lg: '95%', xl: '85%' }}
      mx="auto"
      p={6}
      position="relative"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
      boxShadow="xl"
      mt="10"
    >
      {!isDesktop ? (
        <IconButton
          aria-label="Open menu"
          icon={<HamburgerIcon />}
          position="absolute"
          top="4"
          left="4"
          onClick={onOpen}
          borderRadius="full"
          boxShadow="lg"
          size="lg"
          colorScheme="teal"
        />
      ) : null}
      <IconButton
        aria-label="Toggle theme"
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        position="absolute"
        top="4"
        right="4"
        onClick={toggleColorMode}
        borderRadius="full"
        boxShadow="lg"
        size="lg"
        colorScheme={colorMode === 'light' ? 'teal' : 'yellow'}
      />

      <Flex
        direction={{ base: 'column', lg: 'row' }}
        gap={6}
        align="flex-start"
        justify={{ base: 'flex-start', lg: 'center' }}
      >
        {isDesktop ? (
          <EmployeeSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
          />
        ) : null}
        <Flex
          flex="1"
          direction="column"
          bg={panelBg}
          p={6}
          borderRadius="lg"
          boxShadow="lg"
        >
          <Heading as="h2" size="lg" textAlign="center" mb={6}>
            Jobs
          </Heading>

          <HStack spacing={3} mb={4} flexWrap="wrap">
            <InputGroup maxW="420px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon />
              </InputLeftElement>
              <Input
                value={search}
                onChange={onSearchChange}
                placeholder="Search jobs..."
              />
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
            <Text color="gray.500">No jobs found.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {jobs.map((job) => (
                <Box
                  key={job._id}
                  p={5}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg={jobCardBg}
                >
                  <Heading size="md">{job.title || 'Untitled job'}</Heading>

                  <HStack mt={2} spacing={2} flexWrap="wrap">
                    {job.category ? (
                      <Badge colorScheme="purple">{job.category}</Badge>
                    ) : null}
                    {job.type ? <Badge colorScheme="blue">{job.type}</Badge> : null}
                    {job.location ? (
                      <Badge colorScheme="green">{job.location}</Badge>
                    ) : null}
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
                      const didOpenMailClient = openJobApplicationEmail(job);
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
            <Text fontSize="sm" color="gray.500">
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
        </Flex>
      </Flex>

      <EmployeeNavDrawer isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default EmployeeJobsPage;
