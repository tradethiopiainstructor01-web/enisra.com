import { useState, useEffect, useCallback, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Badge,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  VStack,
  useColorMode,
  useToast
} from '@chakra-ui/react';
import { FaCheckCircle, FaLock, FaUser } from 'react-icons/fa';
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

const darkThemeColors = {
  primaryBlue: '#22D3EE',
  bgMain:
    'radial-gradient(circle at top left, rgba(99, 102, 241, 0.22), transparent 28%), radial-gradient(circle at top right, rgba(34, 211, 238, 0.14), transparent 24%), linear-gradient(180deg, #0F172A 0%, #020617 100%)',
  cardBg: 'rgba(255, 255, 255, 0.10)',
  border: 'rgba(148, 163, 184, 0.20)',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5F5',
  placeholder: '#94A3B8',
  warning: '#F59E0B',
  surfaceGlow: '0 24px 60px rgba(2, 6, 23, 0.42)',
  buttonGradient: 'linear-gradient(90deg, #6366F1 0%, #22D3EE 100%)',
  buttonGradientHover: 'linear-gradient(90deg, #7C83FF 0%, #67E8F9 100%)',
  softBlueBg: 'rgba(34, 211, 238, 0.12)',
};

const lightThemeColors = {
  primaryBlue: '#0891b2',
  bgMain:
    'radial-gradient(circle at top left, rgba(99, 102, 241, 0.12), transparent 28%), radial-gradient(circle at top right, rgba(8, 145, 178, 0.08), transparent 24%), linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)',
  cardBg: 'rgba(255, 255, 255, 0.7)',
  border: 'rgba(203, 213, 225, 0.5)',
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  placeholder: '#64748B',
  warning: '#D97706',
  surfaceGlow: '0 24px 60px rgba(2, 6, 23, 0.08)',
  buttonGradient: 'linear-gradient(90deg, #6366F1 0%, #0891b2 100%)',
  buttonGradientHover: 'linear-gradient(90deg, #7C83FF 0%, #06b6d4 100%)',
  softBlueBg: 'rgba(8, 145, 178, 0.08)',
};

const loginHighlights = [
  'Access saved jobs and job alerts',
  'Continue with your role-based dashboard',
  'Manage favorites and applications faster',
];

