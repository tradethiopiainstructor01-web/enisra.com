import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormHelperText,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftAddon,
  Stack,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaCheckCircle, FaGraduationCap, FaLock, FaMobileAlt } from "react-icons/fa";
import { loginScholarshipSubscriber } from "../services/scholarshipAuthService";

const phonePattern = /^(?:251\d{9}|09\d{8})$/;
const passwordMinLength = 6;

const ScholarshipLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [msisdn, setMsisdn] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const redirectTo =
    searchParams.get("redirect") ||
    location.state?.redirectTo ||
    "/scholarship-portal";

  const normalizedMsisdn = useMemo(() => msisdn.replace(/\s+/g, ""), [msisdn]);
  const cardBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue(
    "radial-gradient(circle at 15% 20%, #dbeafe 0%, #f0f9ff 35%, #f8fafc 100%)",
    "gray.900"
  );
  const leftPanelBg = useColorModeValue("linear-gradient(135deg, #0f766e 0%, #0e7490 100%)", "teal.700");
  const cardBorder = useColorModeValue("whiteAlpha.700", "whiteAlpha.200");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputBorder = useColorModeValue("blue.100", "gray.600");
  const inputHoverBorder = useColorModeValue("blue.300", "gray.500");

  useEffect(() => {
    if (localStorage.getItem("scholarshipToken")) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!phonePattern.test(normalizedMsisdn)) {
      setErrorMessage("Phone number must start with 09 or 251.");
      return;
    }
    if (password.trim().length < passwordMinLength) {
      setErrorMessage(`Password must be at least ${passwordMinLength} characters.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await loginScholarshipSubscriber({
        msisdn: normalizedMsisdn,
        password: password.trim(),
      });
      localStorage.setItem("scholarshipToken", response.token);
      localStorage.setItem("scholarshipPhone", normalizedMsisdn);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 6, md: 12 }} position="relative" overflow="hidden">
      <Box
        position="absolute"
        top="-80px"
        right="-120px"
        w="340px"
        h="340px"
        borderRadius="full"
        bg="blue.200"
        filter="blur(80px)"
        opacity={0.35}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-100px"
        left="-140px"
        w="360px"
        h="360px"
        borderRadius="full"
        bg="teal.200"
        filter="blur(90px)"
        opacity={0.35}
        pointerEvents="none"
      />
      <Container maxW="5xl">
        <Box
          borderRadius="3xl"
          overflow="hidden"
          boxShadow="0 24px 80px rgba(15, 23, 42, 0.22)"
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
          backdropFilter="saturate(160%) blur(2px)"
          position="relative"
        >
          <Flex direction={{ base: "column", md: "row" }}>
            <Box
              flex="1"
              px={{ base: 6, md: 8 }}
              py={{ base: 8, md: 10 }}
              bg={leftPanelBg}
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
                    <Icon as={FaGraduationCap} boxSize={6} />
                  </Flex>
                  <Heading size="md">Scholarship Access</Heading>
                </HStack>
                <Text opacity={0.95} fontSize={{ base: "sm", md: "md" }}>
                  An admin creates your scholar account. Login using the phone number and password they give you.
                </Text>
                <VStack align="start" spacing={3} pt={2}>
                  <HStack
                    bg="whiteAlpha.170"
                    px={3}
                    py={2}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="whiteAlpha.280"
                  >
                    <Icon as={FaMobileAlt} />
                    <Text fontSize="sm">Use your registered phone number</Text>
                  </HStack>
                  <HStack
                    bg="whiteAlpha.170"
                    px={3}
                    py={2}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="whiteAlpha.280"
                  >
                    <Icon as={FaLock} />
                    <Text fontSize="sm">Secure password-based login</Text>
                  </HStack>
                  <HStack
                    bg="whiteAlpha.170"
                    px={3}
                    py={2}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="whiteAlpha.280"
                  >
                    <Icon as={FaCheckCircle} />
                    <Text fontSize="sm">Ask admin if you need a new password</Text>
                  </HStack>
                </VStack>
              </VStack>
            </Box>

            <Box flex="1.1" px={{ base: 6, md: 8 }} py={{ base: 8, md: 10 }}>
              <Stack spacing={5}>
                <Heading size="lg" letterSpacing="-0.02em">
                  Login
                </Heading>
                <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                  Enter the phone number and password created for your scholar account.
                </Text>

                <HStack spacing={2}>
                  <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                    1. Admin creates account
                  </Badge>
                  <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                    2. Login with password
                  </Badge>
                </HStack>

                <Divider />

                <Box as="form" onSubmit={handleLogin}>
                  <Stack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>MSISDN</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftAddon>ET</InputLeftAddon>
                        <Input
                          placeholder="09XXXXXXXX or 251XXXXXXXXX"
                          value={msisdn}
                          onChange={(event) => setMsisdn(event.target.value)}
                          bg={inputBg}
                          borderColor={inputBorder}
                          _hover={{ borderColor: inputHoverBorder }}
                          _focusVisible={{
                            borderColor: "blue.400",
                            boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                          }}
                        />
                      </InputGroup>
                      <FormHelperText>
                        Must start with 09 or 251
                      </FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        size="lg"
                        placeholder="Enter password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        bg={inputBg}
                        borderColor={inputBorder}
                        _hover={{ borderColor: inputHoverBorder }}
                        _focusVisible={{
                          borderColor: "blue.400",
                          boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                        }}
                      />
                      <FormHelperText>
                        Minimum {passwordMinLength} characters
                      </FormHelperText>
                    </FormControl>

                    <Button
                      type="submit"
                      size="lg"
                      bgGradient="linear(to-r, teal.500, blue.500)"
                      color="white"
                      _hover={{ bgGradient: "linear(to-r, teal.600, blue.600)" }}
                      isLoading={isSubmitting}
                      boxShadow="0 8px 24px rgba(14, 116, 144, 0.35)"
                    >
                      Login
                    </Button>
                  </Stack>
                </Box>

                {errorMessage ? (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">{errorMessage}</Text>
                  </Alert>
                ) : null}

                <Button as={RouterLink} to="/" variant="ghost" size="sm" alignSelf="flex-start">
                  Back to Home
                </Button>
              </Stack>
            </Box>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default ScholarshipLoginPage;
