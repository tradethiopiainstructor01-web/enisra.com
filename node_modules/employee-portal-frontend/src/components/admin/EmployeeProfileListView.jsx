import React, { useState, useMemo } from 'react';
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
  Checkbox,
  CheckboxGroup,
  Wrap,
  WrapItem,
  Divider,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { FiMail, FiPhone, FiBriefcase, FiMapPin, FiUserCheck, FiUserX, FiEdit, FiPauseCircle, FiTrash2, FiGrid, FiList, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const EmployeeProfileListView = ({ 
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
  const [selectedFeatures, setSelectedFeatures] = useState([
    'personalInfo',
    'contactInfo',
    'employmentInfo',
    'education',
    'experience',
    'skills',
    'documents'
  ]);

  // Define all available features
  const allFeatures = [
    { id: 'personalInfo', label: 'Personal Info', description: 'Name, DOB, Gender, Nationality' },
    { id: 'contactInfo', label: 'Contact Info', description: 'Email, Phone, Address' },
    { id: 'employmentInfo', label: 'Employment Info', description: 'Job Title, Department, Status' },
    { id: 'education', label: 'Education', description: 'Education background' },
    { id: 'experience', label: 'Experience', description: 'Work experience' },
    { id: 'skills', label: 'Skills', description: 'Technical and soft skills' },
    { id: 'documents', label: 'Documents', description: 'Uploaded documents' },
    { id: 'salary', label: 'Salary', description: 'Salary details' },
    { id: 'languages', label: 'Languages', description: 'Languages spoken' },
  ];

  // Function to get employee phone
  const getEmployeePhone = (user) => user?.phone || user?.username || '';

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    onViewModeChange(mode);
  };

  // Format education background
  const formatEducation = (education) => {
    if (!education || !Array.isArray(education) || education.length === 0) {
      return 'No education records';
    }
    
    return education
      .filter(edu => edu.institutionName || edu.highestEducationLevel || edu.fieldOfStudy)
      .map(edu => `${edu.highestEducationLevel || 'N/A'} - ${edu.institutionName || 'N/A'}`)
      .join(', ');
  };

  // Format work experience
  const formatExperience = (experience) => {
    if (!experience || !Array.isArray(experience) || experience.length === 0) {
      return 'No experience records';
    }
    
    return experience
      .filter(exp => exp.previousCompanyName || exp.jobTitle)
      .map(exp => `${exp.jobTitle || 'N/A'} at ${exp.previousCompanyName || 'N/A'}`)
      .join(', ');
  };

  // Format skills
  const formatSkills = (technicalSkills, softSkills) => {
    const tech = Array.isArray(technicalSkills) ? technicalSkills.filter(Boolean).join(', ') : technicalSkills || '';
    const soft = Array.isArray(softSkills) ? softSkills.filter(Boolean).join(', ') : softSkills || '';
    
    return [tech, soft].filter(Boolean).join(' | ');
  };

  // Format languages
  const formatLanguages = (languages) => {
    if (!languages || !Array.isArray(languages) || languages.length === 0) {
      return 'No language records';
    }
    
    return languages
      .filter(lang => lang.language)
      .map(lang => `${lang.language} (${lang.proficiencyLevel || 'N/A'})`)
      .join(', ');
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
      {/* Feature Selection Controls */}
      <Card>
        <CardHeader>
          <Heading size="md">Select Profile Features to Display</Heading>
        </CardHeader>
        <CardBody>
          <CheckboxGroup colorScheme="teal" value={selectedFeatures} onChange={setSelectedFeatures}>
            <Wrap spacing={4}>
              {allFeatures.map((feature) => (
                <WrapItem key={feature.id}>
                  <Checkbox value={feature.id} size="md">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{feature.label}</Text>
                      <Text fontSize="xs" color={mutedText}>{feature.description}</Text>
                    </VStack>
                  </Checkbox>
                </WrapItem>
              ))}
            </Wrap>
          </CheckboxGroup>
        </CardBody>
      </Card>

      {/* View Mode Toggle */}
      <Flex justify="space-between" align="center">
        <Box>
          <Text color={mutedText} fontSize="sm">
            Showing {employees.length} employee{employees.length === 1 ? '' : 's'} with {selectedFeatures.length} profile sections.
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
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead bg={tableHeadBg} position="sticky" left={0}>
              <Tr>
                <Th minW="200px">Employee</Th>
                
                {selectedFeatures.includes('personalInfo') && (
                  <>
                    <Th minW="150px">Full Name</Th>
                    <Th minW="100px">DOB</Th>
                    <Th minW="80px">Gender</Th>
                    <Th minW="100px">Nationality</Th>
                  </>
                )}
                
                {selectedFeatures.includes('contactInfo') && (
                  <>
                    <Th minW="150px">Email</Th>
                    <Th minW="120px">Phone</Th>
                    <Th minW="150px">Address</Th>
                  </>
                )}
                
                {selectedFeatures.includes('employmentInfo') && (
                  <>
                    <Th minW="120px">Job Title</Th>
                    <Th minW="120px">Department</Th>
                    <Th minW="100px">Status</Th>
                    <Th minW="100px">Employee ID</Th>
                  </>
                )}
                
                {selectedFeatures.includes('education') && (
                  <Th minW="250px">Education</Th>
                )}
                
                {selectedFeatures.includes('experience') && (
                  <Th minW="250px">Experience</Th>
                )}
                
                {selectedFeatures.includes('skills') && (
                  <Th minW="200px">Skills</Th>
                )}
                
                {selectedFeatures.includes('languages') && (
                  <Th minW="150px">Languages</Th>
                )}
                
                {selectedFeatures.includes('salary') && (
                  <>
                    <Th minW="100px">Salary</Th>
                    <Th minW="150px">Salary Type</Th>
                  </>
                )}
                
                <Th minW="120px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {employees.map((employee) => (
                <Tr key={employee._id}>
                  <Td minW="200px">
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={employee.fullName || employee.username}
                        src={employee.photoUrl || ''}
                        bg="teal.500"
                        color="white"
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold" noOfLines={1}>
                          {employee.fullName || employee.username || 'Employee'}
                        </Text>
                        <Badge colorScheme={employee.status === 'active' ? 'green' : 'red'}>
                          {employee.status || 'unknown'}
                        </Badge>
                      </VStack>
                    </HStack>
                  </Td>
                  
                  {selectedFeatures.includes('personalInfo') && (
                    <>
                      <Td minW="150px">
                        {employee.firstName} {employee.middleName} {employee.lastName}
                      </Td>
                      <Td minW="100px">{employee.dateOfBirth || '-'}</Td>
                      <Td minW="80px">{employee.gender || '-'}</Td>
                      <Td minW="100px">{employee.nationality || '-'}</Td>
                    </>
                  )}
                  
                  {selectedFeatures.includes('contactInfo') && (
                    <>
                      <Td minW="150px">{employee.email || '-'}</Td>
                      <Td minW="120px">{getEmployeePhone(employee) || '-'}</Td>
                      <Td minW="150px">{employee.currentAddress || employee.location || '-'}</Td>
                    </>
                  )}
                  
                  {selectedFeatures.includes('employmentInfo') && (
                    <>
                      <Td minW="120px">{employee.jobTitle || '-'}</Td>
                      <Td minW="120px">{employee.department || '-'}</Td>
                      <Td minW="100px">
                        <Badge colorScheme={employee.status === 'active' ? 'green' : 'red'}>
                          {employee.status || 'unknown'}
                        </Badge>
                      </Td>
                      <Td minW="100px">{employee.employeeId || '-'}</Td>
                    </>
                  )}
                  
                  {selectedFeatures.includes('education') && (
                    <Td minW="250px">
                      <Text fontSize="sm" noOfLines={2}>
                        {formatEducation(employee.educationBackground)}
                      </Text>
                    </Td>
                  )}
                  
                  {selectedFeatures.includes('experience') && (
                    <Td minW="250px">
                      <Text fontSize="sm" noOfLines={2}>
                        {formatExperience(employee.workExperience)}
                      </Text>
                    </Td>
                  )}
                  
                  {selectedFeatures.includes('skills') && (
                    <Td minW="200px">
                      <Text fontSize="sm" noOfLines={2}>
                        {formatSkills(employee.technicalSkills, employee.softSkills)}
                      </Text>
                    </Td>
                  )}
                  
                  {selectedFeatures.includes('languages') && (
                    <Td minW="150px">
                      <Text fontSize="sm" noOfLines={2}>
                        {formatLanguages(employee.languagesSpoken)}
                      </Text>
                    </Td>
                  )}
                  
                  {selectedFeatures.includes('salary') && (
                    <>
                      <Td minW="100px">{employee.salary ? `ETB ${employee.salary}` : '-'}</Td>
                      <Td minW="150px">{employee.salaryDetails?.salaryType || '-'}</Td>
                    </>
                  )}
                  
                  <Td minW="120px">
                    <Flex justify="flex-start" gap={1} wrap="wrap">
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
        </Box>
      ) : (
        <Grid
          templateColumns={{
            base: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(2, 1fr)',
            xl: 'repeat(3, 1fr)',
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
                  <Stack spacing={4}>
                    {/* Personal Info Section */}
                    {selectedFeatures.includes('personalInfo') && (
                      <Accordion allowToggle>
                        <AccordionItem border="none">
                          <h2>
                            <AccordionButton p={2} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} borderRadius="md">
                              <Box flex="1" textAlign="left" fontWeight="medium">
                                Personal Information
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={2} pl={4} pr={2}>
                            <VStack spacing={1} align="start">
                              <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedText}>DOB:</Text>
                                <Text fontSize="sm">{employee.dateOfBirth || '-'}</Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedText}>Gender:</Text>
                                <Text fontSize="sm">{employee.gender || '-'}</Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedText}>Nationality:</Text>
                                <Text fontSize="sm">{employee.nationality || '-'}</Text>
                              </HStack>
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Contact Info Section */}
                    {selectedFeatures.includes('contactInfo') && (
                      <Accordion allowToggle>
                        <AccordionItem border="none">
                          <h2>
                            <AccordionButton p={2} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} borderRadius="md">
                              <Box flex="1" textAlign="left" fontWeight="medium">
                                Contact Information
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={2} pl={4} pr={2}>
                            <VStack spacing={1} align="start">
                              <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedText}>Email:</Text>
                                <Text fontSize="sm">{employee.email || '-'}</Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedText}>Phone:</Text>
                                <Text fontSize="sm">{getEmployeePhone(employee) || '-'}</Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedText}>Address:</Text>
                                <Text fontSize="sm">{employee.currentAddress || employee.location || '-'}</Text>
                              </HStack>
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Employment Info Section */}
                    {selectedFeatures.includes('employmentInfo') && (
                      <Accordion allowToggle>
                        <AccordionItem border="none">
                          <h2>
                            <AccordionButton p={2} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} borderRadius="md">
                              <Box flex="1" textAlign="left" fontWeight="medium">
                                Employment Information
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={2} pl={4} pr={2}>
                            <VStack spacing={1} align="start">
                              <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedText}>ID:</Text>
                                <Text fontSize="sm">{employee.employeeId || '-'}</Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedText}>Department:</Text>
                                <Text fontSize="sm">{employee.department || '-'}</Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedText}>Position:</Text>
                                <Text fontSize="sm">{employee.position || '-'}</Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedText}>Status:</Text>
                                <Text fontSize="sm">{employee.employmentStatus || employee.status || '-'}</Text>
                              </HStack>
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Education Section */}
                    {selectedFeatures.includes('education') && (
                      <Accordion allowToggle>
                        <AccordionItem border="none">
                          <h2>
                            <AccordionButton p={2} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} borderRadius="md">
                              <Box flex="1" textAlign="left" fontWeight="medium">
                                Education
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={2} pl={4} pr={2}>
                            <Text fontSize="sm">
                              {formatEducation(employee.educationBackground)}
                            </Text>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Experience Section */}
                    {selectedFeatures.includes('experience') && (
                      <Accordion allowToggle>
                        <AccordionItem border="none">
                          <h2>
                            <AccordionButton p={2} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} borderRadius="md">
                              <Box flex="1" textAlign="left" fontWeight="medium">
                                Work Experience
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={2} pl={4} pr={2}>
                            <Text fontSize="sm">
                              {formatExperience(employee.workExperience)}
                            </Text>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Skills Section */}
                    {selectedFeatures.includes('skills') && (
                      <Accordion allowToggle>
                        <AccordionItem border="none">
                          <h2>
                            <AccordionButton p={2} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} borderRadius="md">
                              <Box flex="1" textAlign="left" fontWeight="medium">
                                Skills
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={2} pl={4} pr={2}>
                            <Text fontSize="sm">
                              {formatSkills(employee.technicalSkills, employee.softSkills)}
                            </Text>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Languages Section */}
                    {selectedFeatures.includes('languages') && (
                      <Accordion allowToggle>
                        <AccordionItem border="none">
                          <h2>
                            <AccordionButton p={2} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} borderRadius="md">
                              <Box flex="1" textAlign="left" fontWeight="medium">
                                Languages
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={2} pl={4} pr={2}>
                            <Text fontSize="sm">
                              {formatLanguages(employee.languagesSpoken)}
                            </Text>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Action Buttons */}
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

export default EmployeeProfileListView;