const LoginPage = () => {
  const { colorMode } = useColorMode();
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
  const {
    primaryBlue,
    bgMain,
    cardBg,
    border,
    textPrimary,
    textSecondary,
    placeholder,
    warning,
    surfaceGlow,
    buttonGradient,
    buttonGradientHover,
    softBlueBg,
  } = colorMode === 'light' ? lightThemeColors : darkThemeColors;
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
    <Box bg={bgMain} minH="100vh">
    <Container
      maxW="5xl"
      minH="100vh"
      py={{ base: 10, sm: 16, md: 20 }}
      px={{ base: 2, sm: 4 }}
    >
      <Flex
        bg={cardBg}
        borderRadius="3xl"
        borderWidth="1px"
        borderColor={border}
        boxShadow={surfaceGlow}
        backdropFilter="blur(18px)"
        width="100%"
        overflow="hidden"
        direction={{ base: 'column', md: 'row' }}
      >
        <Box
          flex="1"
          px={{ base: 6, md: 8 }}
          py={{ base: 8, md: 10 }}
          bg={buttonGradient}
          color="white"
        >
          <VStack align="start" spacing={5}>
            <HStack spacing={3}>
              <Flex
                align="center"
                justify="center"
                w="46px"
                h="46px"
                borderRadius="xl"
                bg="whiteAlpha.260"
                border="1px solid"
                borderColor="whiteAlpha.400"
              >
                <Icon as={FaUser} boxSize={5} />
              </Flex>
              <Heading size="md">Account Login</Heading>
            </HStack>
            <Text opacity={0.95} fontSize={{ base: 'sm', md: 'md' }}>
              Sign in to continue where you left off and access jobs, saved opportunities, and your account tools.
            </Text>
            <VStack align="start" spacing={3} pt={2}>
              {loginHighlights.map((item) => (
                <HStack
                  key={item}
                  bg="whiteAlpha.170"
                  px={3}
                  py={2}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="whiteAlpha.280"
                >
                  <Icon as={FaCheckCircle} />
                  <Text fontSize="sm">{item}</Text>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Box>

        <Box flex="1.1" px={{ base: 6, md: 8 }} py={{ base: 8, md: 10 }}>
          <Stack spacing={5}>
            <Heading
              size={{ base: 'lg', sm: 'xl', md: '2xl' }}
              lineHeight="1.2"
              color={textPrimary}
            >
              Welcome back
            </Heading>
            <Text
              color={textSecondary}
              fontSize={{ base: 'sm', sm: 'md' }}
              lineHeight="1.4"
            >
              Log in to access personalized job matches, saved opportunities, and scholarship alerts.
            </Text>

            <Divider borderColor={border} />

            <Stack as="form" spacing={{ base: 3, sm: 4 }} w="100%" onSubmit={handleSubmit}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaUser} color={placeholder} boxSize={{ base: 4, sm: 5 }} />
            </InputLeftElement>
            <Input
              placeholder="Email or username"
              type="text"
              bg={softBlueBg}
              value={formData.email}
              onChange={handleFieldChange('email')}
              autoComplete="username"
              size={{ base: 'md', sm: 'lg' }}
              minH="48px"
              pr={12}
              fontSize={{ base: 'sm', sm: 'md' }}
              color={textPrimary}
              borderColor={border}
              _placeholder={{ color: placeholder }}
              _hover={{ borderColor: primaryBlue }}
              _focusVisible={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaLock} color={placeholder} boxSize={{ base: 4, sm: 5 }} />
            </InputLeftElement>
            <Input
              placeholder="Password"
              type="password"
              bg={softBlueBg}
              value={formData.password}
              onChange={handleFieldChange('password')}
              autoComplete="current-password"
              size={{ base: 'md', sm: 'lg' }}
              minH="48px"
              pr={12}
              fontSize={{ base: 'sm', sm: 'md' }}
              color={textPrimary}
              borderColor={border}
              _placeholder={{ color: placeholder }}
              _hover={{ borderColor: primaryBlue }}
              _focusVisible={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
            />
          </InputGroup>
          {errorMessage && (
            <Text 
              color={warning}
              fontSize={{ base: 'xs', sm: 'sm' }} 
              textAlign="center"
              p={2}
              bg={softBlueBg}
              borderRadius="md"
            >
              {errorMessage}
            </Text>
          )}
          <Button 
            size={{ base: 'md', sm: 'lg' }} 
            type="submit" 
            isLoading={isLoading}
            minH="48px"
            fontSize={{ base: 'sm', sm: 'md' }}
            fontWeight="medium"
            borderRadius="lg"
            color="white"
            bgGradient={buttonGradient}
            _hover={{ transform: 'translateY(-1px)', boxShadow: surfaceGlow, bgGradient: buttonGradientHover }}
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
                <Text fontSize={{ base: 'xs', sm: 'sm' }} color={textSecondary} textAlign="center">
                  Loading Google sign-in...
                </Text>
              )}
              {isGoogleLoading && (
                <Text fontSize={{ base: 'xs', sm: 'sm' }} color={textSecondary} textAlign="center">
                  Signing in with Google...
                </Text>
              )}
            </Stack>
          ) : (
            <Text fontSize={{ base: 'xs', sm: 'sm' }} color={warning} textAlign="center">
              Google sign-in is not configured. Add `VITE_GOOGLE_CLIENT_ID`.
            </Text>
          )}
            <Stack direction="row" spacing={3} mt={{ base: 3, sm: 4 }}>
              <Button
                as={RouterLink}
                to="/"
                variant="ghost"
                size={{ base: 'sm', sm: 'sm' }}
                color={textSecondary}
                fontSize={{ base: 'sm', sm: 'md' }}
                _hover={{ bg: softBlueBg, color: primaryBlue }}
              >
                Back to home
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                variant="outline"
                size={{ base: 'sm', sm: 'sm' }}
                borderColor={primaryBlue}
                color={primaryBlue}
                fontSize={{ base: 'sm', sm: 'md' }}
                _hover={{ bg: softBlueBg }}
              >
                Sign up
              </Button>
            </Stack>
          </Stack>
          </Stack>
        </Box>
      </Flex>
    </Container>
    </Box>
  );
};

export default LoginPage;
