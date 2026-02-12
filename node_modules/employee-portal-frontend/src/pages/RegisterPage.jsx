import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  Badge,
  HStack,
} from '@chakra-ui/react';
import { FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';
import axiosInstance from '../services/axiosInstance';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [accountType, setAccountType] = useState('employee');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [ctaLabel, setCtaLabel] = useState('Create employee account');
  const navigate = useNavigate();
  const toast = useToast();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const pushRegistrationAnalytics = (role) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'registration_complete',
        role,
      });
    }
  };

  const getRoleFromAccountType = () => {
    if (accountType === 'employer') return 'employer';
    return 'employee';
  };

  const handleAccountSwitch = (type) => {
    setAccountType(type);
    setCtaLabel(type === 'employer' ? 'Create employer account' : 'Create employee account');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { fullName, phoneNumber, email, password, confirmPassword } = formData;
    if (!fullName.trim() || !phoneNumber.trim() || !email.trim() || !password) {
      setErrorMessage('Full name, phone number, email, and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const computedRole = getRoleFromAccountType();

    try {
      const response = await axiosInstance.post('/users', {
        fullName,
        username: phoneNumber,
        email,
        password,
        role: computedRole,
      });
      if (response.data?.success) {
        toast({
          title: 'Registration complete',
          description: 'Please log in to continue.',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        pushRegistrationAnalytics(computedRole);
        navigate('/login');
      } else {
        throw new Error(response.data?.message || 'Registration failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to register right now.';
      setErrorMessage(message);
      toast({
        title: 'Registration failed',
        description: message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container 
      maxW="md" 
      minH="100vh" 
      py={{ base: 12, sm: 16 }}
      px={{ base: 2, sm: 4 }}
    >
      <Flex
        direction="column"
        bg={bg}
        borderRadius="2xl"
        borderWidth="1px"
        borderColor={borderColor}
        p={{ base: 6, sm: 8, md: 10 }}
        boxShadow="xl"
        width="100%"
        maxWidth={{ base: '95%', sm: 'md' }}
      >
        <Heading 
          size={{ base: 'lg', sm: 'xl', md: '2xl' }} 
          mb={{ base: 3, sm: 4 }}
          textAlign="center"
          lineHeight="1.2"
        >
          Create an account
        </Heading>
        <Text 
          color="gray.500" 
          mb={{ base: 6, sm: 8 }}
          fontSize={{ base: 'sm', sm: 'md' }}
          textAlign="center"
          lineHeight="1.4"
        >
          Join Enisra to post jobs, track applicants, and grow your team with trusted talent.
        </Text>
        <Stack spacing={{ base: 2, sm: 2 }} mb={{ base: 5, sm: 6 }}>
          <Text fontSize="sm" color="gray.500">
            Select the experience that matches your role
          </Text>
          <HStack spacing={3}>
            <Button
              size="sm"
              colorScheme={accountType === 'employee' ? 'green' : 'gray'}
              onClick={() => handleAccountSwitch('employee')}
              borderRadius="full"
              px={6}
            >
              Employee
            </Button>
            <Button
              size="sm"
              colorScheme={accountType === 'employer' ? 'green' : 'gray'}
              onClick={() => handleAccountSwitch('employer')}
              borderRadius="full"
              px={6}
            >
              Employer
            </Button>
          </HStack>
        </Stack>
        <Stack spacing={4} as="form" onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input
              placeholder="Jane Doe"
              bg={inputBg}
              value={formData.fullName}
              onChange={handleChange('fullName')}
              autoComplete="name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Phone Number</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaPhone} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="(555) 555-5555"
                type="tel"
                bg={inputBg}
                value={formData.phoneNumber}
                onChange={handleChange('phoneNumber')}
                autoComplete="tel"
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaEnvelope} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="email@enisra.com"
                type="email"
                bg={inputBg}
                value={formData.email}
                onChange={handleChange('email')}
                autoComplete="email"
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaLock} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Enter password"
                type="password"
                bg={inputBg}
                value={formData.password}
                onChange={handleChange('password')}
                autoComplete="new-password"
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaLock} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Re-enter password"
                type="password"
                bg={inputBg}
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                autoComplete="new-password"
              />
            </InputGroup>
          </FormControl>

          {errorMessage && (
            <Text fontSize="sm" color="red.500" textAlign="center" role="alert">
              {errorMessage}
            </Text>
          )}

          <Button colorScheme="green" type="submit" isLoading={isLoading}>
            Create account
          </Button>
        </Stack>

        <Text mt={6} textAlign="center" fontSize="sm">
          Already have an account?{' '}
          <RouterLink to="/login">
            <Text as="span" color="green.500" fontWeight="bold">
              Log in
            </Text>
          </RouterLink>
        </Text>
      </Flex>
    </Container>
  );
};

export default RegisterPage;
