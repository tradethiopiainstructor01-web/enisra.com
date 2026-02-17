import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Heading,
  Container,
  useToast,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Switch,
  FormHelperText,
  Text,
  Badge,
  Flex,
  Icon,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Divider,
} from '@chakra-ui/react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiFileText,
  FiCheckCircle,
  FiSave,
  FiBarChart2,
} from 'react-icons/fi';
import { useUserStore } from '../../store/user';
import apiClient from '../../utils/apiClient';

const EmployeeDashboard = () => {
  const toast = useToast();
  const currentUser = useUserStore((state) => state.currentUser);
  const overviewRef = useRef(null);
  const statsRef = useRef(null);
  const formRef = useRef(null);
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedText = useColorModeValue('gray.600', 'gray.300');

  // State for form fields
  const [formData, setFormData] = useState({
    candidateId: '',
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    educationLevel: '',
    primarySkill: '',
    yearsOfExperience: '',
    currentLocation: '',
    desiredJobTitle: '',
    registrationDate: '',
    profileStatus: '',
    cvUploadDate: '',
    cvFileName: '',
    cvParsed: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Education levels options
  const educationLevels = [
    'High School',
    'Diploma',
    "Bachelor's Degree",
    "Master's Degree",
    'PhD',
    'Other',
  ];

  // Profile status options
  const profileStatusOptions = [
    'Active',
    'Inactive',
    'Pending Review',
    'On Hold',
    'Rejected',
    'Approved',
  ];

  // Calculate profile completion
  useEffect(() => {
    const requiredFields = ['fullName', 'emailAddress', 'phoneNumber', 'educationLevel', 'primarySkill'];
    const optionalFields = ['currentLocation', 'desiredJobTitle', 'yearsOfExperience', 'cvFileName'];
    
    const requiredFilled = requiredFields.filter((field) => formData[field]).length;
    const optionalFilled = optionalFields.filter((field) => formData[field]).length;
    
    const completion = (requiredFilled / requiredFields.length) * 70 + (optionalFilled / optionalFields.length) * 30;
    setProfileCompletion(Math.round(completion));
  }, [formData]);

  // Load employee data on mount
  useEffect(() => {
    const loadEmployeeData = async () => {
      if (!currentUser?.token) return;
      
      try {
        setIsLoading(true);
        const response = await apiClient.get('/users/me');
        const userData = response?.data?.data || response?.data;
        
        if (userData) {
          setFormData((prev) => ({
            ...prev,
            candidateId: userData._id || userData.id || '',
            fullName: userData.fullName || '',
            phoneNumber: userData.phone || userData.username || '',
            emailAddress: userData.email || '',
            educationLevel: userData.educationLevel || '',
            primarySkill: userData.primarySkill || userData.jobTitle || '',
            yearsOfExperience: userData.yearsOfExperience || '',
            currentLocation: userData.currentLocation || '',
            desiredJobTitle: userData.desiredJobTitle || userData.jobTitle || '',
            registrationDate: userData.createdAt ? new Date(userData.createdAt).toISOString().split('T')[0] : '',
            profileStatus: userData.status || 'Active',
            cvParsed: userData.cvParsed || false,
          }));
        }
      } catch (error) {
        console.error('Failed to load employee data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployeeData();
  }, [currentUser]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.emailAddress) {
      toast({
        title: 'Error',
        description: 'Full Name and Email Address are required fields',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const payload = {
        fullName: formData.fullName,
        email: formData.emailAddress,
        phone: formData.phoneNumber,
        username: formData.phoneNumber,
        educationLevel: formData.educationLevel,
        primarySkill: formData.primarySkill,
        yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
        currentLocation: formData.currentLocation,
        desiredJobTitle: formData.desiredJobTitle,
        status: formData.profileStatus || 'Active',
        cvParsed: formData.cvParsed,
      };

      if (formData.candidateId) {
        await apiClient.put(`/users/${formData.candidateId}`, payload);
      } else {
        await apiClient.post('/users', payload);
      }
      
      toast({
        title: 'Success',
        description: 'Employee profile updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to save employee data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg={bg} minH="100vh" py={{ base: 6, lg: 8 }} px={{ base: 4, md: 6 }}>
      <Container maxW="7xl">
        <Stack spacing={6}>
          {/* Header */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            gap={4}
            ref={overviewRef}
          >
            <Box>
              <Text color={mutedText}>
                Welcome{currentUser?.fullName ? `, ${currentUser.fullName}` : ''}. Manage your profile and track your job applications.
              </Text>
            </Box>
            <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
              {profileStatusOptions.find((s) => s === formData.profileStatus) || 'Active'}
            </Badge>
          </Flex>

          {/* Profile Completion Card */}
          <Card ref={statsRef} bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stack spacing={4}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="semibold">Profile Completion</Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.500">
                    {profileCompletion}%
                  </Text>
                </Flex>
                <Progress value={profileCompletion} colorScheme="blue" size="lg" borderRadius="md" />
                <Text fontSize="sm" color={mutedText}>
                  Complete your profile to increase your visibility to employers
                </Text>
              </Stack>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <Stat>
                  <StatLabel>Profile Status</StatLabel>
                  <StatNumber fontSize="xl">
                    <Badge colorScheme={formData.profileStatus === 'Active' ? 'green' : 'gray'}>
                      {formData.profileStatus || 'Not Set'}
                    </Badge>
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <Stat>
                  <StatLabel>Education Level</StatLabel>
                  <StatNumber fontSize="xl">
                    {formData.educationLevel || 'Not Set'}
                  </StatNumber>
                  <StatHelpText>
                    <Icon as={FiBriefcase} mr={1} />
                    Qualification
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <Stat>
                  <StatLabel>Experience</StatLabel>
                  <StatNumber fontSize="xl">
                    {formData.yearsOfExperience || '0'} years
                  </StatNumber>
                  <StatHelpText>
                    <Icon as={FiBarChart2} mr={1} />
                    Years of experience
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <Stat>
                  <StatLabel>CV Status</StatLabel>
                  <StatNumber fontSize="xl">
                    <Badge colorScheme={formData.cvParsed ? 'green' : 'orange'}>
                      {formData.cvParsed ? 'Parsed' : 'Not Parsed'}
                    </Badge>
                  </StatNumber>
                  <StatHelpText>
                    <Icon as={FiFileText} mr={1} />
                    {formData.cvFileName || 'No CV uploaded'}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Main Form Card */}
          <Card ref={formRef} bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Heading size="md">Candidate Registration Form</Heading>
              <Text color={mutedText} mt={1}>
                Update your profile information to help employers find you
              </Text>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <Stack spacing={6}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {/* First Column */}
                    <Stack spacing={4}>
                      <FormControl id="candidate-id">
                        <FormLabel>
                          <Icon as={FiUser} mr={2} />
                          Candidate ID
                        </FormLabel>
                        <Input
                          name="candidateId"
                          value={formData.candidateId}
                          onChange={handleChange}
                          placeholder="Auto-generated"
                          isDisabled
                          bg={useColorModeValue('gray.50', 'gray.700')}
                        />
                        <FormHelperText>Unique identifier for the candidate</FormHelperText>
                      </FormControl>

                      <FormControl id="full-name" isRequired>
                        <FormLabel>
                          <Icon as={FiUser} mr={2} />
                          Full Name
                        </FormLabel>
                        <Input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Enter full name"
                        />
                      </FormControl>

                      <FormControl id="phone-number">
                        <FormLabel>
                          <Icon as={FiPhone} mr={2} />
                          Phone Number
                        </FormLabel>
                        <Input
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          placeholder="+251 9xx xxx xxx"
                          type="tel"
                        />
                      </FormControl>

                      <FormControl id="email-address" isRequired>
                        <FormLabel>
                          <Icon as={FiMail} mr={2} />
                          Email Address
                        </FormLabel>
                        <Input
                          name="emailAddress"
                          type="email"
                          value={formData.emailAddress}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                        />
                      </FormControl>

                      <FormControl id="education-level">
                        <FormLabel>
                          <Icon as={FiBriefcase} mr={2} />
                          Education Level
                        </FormLabel>
                        <Select
                          name="educationLevel"
                          value={formData.educationLevel}
                          onChange={handleChange}
                          placeholder="Select education level (e.g. Bachelor's Degree)"
                        >
                          {educationLevels.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl id="primary-skill">
                        <FormLabel>
                          <Icon as={FiBriefcase} mr={2} />
                          Primary Skill
                        </FormLabel>
                        <Input
                          name="primarySkill"
                          value={formData.primarySkill}
                          onChange={handleChange}
                          placeholder="e.g. Software Development"
                        />
                      </FormControl>
                    </Stack>

                    {/* Second Column */}
                    <Stack spacing={4}>
                      <FormControl id="years-of-experience">
                        <FormLabel>
                          <Icon as={FiBarChart2} mr={2} />
                          Years of Experience
                        </FormLabel>
                        <Input
                          name="yearsOfExperience"
                          type="number"
                          min="0"
                          value={formData.yearsOfExperience}
                          onChange={handleChange}
                          placeholder="e.g. 3"
                        />
                      </FormControl>

                      <FormControl id="current-location">
                        <FormLabel>
                          <Icon as={FiMapPin} mr={2} />
                          Current Location
                        </FormLabel>
                        <Input
                          name="currentLocation"
                          value={formData.currentLocation}
                          onChange={handleChange}
                          placeholder="e.g. Addis Ababa, Ethiopia"
                        />
                      </FormControl>

                      <FormControl id="desired-job-title">
                        <FormLabel>
                          <Icon as={FiBriefcase} mr={2} />
                          Desired Job Title
                        </FormLabel>
                        <Input
                          name="desiredJobTitle"
                          value={formData.desiredJobTitle}
                          onChange={handleChange}
                          placeholder="e.g. Software Engineer"
                        />
                      </FormControl>

                      <FormControl id="registration-date">
                        <FormLabel>
                          <Icon as={FiCalendar} mr={2} />
                          Registration Date
                        </FormLabel>
                        <Input
                          name="registrationDate"
                          type="date"
                          value={formData.registrationDate}
                          onChange={handleChange}
                          isDisabled
                          bg={useColorModeValue('gray.50', 'gray.700')}
                        />
                      </FormControl>

                      <FormControl id="profile-status">
                        <FormLabel>
                          <Icon as={FiCheckCircle} mr={2} />
                          Profile Status
                        </FormLabel>
                        <Select
                          name="profileStatus"
                          value={formData.profileStatus}
                          onChange={handleChange}
                          placeholder="Select profile status (e.g. Active)"
                        >
                          {profileStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl id="cv-upload-date">
                        <FormLabel>
                          <Icon as={FiCalendar} mr={2} />
                          CV Upload Date
                        </FormLabel>
                        <Input
                          name="cvUploadDate"
                          type="date"
                          value={formData.cvUploadDate}
                          onChange={handleChange}
                        />
                      </FormControl>

                      <FormControl id="cv-file-name">
                        <FormLabel>
                          <Icon as={FiFileText} mr={2} />
                          CV File Name
                        </FormLabel>
                        <Input
                          name="cvFileName"
                          value={formData.cvFileName}
                          onChange={handleChange}
                          placeholder="e.g. resume.pdf"
                        />
                      </FormControl>

                      <FormControl id="cv-parsed" display="flex" alignItems="center" pt={2}>
                        <FormLabel htmlFor="cv-parsed" mb="0">
                          <Icon as={FiCheckCircle} mr={2} />
                          CV Parsed
                        </FormLabel>
                        <Switch
                          id="cv-parsed"
                          name="cvParsed"
                          isChecked={formData.cvParsed}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              cvParsed: e.target.checked,
                            }))
                          }
                        />
                        <Text ml={2} fontSize="sm" color={mutedText}>
                          {formData.cvParsed ? 'Yes' : 'No'}
                        </Text>
                      </FormControl>
                    </Stack>
                  </SimpleGrid>

                  <Divider />

                  <Flex justify="flex-end" gap={3}>
                    <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      leftIcon={<FiSave />}
                      isLoading={isLoading}
                      loadingText="Saving..."
                    >
                      Save Profile
                    </Button>
                  </Flex>
                </Stack>
              </form>
            </CardBody>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default EmployeeDashboard;
