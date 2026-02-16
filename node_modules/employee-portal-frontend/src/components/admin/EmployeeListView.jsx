import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Text,
  Badge,
  Avatar,
  Stack,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Tooltip,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Button,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { FiMail, FiPhone, FiBriefcase, FiMapPin, FiUserCheck, FiUserX, FiEdit, FiPauseCircle, FiTrash2, FiGrid, FiList } from 'react-icons/fi';

const EmployeeListView = ({ 
  employees, 
  onEdit, 
  onHold, 
  onDelete, 
  loading = false,
  searchText = "",
  onSearchChange = () => {},
  onViewModeChange = () => {}
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedText = useColorModeValue('gray.600', 'gray.300');
  const tableHeadBg = useColorModeValue('gray.50', 'gray.900');

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Function to get employee phone
  const getEmployeePhone = (user) => user?.phone || user?.username || '';

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    onViewModeChange(mode);
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Text color={mutedText}>Loading employees...</Text>
      </Box>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text color={mutedText}>No employees found.</Text>
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      {/* Controls */}
      <Flex justify="space-between" align="center">
        <Box>
          <Text color={mutedText} fontSize="sm">
            Showing {employees.length} employee{employees.length === 1 ? '' : 's'}.
          </Text>
        </Box>
        
        <Flex gap={2}>
          <Button
            size="sm"
            variant={viewMode === 'table' ? 'solid' : 'outline'}
            leftIcon={<Icon as={FiList} />}
            onClick={() => handleViewModeChange('table')}
          >
            List
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'solid' : 'outline'}
            leftIcon={<Icon as={FiGrid} />}
            onClick={() => handleViewModeChange('grid')}
          >
            Grid
          </Button>
        </Flex>
      </Flex>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <TableContainer border="1px solid" borderColor={borderColor} borderRadius="md">
          <Table size="sm" variant="simple">
            <Thead bg={tableHeadBg}>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Job Title</Th>
                <Th>Department</Th>
                <Th>Status</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {employees.map((employee) => (
                <Tr key={employee._id}>
                  <Td>
                    <Text fontWeight="semibold">
                      {employee.fullName || employee.username || 'Employee'}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color={mutedText}>
                      {employee.email || 'No email'}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color={mutedText}>
                      {getEmployeePhone(employee) || 'N/A'}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color={mutedText}>
                      {employee.jobTitle || '-'}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color={mutedText}>
                      {employee.department || '-'}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={employee.status === 'active' ? 'green' : 'red'}>
                      {employee.status || 'unknown'}
                    </Badge>
                  </Td>
                  <Td>
                    <Flex justify="flex-end" gap={1} wrap="wrap">
                      <Tooltip label="Edit">
                        <IconButton
                          aria-label="Edit employee"
                          size="xs"
                          variant="ghost"
                          icon={<Icon as={FiEdit} />}
                          onClick={() => onEdit(employee)}
                        />
                      </Tooltip>
                      <Tooltip label="Hold (set inactive)">
                        <IconButton
                          aria-label="Hold employee"
                          size="xs"
                          variant="ghost"
                          colorScheme="orange"
                          icon={<Icon as={FiPauseCircle} />}
                          onClick={() => onHold(employee)}
                          isDisabled={employee.status === 'inactive'}
                        />
                      </Tooltip>
                      <Tooltip label="Delete">
                        <IconButton
                          aria-label="Delete employee"
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          icon={<Icon as={FiTrash2} />}
                          onClick={() => onDelete(employee)}
                        />
                      </Tooltip>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <Grid
          templateColumns={{
            base: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)',
          }}
          gap={6}
          py={4}
        >
          {employees.map((employee) => (
            <GridItem key={employee._id}>
              <Card
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                boxShadow="md"
                borderRadius="lg"
                overflow="hidden"
                transition="transform 0.2s, box-shadow 0.2s"
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'xl',
                }}
              >
                <CardHeader
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  pb={3}
                >
                  <HStack spacing={4} align="center">
                    <Avatar
                      size="lg"
                      name={employee.fullName || employee.username}
                      src={employee.photoUrl || ''}
                      bg="teal.500"
                      color="white"
                    />
                    <VStack spacing={0} align="start" flex="1">
                      <HStack spacing={2}>
                        <Text
                          fontWeight="bold"
                          fontSize="lg"
                          color={textColor}
                          noOfLines={1}
                        >
                          {employee.fullName || employee.username || 'Employee'}
                        </Text>
                        <Badge
                          colorScheme={employee.status === 'active' ? 'green' : 'red'}
                          size="sm"
                        >
                          {employee.status || 'unknown'}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color={mutedText} noOfLines={1}>
                        {employee.jobTitle || '-'}
                      </Text>
                    </VStack>
                  </HStack>
                </CardHeader>

                <CardBody py={4}>
                  <Stack spacing={3}>
                    {employee.email && (
                      <HStack spacing={3} align="center">
                        <Tooltip label="Email">
                          <Icon as={FiMail} color={mutedText} boxSize={4} />
                        </Tooltip>
                        <Text fontSize="sm" color={textColor} noOfLines={1}>
                          {employee.email}
                        </Text>
                      </HStack>
                    )}

                    {getEmployeePhone(employee) && (
                      <HStack spacing={3} align="center">
                        <Tooltip label="Phone">
                          <Icon as={FiPhone} color={mutedText} boxSize={4} />
                        </Tooltip>
                        <Text fontSize="sm" color={textColor} noOfLines={1}>
                          {getEmployeePhone(employee)}
                        </Text>
                      </HStack>
                    )}

                    {employee.department && (
                      <HStack spacing={3} align="center">
                        <Tooltip label="Department">
                          <Icon as={FiBriefcase} color={mutedText} boxSize={4} />
                        </Tooltip>
                        <Text fontSize="sm" color={textColor} noOfLines={1}>
                          {employee.department}
                        </Text>
                      </HStack>
                    )}

                    {employee.workLocation && (
                      <HStack spacing={3} align="center">
                        <Tooltip label="Location">
                          <Icon as={FiMapPin} color={mutedText} boxSize={4} />
                        </Tooltip>
                        <Text fontSize="sm" color={textColor} noOfLines={1}>
                          {employee.workLocation}
                        </Text>
                      </HStack>
                    )}

                    <HStack spacing={2} justify="flex-end" pt={2}>
                      <Tooltip label="Edit">
                        <Box
                          as="button"
                          p={2}
                          borderRadius="md"
                          _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                          onClick={() => onEdit(employee)}
                        >
                          <Icon as={FiEdit} color={mutedText} boxSize={5} />
                        </Box>
                      </Tooltip>
                      
                      <Tooltip label={employee.status === 'active' ? 'Hold (set inactive)' : 'Activate'}>
                        <Box
                          as="button"
                          p={2}
                          borderRadius="md"
                          _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                          onClick={() => onHold(employee)}
                          opacity={employee.status === 'inactive' ? 0.5 : 1}
                        >
                          <Icon 
                            as={FiPauseCircle} 
                            color={employee.status === 'active' ? 'orange.500' : 'green.500'} 
                            boxSize={5} 
                          />
                        </Box>
                      </Tooltip>
                      
                      <Tooltip label="Delete">
                        <Box
                          as="button"
                          p={2}
                          borderRadius="md"
                          _hover={{ bg: useColorModeValue('red.50', 'red.900') }}
                          onClick={() => onDelete(employee)}
                        >
                          <Icon as={FiTrash2} color="red.500" boxSize={5} />
                        </Box>
                      </Tooltip>
                    </HStack>
                  </Stack>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
      )}
    </Stack>
  );
};

export default EmployeeListView;