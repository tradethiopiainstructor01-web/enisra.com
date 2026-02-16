import React from 'react';
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
} from '@chakra-ui/react';
import { FiMail, FiPhone, FiBriefcase, FiMapPin, FiUserCheck, FiUserX } from 'react-icons/fi';

const EmployeeGridView = ({ employees, onEdit, onHold, onDelete }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedText = useColorModeValue('gray.600', 'gray.300');

  // Function to get employee phone
  const getEmployeePhone = (user) => user?.phone || user?.username || '';

  return (
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

                {employee.employeeId && (
                  <HStack spacing={3} align="center">
                    <Tooltip label="Employee ID">
                      <Icon as={FiUserCheck} color={mutedText} boxSize={4} />
                    </Tooltip>
                    <Text fontSize="sm" color={textColor} noOfLines={1}>
                      ID: {employee.employeeId}
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
                      <Icon as={FiUserCheck} color={mutedText} boxSize={5} />
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
                        as={FiUserX} 
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
                      <Icon as={FiUserX} color="red.500" boxSize={5} />
                    </Box>
                  </Tooltip>
                </HStack>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
      ))}
    </Grid>
  );
};

export default EmployeeGridView;