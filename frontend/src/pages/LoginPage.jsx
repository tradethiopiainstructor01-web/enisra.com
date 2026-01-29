import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { FaLock, FaUser } from 'react-icons/fa';
import axiosInstance from '../services/axiosInstance';
import { useUserStore } from '../store/user';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const formBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  const handleFieldChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axiosInstance.post('/users/login', {
        email: formData.email,
        password: formData.password
      });

      const { data } = response;
      if (!data.success || !data.token || !data.user) {
        throw new Error(data.message || 'Invalid login response');
      }

      setCurrentUser({ ...data.user, token: data.token });
      toast({
        title: 'Welcome back',
        description: 'You have been signed in successfully.',
        status: 'success',
        duration: 4000,
        isClosable: true
      });
      const normalizedRole = (data.user?.role || '').toString().trim().toLowerCase();
      if (normalizedRole === 'employer') {
        navigate('/employer/profile');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const friendlyMessage =
        error.response?.data?.message || error.message || 'Unable to log in right now.';
      setErrorMessage(friendlyMessage);
      toast({
        title: 'Login failed',
        description: friendlyMessage,
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" minH="100vh" py={20}>
      <Flex
        direction="column"
        align="center"
        bg={formBg}
        borderRadius="2xl"
        borderWidth="1px"
        borderColor={borderColor}
        p={10}
        boxShadow="lg"
      >
        <Heading mb={6} size="xl">
          Welcome back
        </Heading>
        <Text mb={8} textAlign="center" color="gray.500">
          Log in to access personalized job matches, saved opportunities, and scholarship alerts.
        </Text>
        <Stack as="form" spacing={4} w="100%" onSubmit={handleSubmit}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaUser} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Email"
              type="email"
              bg={inputBg}
              value={formData.email}
              onChange={handleFieldChange('email')}
              autoComplete="username"
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaLock} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Password"
              type="password"
              bg={inputBg}
              value={formData.password}
              onChange={handleFieldChange('password')}
              autoComplete="current-password"
            />
          </InputGroup>
          {errorMessage && (
            <Text color="red.500" fontSize="sm" textAlign="center">
              {errorMessage}
            </Text>
          )}
          <Button colorScheme="green" size="lg" type="submit" isLoading={isLoading}>
            Log In
          </Button>
        </Stack>
      </Flex>
    </Container>
  );
};

export default LoginPage;
