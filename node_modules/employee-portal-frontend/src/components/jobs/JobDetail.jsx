import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  IconButton,
  Flex,
  useColorModeValue,
  Button,
  Divider,
  Alert,
  AlertIcon,
  useToast,
  Spinner,
  Tooltip,
} from '@chakra-ui/react';
import { FiHeart, FiMapPin, FiBriefcase, FiDollarSign, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import apiClient from '../../utils/apiClient';
import { openJobApplicationEmail } from '../../utils/jobEmail';

const JobDetail = ({ jobId, onBack, onApply }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const badgeBg = useColorModeValue('gray.100', 'gray.700');
  const badgeColor = useColorModeValue('gray.800', 'gray.200');

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/jobs/${jobId}`);
      if (response.data.success) {
        setJob(response.data.data);
        
        // Check if job is favorited
        const favoriteResponse = await apiClient.get(`/favorites/${jobId}/check`);
        setIsFavorite(favoriteResponse.data.isFavorite);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load job details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = async () => {
    if (favoriteLoading) return;
    
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await apiClient.delete(`/favorites/${jobId}`);
        setIsFavorite(false);
        toast({
          title: 'Removed from favorites',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
      } else {
        await apiClient.post(`/favorites/${jobId}`);
        setIsFavorite(true);
        toast({
          title: 'Added to favorites',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update favorite status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!job) {
    return (
      <Alert status="error">
        <AlertIcon />
        Job not found
      </Alert>
    );
  }

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
      <CardBody p={6}>
        <Flex justify="space-between" align="flex-start" mb={4}>
          <VStack align="flex-start" spacing={2}>
            <Heading size="lg">{job.title}</Heading>
            <Text fontSize="lg" color="gray.600" fontWeight="medium">
              {job.postedByName || 'Unknown Company'}
            </Text>
          </VStack>
          
          <HStack spacing={2}>
            <Tooltip label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <IconButton
                icon={<FiHeart />}
                size="md"
                variant={isFavorite ? 'solid' : 'outline'}
                colorScheme={isFavorite ? 'red' : 'gray'}
                onClick={handleFavoriteClick}
                isLoading={favoriteLoading}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              />
            </Tooltip>
            
            <Button onClick={onBack} variant="outline">
              Back to Jobs
            </Button>
          </HStack>
        </Flex>
        
        <HStack wrap="wrap" spacing={4} mb={6}>
          {job.category && (
            <Badge bg={badgeBg} color={badgeColor} px={3} py={1} borderRadius="full" fontSize="sm">
              {job.category}
            </Badge>
          )}
          
          {job.type && (
            <HStack>
              <FiBriefcase />
              <Text>{job.type}</Text>
            </HStack>
          )}
          
          {job.location && (
            <HStack>
              <FiMapPin />
              <Text>{job.location}</Text>
            </HStack>
          )}
          
          {job.salary && (
            <HStack>
              <FiDollarSign />
              <Text>{job.salary}</Text>
            </HStack>
          )}
          
          {job.deadline && (
            <HStack>
              <FiCalendar />
              <Text>Deadline: {formatDate(job.deadline)}</Text>
            </HStack>
          )}
          
          {job.postedAt && (
            <HStack>
              <FiClock />
              <Text>Posted: {formatDate(job.postedAt)}</Text>
            </HStack>
          )}
        </HStack>
        
        <VStack align="flex-start" spacing={4} mb={6}>
          <Heading size="md">Job Description</Heading>
          <Text whiteSpace="pre-wrap">{job.description || 'No description provided.'}</Text>
        </VStack>
        
        {(job.department || job.address) && (
          <>
            <Divider mb={4} />
            <VStack align="flex-start" spacing={2}>
              {job.department && (
                <HStack>
                  <FiUser />
                  <Text><strong>Department:</strong> {job.department}</Text>
                </HStack>
              )}
              {job.address && (
                <HStack>
                  <FiMapPin />
                  <Text><strong>Address:</strong> {job.address}</Text>
                </HStack>
              )}
            </VStack>
          </>
        )}
        
        <Button
          colorScheme="green"
          size="lg"
          width="full"
          onClick={() => {
            if (onApply) {
              onApply(job);
              return;
            }
            const didOpenMailClient = openJobApplicationEmail(job);
            if (!didOpenMailClient) {
              alert('No contact email provided for this job.');
              return;
            }
          }}
          mt={4}
        >
          Apply to this Job
        </Button>
      </CardBody>
    </Card>
  );
};

export default JobDetail;
