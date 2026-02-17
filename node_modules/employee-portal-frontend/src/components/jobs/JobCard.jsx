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
  Tooltip,
} from '@chakra-ui/react';
import { FiHeart, FiMapPin, FiBriefcase, FiDollarSign, FiCalendar } from 'react-icons/fi';
import apiClient from '../../utils/apiClient';

const JobCard = ({ job, onApply, onFavoriteToggle, isFavorite: initialIsFavorite }) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const cardBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const badgeBg = useColorModeValue('gray.100', 'gray.700');
  const badgeColor = useColorModeValue('gray.800', 'gray.200');

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const handleFavoriteClick = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (isFavorite) {
        await apiClient.delete(`/favorites/${job._id}`);
        setIsFavorite(false);
      } else {
        await apiClient.post(`/favorites/${job._id}`);
        setIsFavorite(true);
      }
      
      // Notify parent component
      if (onFavoriteToggle) {
        onFavoriteToggle(job._id, !isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
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

  return (
    <Card
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', shadow: 'md', bg: hoverBg }}
      position="relative"
    >
      <CardBody p={5}>
        <Flex justify="space-between" align="flex-start" mb={3}>
          <VStack align="flex-start" spacing={1} flex={1}>
            <Heading size="md" noOfLines={2}>
              {job.title || 'Untitled Job'}
            </Heading>
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              {job.postedByName || 'Unknown Company'}
            </Text>
          </VStack>
          
          <Tooltip label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
            <IconButton
              icon={<FiHeart />}
              size="sm"
              variant="ghost"
              colorScheme={isFavorite ? 'red' : 'gray'}
              onClick={handleFavoriteClick}
              isLoading={loading}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              ml={2}
            />
          </Tooltip>
        </Flex>
        
        <VStack align="flex-start" spacing={2} mt={3}>
          {job.category && (
            <HStack>
              <Badge bg={badgeBg} color={badgeColor} px={2} py={1} borderRadius="full" fontSize="xs">
                {job.category}
              </Badge>
            </HStack>
          )}
          
          <HStack spacing={2} fontSize="sm">
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
                <Text>{formatDate(job.deadline)}</Text>
              </HStack>
            )}
          </HStack>
          
          {job.description && (
            <Text fontSize="sm" mt={2} noOfLines={3}>
              {job.description}
            </Text>
          )}
        </VStack>
        
        <Button
          mt={4}
          colorScheme="green"
          size="sm"
          width="full"
          onClick={() => onApply && onApply(job)}
        >
          Apply Now
        </Button>
      </CardBody>
    </Card>
  );
};

export default JobCard;