import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
const pinPattern = /^\d{6}$/;

const ScholarshipLoginPage = () => {
  const navigate = useNavigate();
  const [msisdn, setMsisdn] = useState("");
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const normalizedMsisdn = useMemo(() => msisdn.replace(/\s+/g, ""), [msisdn]);
  const cardBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("#f4f8ff", "gray.900");
  const leftPanelBg = useColorModeValue("linear-gradient(135deg, #0f766e 0%, #0e7490 100%)", "teal.700");

  useEffect(() => {
    if (localStorage.getItem("scholarshipToken")) {
      navigate("/scholarship-portal", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!phonePattern.test(normalizedMsisdn)) {
      setErrorMessage("Phone number must start with 09 or 251.");
      return;
    }
    if (!pinPattern.test(pin)) {
      setErrorMessage("PIN must be exactly 6 digits.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await loginScholarshipSubscriber({ msisdn: normalizedMsisdn, pin });
      localStorage.setItem("scholarshipToken", response.token);
      localStorage.setItem("scholarshipPhone", normalizedMsisdn);
      navigate("/scholarship-portal", { replace: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 6, md: 12 }}>
      <Container maxW="5xl">
        <Box
          borderRadius="3xl"
          overflow="hidden"
          boxShadow="0 20px 60px rgba(15, 23, 42, 0.18)"
          bg={cardBg}
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
                  <Icon as={FaGraduationCap} boxSize={7} />
                  <Heading size="md">Scholarship Access</Heading>
                </HStack>
                <Text opacity={0.95}>
                  Subscribe by SMS first. Send OK to short code 9295, then login using your phone number and PIN.
                </Text>
                <VStack align="start" spacing={3} pt={2}>
                  <HStack>
                    <Icon as={FaMobileAlt} />
                    <Text fontSize="sm">SMS subscribe short code: 9295</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaLock} />
                    <Text fontSize="sm">Secure 6-digit PIN login</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} />
                    <Text fontSize="sm">Fast and mobile-friendly process</Text>
                  </HStack>
                </VStack>
              </VStack>
            </Box>

            <Box flex="1.1" px={{ base: 6, md: 8 }} py={{ base: 8, md: 10 }}>
              <Stack spacing={5}>
                <Heading size="lg">Login</Heading>
                <Text color="gray.600">
                  Enter your subscribed phone number and PIN from SMS.
                </Text>

                <HStack spacing={2}>
                  <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                    1. SMS OK to 9295
                  </Badge>
                  <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                    2. Login with PIN
                  </Badge>
                </HStack>

                <Divider />

                <Box as="form" onSubmit={handleLogin}>
                  <Stack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>MSISDN</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftAddon children="ET" />
                        <Input
                          placeholder="09XXXXXXXX or 251XXXXXXXXX"
                          value={msisdn}
                          onChange={(event) => setMsisdn(event.target.value)}
                        />
                      </InputGroup>
                      <FormHelperText>
                        Must start with 09 or 251
                      </FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>PIN (6 digits)</FormLabel>
                      <Input
                        type="password"
                        size="lg"
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="Enter 6-digit PIN"
                        value={pin}
                        onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      size="lg"
                      colorScheme="green"
                      isLoading={isSubmitting}
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
              </Stack>
            </Box>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default ScholarshipLoginPage;
