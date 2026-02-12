import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
      const normalizedRole = (data.user?.role || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      const roleRouteMap = {
        admin: '/admin',
        employee: '/employee/profile',
        employer: '/employer/profile',
        customerservice: '/employee/profile',
        customersuccess: '/employee/profile',
        customersuccessmanager: '/employee/profile',
        hr: '/requests',
        sales: '/requests',
        salesmanager: '/requests',
        socialmedia: '/social-media',
        socialmediamanager: '/social-media',
        it: '/it',
        supervisor: '/supervisor',
        tradextv: '/tradextv-dashboard',
        tradex: '/tradextv-dashboard',
        tetv: '/tradextv-dashboard',
        coo: '/coo-dashboard',
        reception: '/requests',
        finance: '/requests',
        eventmanager: '/requests',
        instructor: '/instructor',
        enisra: '/enisra',
      };

      const destination = roleRouteMap[normalizedRole] || '/';
      navigate(destination);
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
    <Container 
      maxW="lg" 
      minH="100vh" 
      py={{ base: 10, sm: 16, md: 20 }}
      px={{ base: 2, sm: 4 }}
    >
      <Flex
        direction="column"
        align="center"
        bg={formBg}
        borderRadius="2xl"
        borderWidth="1px"
        borderColor={borderColor}
        p={{ base: 6, sm: 8, md: 10 }}
        boxShadow="lg"
        width="100%"
        maxWidth={{ base: '95%', sm: 'lg' }}
      >
        <Heading 
          mb={{ base: 4, sm: 6 }} 
          size={{ base: 'lg', sm: 'xl', md: '2xl' }}
          textAlign="center"
          lineHeight="1.2"
        >
          Welcome back
        </Heading>
        <Text 
          mb={{ base: 6, sm: 8 }} 
          textAlign="center" 
          color="gray.500"
          fontSize={{ base: 'sm', sm: 'md' }}
          lineHeight="1.4"
        >
          Log in to access personalized job matches, saved opportunities, and scholarship alerts.
        </Text>
        <Stack as="form" spacing={{ base: 3, sm: 4 }} w="100%" onSubmit={handleSubmit}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaUser} color="gray.400" boxSize={{ base: 4, sm: 5 }} />
            </InputLeftElement>
            <Input
              placeholder="Email"
              type="email"
              bg={inputBg}
              value={formData.email}
              onChange={handleFieldChange('email')}
              autoComplete="username"
              size={{ base: 'md', sm: 'lg' }}
              minH="48px"
              pr={12}
              fontSize={{ base: 'sm', sm: 'md' }}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaLock} color="gray.400" boxSize={{ base: 4, sm: 5 }} />
            </InputLeftElement>
            <Input
              placeholder="Password"
              type="password"
              bg={inputBg}
              value={formData.password}
              onChange={handleFieldChange('password')}
              autoComplete="current-password"
              size={{ base: 'md', sm: 'lg' }}
              minH="48px"
              pr={12}
              fontSize={{ base: 'sm', sm: 'md' }}
            />
          </InputGroup>
          {errorMessage && (
            <Text 
              color="red.500" 
              fontSize={{ base: 'xs', sm: 'sm' }} 
              textAlign="center"
              p={2}
              bg="red.50"
              borderRadius="md"
            >
              {errorMessage}
            </Text>
          )}
          <Button 
            colorScheme="green" 
            size={{ base: 'md', sm: 'lg' }} 
            type="submit" 
            isLoading={isLoading}
            minH="48px"
            fontSize={{ base: 'sm', sm: 'md' }}
            fontWeight="medium"
            borderRadius="lg"
            _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            Log In
          </Button>
        </Stack>
        <Button
          as={RouterLink}
          to="/"
          variant="ghost"
          size={{ base: 'sm', sm: 'sm' }}
          color="gray.500"
          mt={{ base: 3, sm: 4 }}
          fontSize={{ base: 'sm', sm: 'md' }}
          _hover={{ bg: 'gray.100' }}
        >
          Back to home
        </Button>
      </Flex>
    </Container>
  );
};

export default LoginPage;
