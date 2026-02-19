import { useState, useEffect, useCallback, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
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

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const ROLE_ROUTE_MAP = {
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

const normalizeRole = (role = '') =>
  role
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const resolveRoleDestination = (role) => ROLE_ROUTE_MAP[normalizeRole(role)] || '/';

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
  const currentUser = useUserStore((state) => state.currentUser);
  const formBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const googleButtonRef = useRef(null);
  const [isGoogleScriptReady, setIsGoogleScriptReady] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSuccessfulLogin = useCallback(
    (data, title = 'Welcome back', description = 'You have been signed in successfully.') => {
      setCurrentUser({ ...data.user, token: data.token });
      toast({
        title,
        description,
        status: 'success',
        duration: 4000,
        isClosable: true
      });
      navigate(resolveRoleDestination(data.user?.role));
    },
    [navigate, setCurrentUser, toast]
  );

  const handleGoogleCredential = useCallback(
    async (googleResponse) => {
      const credential = googleResponse?.credential;
      if (!credential) {
        toast({
          title: 'Google login failed',
          description: 'No Google credential was received.',
          status: 'error',
          duration: 4000,
          isClosable: true
        });
        return;
      }

      setIsGoogleLoading(true);
      setErrorMessage('');

      try {
        const response = await axiosInstance.post('/users/google-login', { credential });
        const { data } = response;
        if (!data.success || !data.token || !data.user) {
          throw new Error(data.message || 'Invalid Google login response');
        }

        handleSuccessfulLogin(
          data,
          'Welcome',
          data.message || 'You have been signed in with Google.'
        );
      } catch (error) {
        const friendlyMessage =
          error.response?.data?.message || error.message || 'Unable to sign in with Google.';
        setErrorMessage(friendlyMessage);
        toast({
          title: 'Google login failed',
          description: friendlyMessage,
          status: 'error',
          duration: 4000,
          isClosable: true
        });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [handleSuccessfulLogin, toast]
  );

  // If already authenticated, skip login page and go to appropriate area.
  useEffect(() => {
    if (!currentUser?.token) return;
    const destination = resolveRoleDestination(currentUser.role || currentUser.normalizedRole);
    navigate(destination, { replace: true });
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!googleClientId) return undefined;

    if (window.google?.accounts?.id) {
      setIsGoogleScriptReady(true);
      return undefined;
    }

    const onScriptLoad = () => setIsGoogleScriptReady(true);
    const onScriptError = () => {
      toast({
        title: 'Google sign-in unavailable',
        description: 'Unable to load Google authentication right now.',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener('load', onScriptLoad);
      existingScript.addEventListener('error', onScriptError);
      return () => {
        existingScript.removeEventListener('load', onScriptLoad);
        existingScript.removeEventListener('error', onScriptError);
      };
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.id = GOOGLE_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', onScriptLoad);
    script.addEventListener('error', onScriptError);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', onScriptLoad);
      script.removeEventListener('error', onScriptError);
    };
  }, [googleClientId, toast]);

  useEffect(() => {
    if (!googleClientId || !isGoogleScriptReady || !googleButtonRef.current || !window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential,
      ux_mode: 'popup',
      auto_select: false
    });

    googleButtonRef.current.innerHTML = '';
    const width = Math.max(280, Math.min(420, Math.floor(googleButtonRef.current.offsetWidth || 340)));
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: 'standard',
      theme: 'outline',
      text: 'continue_with',
      size: 'large',
      shape: 'rectangular',
      logo_alignment: 'left',
      width
    });
  }, [googleClientId, handleGoogleCredential, isGoogleScriptReady]);

  const handleFieldChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Email/username and password are required.');
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

      handleSuccessfulLogin(data, 'Welcome back', 'You have been signed in successfully.');
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
              placeholder="Email or username"
              type="text"
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
          {googleClientId ? (
            <Stack spacing={2}>
              <Box
                ref={googleButtonRef}
                width="100%"
                minH="48px"
                display="flex"
                justifyContent="center"
                alignItems="center"
              />
              {!isGoogleScriptReady && (
                <Text fontSize={{ base: 'xs', sm: 'sm' }} color="gray.500" textAlign="center">
                  Loading Google sign-in...
                </Text>
              )}
              {isGoogleLoading && (
                <Text fontSize={{ base: 'xs', sm: 'sm' }} color="gray.600" textAlign="center">
                  Signing in with Google...
                </Text>
              )}
            </Stack>
          ) : (
            <Text fontSize={{ base: 'xs', sm: 'sm' }} color="orange.500" textAlign="center">
              Google sign-in is not configured. Add `VITE_GOOGLE_CLIENT_ID`.
            </Text>
          )}
        </Stack>
        <Stack direction="row" spacing={3} mt={{ base: 3, sm: 4 }}>
          <Button
            as={RouterLink}
            to="/"
            variant="ghost"
            size={{ base: 'sm', sm: 'sm' }}
            color="gray.500"
            fontSize={{ base: 'sm', sm: 'md' }}
            _hover={{ bg: 'gray.100' }}
          >
            Back to home
          </Button>
          <Button
            as={RouterLink}
            to="/register"
            variant="outline"
            size={{ base: 'sm', sm: 'sm' }}
            colorScheme="green"
            fontSize={{ base: 'sm', sm: 'md' }}
          >
            Sign up
          </Button>
        </Stack>
      </Flex>
    </Container>
  );
};

export default LoginPage;
