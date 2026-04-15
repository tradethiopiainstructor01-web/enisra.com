import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Badge,
  Button,
  Container,
  Divider,
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
  useColorMode,
  useToast,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { FaCheckCircle, FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';
import axiosInstance from '../services/axiosInstance';

const darkThemeColors = {
  primaryGreen: '#6366F1',
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
  primaryGreen: '#6366F1',
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

const registerHighlights = [
  'Create an employee or employer account',
  'Track applications and job activity in one place',
  'Use the same trusted Enisra experience across the platform',
];

const RegisterPage = () => {
  const { colorMode } = useColorMode();
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
  const {
    primaryGreen,
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
    <Box bg={bgMain} minH="100vh">
    <Container 
      maxW="5xl" 
      minH="100vh" 
      py={{ base: 12, sm: 16 }}
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
                <Icon as={FaEnvelope} boxSize={5} />
              </Flex>
              <Heading size="md">Create Account</Heading>
            </HStack>
            <Text opacity={0.95} fontSize={{ base: 'sm', md: 'md' }}>
              Join Enisra to post jobs, track applicants, and grow your team with trusted talent.
            </Text>
            <VStack align="start" spacing={3} pt={2}>
              {registerHighlights.map((item) => (
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
              Create an account
            </Heading>
            <Text
              color={textSecondary}
              fontSize={{ base: 'sm', sm: 'md' }}
              lineHeight="1.4"
            >
              Choose your role and complete the form to get started.
            </Text>

            <Stack spacing={{ base: 2, sm: 2 }}>
              <Text fontSize="sm" color={textSecondary}>
                Select the experience that matches your role
              </Text>
              <HStack spacing={3}>
                <Button
                  size="sm"
                  bg={accountType === 'employee' ? softBlueBg : 'transparent'}
                  color={accountType === 'employee' ? primaryBlue : textSecondary}
                  border="1px solid"
                  borderColor={accountType === 'employee' ? primaryBlue : border}
                  onClick={() => handleAccountSwitch('employee')}
                  borderRadius="full"
                  px={6}
                  _hover={{ bg: softBlueBg }}
                >
                  Employee
                </Button>
                <Button
                  size="sm"
                  bg={accountType === 'employer' ? softBlueBg : 'transparent'}
                  color={accountType === 'employer' ? primaryBlue : textSecondary}
                  border="1px solid"
                  borderColor={accountType === 'employer' ? primaryBlue : border}
                  onClick={() => handleAccountSwitch('employer')}
                  borderRadius="full"
                  px={6}
                  _hover={{ bg: softBlueBg }}
                >
                  Employer
                </Button>
              </HStack>
            </Stack>

            <Divider borderColor={border} />

            <Stack spacing={4} as="form" onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel color={textPrimary}>Full Name</FormLabel>
            <Input
              placeholder="Jane Doe"
              bg={softBlueBg}
              value={formData.fullName}
              onChange={handleChange('fullName')}
              autoComplete="name"
              color={textPrimary}
              borderColor={border}
              _placeholder={{ color: placeholder }}
              _hover={{ borderColor: primaryBlue }}
              _focusVisible={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color={textPrimary}>Phone Number</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaPhone} color={placeholder} />
              </InputLeftElement>
              <Input
                placeholder="(555) 555-5555"
                type="tel"
                bg={softBlueBg}
                value={formData.phoneNumber}
                onChange={handleChange('phoneNumber')}
                autoComplete="tel"
                color={textPrimary}
                borderColor={border}
                _placeholder={{ color: placeholder }}
                _hover={{ borderColor: primaryBlue }}
                _focusVisible={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel color={textPrimary}>Email</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaEnvelope} color={placeholder} />
              </InputLeftElement>
              <Input
                placeholder="email@enisra.com"
                type="email"
                bg={softBlueBg}
                value={formData.email}
                onChange={handleChange('email')}
                autoComplete="email"
                color={textPrimary}
                borderColor={border}
                _placeholder={{ color: placeholder }}
                _hover={{ borderColor: primaryBlue }}
                _focusVisible={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel color={textPrimary}>Password</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaLock} color={placeholder} />
              </InputLeftElement>
              <Input
                placeholder="Enter password"
                type="password"
                bg={softBlueBg}
                value={formData.password}
                onChange={handleChange('password')}
                autoComplete="new-password"
                color={textPrimary}
                borderColor={border}
                _placeholder={{ color: placeholder }}
                _hover={{ borderColor: primaryBlue }}
                _focusVisible={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel color={textPrimary}>Confirm Password</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaLock} color={placeholder} />
              </InputLeftElement>
              <Input
                placeholder="Re-enter password"
                type="password"
                bg={softBlueBg}
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                autoComplete="new-password"
                color={textPrimary}
                borderColor={border}
                _placeholder={{ color: placeholder }}
                _hover={{ borderColor: primaryBlue }}
                _focusVisible={{ borderColor: primaryBlue, boxShadow: `0 0 0 1px ${primaryBlue}` }}
              />
            </InputGroup>
          </FormControl>

          {errorMessage && (
            <Text fontSize="sm" color={warning} textAlign="center" role="alert" bg={softBlueBg} p={2} borderRadius="md">
              {errorMessage}
            </Text>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            color="white"
            bgGradient={buttonGradient}
            _hover={{ bgGradient: buttonGradientHover, boxShadow: surfaceGlow }}
          >
            {ctaLabel}
          </Button>
            <Text mt={2} textAlign="center" fontSize="sm" color={textSecondary}>
              Already have an account?{' '}
              <RouterLink to="/login">
                <Text as="span" color={primaryGreen} fontWeight="bold">
                  Log in
                </Text>
              </RouterLink>
            </Text>
          </Stack>
          </Stack>
        </Box>
      </Flex>
    </Container>
    </Box>
  );
};

export default RegisterPage;
