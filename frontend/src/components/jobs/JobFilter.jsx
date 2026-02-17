import React from 'react';
import {
  Box,
  Flex,
  Input,
  Select,
  HStack,
  Button,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSearch, FiX } from 'react-icons/fi';

const JobFilter = ({ 
  search, 
  type, 
  category, 
  title, 
  onSearchChange, 
  onTypeChange, 
  onCategoryChange, 
  onTitleChange, 
  onClear, 
  availableTypes,
  availableCategories
}) => {
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputBorder = useColorModeValue('gray.300', 'gray.600');
  const buttonBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box p={4} bg={useColorModeValue('gray.50', 'gray.800')} borderRadius="lg" mb={6}>
      <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="flex-end">
        <Box flex={1}>
          <Input
            placeholder="Search by title, description, or company..."
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            bg={inputBg}
            borderColor={inputBorder}
            size="md"
          />
        </Box>
        
        <Select
          placeholder="Filter by type"
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          bg={inputBg}
          borderColor={inputBorder}
          minW={{ base: '100%', md: '200px' }}
        >
          {availableTypes?.map((typeOption) => (
            <option key={typeOption} value={typeOption}>
              {typeOption}
            </option>
          ))}
        </Select>
        
        <Select
          placeholder="Filter by category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          bg={inputBg}
          borderColor={inputBorder}
          minW={{ base: '100%', md: '200px' }}
        >
          {availableCategories?.map((categoryOption) => (
            <option key={categoryOption} value={categoryOption}>
              {categoryOption}
            </option>
          ))}
        </Select>
        
        <HStack spacing={2}>
          {(search || type || category || title) && (
            <IconButton
              icon={<FiX />}
              onClick={onClear}
              variant="outline"
              colorScheme="red"
              size="md"
              aria-label="Clear filters"
            />
          )}
          <Button
            leftIcon={<FiSearch />}
            colorScheme="green"
            onClick={onSearchChange}
            size="md"
          >
            Search
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default JobFilter;