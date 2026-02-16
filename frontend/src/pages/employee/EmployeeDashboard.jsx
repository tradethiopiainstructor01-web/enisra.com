import React, { useState } from 'react';
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
  SimpleGrid,
  Switch,
  FormHelperText,
  Text
} from '@chakra-ui/react';

const EmployeeDashboard = () => {
  const toast = useToast();

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
    cvParsed: false
  });

  // Education levels options
  const educationLevels = [
    'High School',
    'Diploma',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Other'
  ];

  // Profile status options
  const profileStatusOptions = [
    'Active',
    'Inactive',
    'Pending Review',
    'On Hold',
    'Rejected',
    'Approved'
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      // Here you would typically send the data to your backend
      console.log('Form Data:', formData);
      
      toast({
        title: 'Success',
        description: 'Employee data submitted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit employee data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={6}>
      <Heading size="lg" mb={6} textAlign="left">
        Employee Dashboard - Candidate Registration Form
      </Heading>
      
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* First Column */}
              <Stack spacing={4}>
                <FormControl id="candidate-id" isRequired>
                  <FormLabel>Candidate ID</FormLabel>
                  <Input 
                    name="candidateId" 
                    value={formData.candidateId} 
                    onChange={handleChange} 
                    placeholder="Enter candidate ID" 
                  />
                  <FormHelperText>Unique identifier for the candidate</FormHelperText>
                </FormControl>

                <FormControl id="full-name" isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    placeholder="Enter full name" 
                  />
                </FormControl>

                <FormControl id="phone-number">
                  <FormLabel>Phone Number</FormLabel>
                  <Input 
                    name="phoneNumber" 
                    value={formData.phoneNumber} 
                    onChange={handleChange} 
                    placeholder="Enter phone number" 
                    type="tel"
                  />
                </FormControl>

                <FormControl id="email-address" isRequired>
                  <FormLabel>Email Address</FormLabel>
                  <Input 
                    name="emailAddress" 
                    type="email" 
                    value={formData.emailAddress} 
                    onChange={handleChange} 
                    placeholder="Enter email address" 
                  />
                </FormControl>

                <FormControl id="education-level">
                  <FormLabel>Education Level</FormLabel>
                  <Select 
                    name="educationLevel" 
                    value={formData.educationLevel} 
                    onChange={handleChange} 
                    placeholder="Select education level"
                  >
                    {educationLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl id="primary-skill">
                  <FormLabel>Primary Skill</FormLabel>
                  <Input 
                    name="primarySkill" 
                    value={formData.primarySkill} 
                    onChange={handleChange} 
                    placeholder="Enter primary skill" 
                  />
                </FormControl>
              </Stack>

              {/* Second Column */}
              <Stack spacing={4}>
                <FormControl id="years-of-experience">
                  <FormLabel>Years of Experience</FormLabel>
                  <Input 
                    name="yearsOfExperience" 
                    type="number" 
                    min="0" 
                    value={formData.yearsOfExperience} 
                    onChange={handleChange} 
                    placeholder="Enter years of experience" 
                  />
                </FormControl>

                <FormControl id="current-location">
                  <FormLabel>Current Location</FormLabel>
                  <Input 
                    name="currentLocation" 
                    value={formData.currentLocation} 
                    onChange={handleChange} 
                    placeholder="Enter current location" 
                  />
                </FormControl>

                <FormControl id="desired-job-title">
                  <FormLabel>Desired Job Title</FormLabel>
                  <Input 
                    name="desiredJobTitle" 
                    value={formData.desiredJobTitle} 
                    onChange={handleChange} 
                    placeholder="Enter desired job title" 
                  />
                </FormControl>

                <FormControl id="registration-date">
                  <FormLabel>Registration Date</FormLabel>
                  <Input 
                    name="registrationDate" 
                    type="date" 
                    value={formData.registrationDate} 
                    onChange={handleChange} 
                  />
                </FormControl>

                <FormControl id="profile-status">
                  <FormLabel>Profile Status</FormLabel>
                  <Select 
                    name="profileStatus" 
                    value={formData.profileStatus} 
                    onChange={handleChange} 
                    placeholder="Select profile status"
                  >
                    {profileStatusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl id="cv-upload-date">
                  <FormLabel>CV Upload Date</FormLabel>
                  <Input 
                    name="cvUploadDate" 
                    type="date" 
                    value={formData.cvUploadDate} 
                    onChange={handleChange} 
                  />
                </FormControl>

                <FormControl id="cv-file-name">
                  <FormLabel>CV File Name</FormLabel>
                  <Input 
                    name="cvFileName" 
                    value={formData.cvFileName} 
                    onChange={handleChange} 
                    placeholder="Enter CV file name" 
                  />
                </FormControl>

                <FormControl id="cv-parsed" display="flex" alignItems="center">
                  <FormLabel htmlFor="cv-parsed" mb="0">
                    CV Parsed
                  </FormLabel>
                  <Switch
                    id="cv-parsed"
                    name="cvParsed"
                    isChecked={formData.cvParsed}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cvParsed: e.target.checked
                    }))}
                  />
                  <Text ml={2} fontSize="sm" color="gray.500">
                    {formData.cvParsed ? 'Yes' : 'No'}
                  </Text>
                </FormControl>
              </Stack>
            </SimpleGrid>

            <Box mt={6} textAlign="center">
              <Button 
                type="submit" 
                colorScheme="teal" 
                size="lg" 
                px={8}
              >
                Submit Employee Information
              </Button>
            </Box>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default EmployeeDashboard;