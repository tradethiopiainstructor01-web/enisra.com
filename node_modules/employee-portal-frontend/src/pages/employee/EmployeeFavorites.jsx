import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Spinner,
  Text,
  Tooltip,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import { getJobApplyAccess, getJobApplyAccessMessage, openJobApplicationEmail } from '../../utils/jobEmail';

const safeDateLabel = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'PPP');
};

const EmployeeFavorites = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedText = useColorModeValue('gray.600', 'gray.300');
  const jobCardBg = useColorModeValue('gray.50', 'gray.900');

  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [favoriteJobId, setFavoriteJobId] = useState('');

  const fetchFavorites = useCallback(async (signal) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/favorites', { signal });
      const data = Array.isArray(response?.data?.data) ? response.data.data : [];
      setFavorites(data);
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      setError(err?.message || 'Failed to load favorite jobs.');
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchFavorites(controller.signal);
    return () => controller.abort();
  }, [fetchFavorites]);

  const visibleFavorites = useMemo(
    () => favorites.filter((favorite) => favorite?.jobId && typeof favorite.jobId === 'object'),
    [favorites]
  );

  const handleRemoveFavorite = async (jobId) => {
    if (!jobId || favoriteJobId === jobId) return;

    setFavoriteJobId(jobId);
    try {
      await apiClient.delete(`/favorites/${jobId}`);
      setFavorites((prev) =>
        prev.filter((favorite) => String(favorite?.jobId?._id || favorite?.jobId) !== jobId)
      );
    } catch (err) {
      toast({
        title: 'Unable to remove favorite',
        description: err?.message || 'Please try again.',
        status: 'error',
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setFavoriteJobId('');
    }
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
            <Heading size="md">Favorites</Heading>
            <Text fontSize="sm" color={mutedText} mt={1}>
              Review your saved jobs and apply when ready.
            </Text>
          </Box>

          <HStack spacing={2} flexWrap="wrap" justify={{ base: 'flex-start', md: 'flex-end' }}>
            <Button
              leftIcon={<RepeatIcon />}
              variant="outline"
              onClick={() => fetchFavorites()}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button variant="ghost" onClick={() => navigate('/employee/jobs')}>
              Browse jobs
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
        ) : visibleFavorites.length === 0 ? (
          <Box borderWidth="1px" borderColor={borderColor} borderRadius="lg" p={6} bg={jobCardBg}>
            <Text color={mutedText} mb={3}>
              No favorite jobs yet.
            </Text>
            <Button size="sm" colorScheme="teal" onClick={() => navigate('/employee/jobs')}>
              View jobs
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {visibleFavorites.map((favorite) => {
              const job = favorite.jobId;
              const jobId = String(job?._id || '');
              return (
                <Box
                  key={favorite?._id || jobId}
                  p={5}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  bg={jobCardBg}
                >
                  <Flex justify="space-between" align="flex-start" gap={3}>
                    <Heading size="sm">{job.title || 'Untitled job'}</Heading>
                    {jobId ? (
                      <Tooltip label="Remove from favorites">
                        <IconButton
                          aria-label="Remove from favorites"
                          icon={<FiHeart />}
                          size="sm"
                          colorScheme="red"
                          variant="solid"
                          isLoading={favoriteJobId === jobId}
                          onClick={() => handleRemoveFavorite(jobId)}
                        />
                      </Tooltip>
                    ) : null}
                  </Flex>

                  <HStack mt={2} spacing={2} flexWrap="wrap">
                    {job.category ? <Badge colorScheme="purple">{job.category}</Badge> : null}
                    {job.type ? <Badge colorScheme="blue">{job.type}</Badge> : null}
                    {job.location ? <Badge colorScheme="green">{job.location}</Badge> : null}
                  </HStack>

                  {job.company ? (
                    <Text mt={3} fontSize="sm">
                      <Text as="span" fontWeight="semibold">
                        Company:
                      </Text>{' '}
                      {job.company}
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

                  {favorite?.createdAt ? (
                    <Text mt={1} fontSize="sm" color={mutedText}>
                      Saved: {safeDateLabel(favorite.createdAt)}
                    </Text>
                  ) : null}

                  {job.description ? (
                    <Text mt={3} fontSize="sm" noOfLines={4}>
                      {job.description}
                    </Text>
                  ) : null}

                  <Button
                    mt={4}
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

                      const didOpenMailClient = openJobApplicationEmail(
                        job,
                        'Hello,\n\nI would like to apply for this position. Please find my details attached.\n\nThank you.'
                      );
                      if (!didOpenMailClient) {
                        window.alert('No contact email provided for this job.');
                      }
                    }}
                  >
                    Apply
                  </Button>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </CardBody>
    </Card>
  );
};

export default EmployeeFavorites;
