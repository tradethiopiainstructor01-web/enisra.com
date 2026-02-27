import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaArrowRight, FaBookOpen, FaGraduationCap, FaSignOutAlt, FaUserShield } from "react-icons/fa";
import {
  getScholarshipDashboard
} from "../services/scholarshipAuthService";

const ScholarshipPortalPage = () => {
  const navigate = useNavigate();
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const phone = useMemo(() => localStorage.getItem("scholarshipPhone") || "", []);
  const pageBg = useColorModeValue("#f5faff", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const token = localStorage.getItem("scholarshipToken");
    if (!token) {
      navigate("/scholarship-login", { replace: true });
      return;
    }

    const loadDashboard = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await getScholarshipDashboard(token);
        setActions(
          response.actions || [
            { id: "scholarship", title: "Apply for Scholarship", description: "Open scholarship services." },
            { id: "free-training", title: "Join Free Training", description: "Open free training services." }
          ]
        );
      } catch (error) {
        localStorage.removeItem("scholarshipToken");
        localStorage.removeItem("scholarshipPhone");
        setErrorMessage(error.response?.data?.message || "Session expired. Please log in again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("scholarshipToken");
    localStorage.removeItem("scholarshipPhone");
    navigate("/scholarship-login", { replace: true });
  };

  const actionRouteMap = {
    scholarship: "/scholarship-application",
    "free-training": "/free-training-courses",
  };

  const actionIconMap = {
    scholarship: FaGraduationCap,
    "free-training": FaBookOpen,
  };

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 6, md: 10 }}>
      <Container maxW="5xl">
        <Stack spacing={6}>
          <Box
            borderRadius="2xl"
            px={{ base: 5, md: 8 }}
            py={{ base: 5, md: 7 }}
            color="white"
            bg="linear-gradient(135deg, #0b3b9f 0%, #1d4ed8 55%, #0891b2 100%)"
            boxShadow="0 14px 35px rgba(29, 78, 216, 0.35)"
          >
            <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
              <Stack spacing={2}>
                <Heading size="lg">Student Dashboard</Heading>
                <Text opacity={0.92}>Welcome back. Continue your scholarship and training journey.</Text>
                <Badge width="fit-content" colorScheme="blackAlpha" variant="subtle" px={3} py={1} borderRadius="full">
                  Logged in: {phone}
                </Badge>
              </Stack>
              <Button
                leftIcon={<Icon as={FaSignOutAlt} />}
                colorScheme="whiteAlpha"
                variant="outline"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </Flex>
            <Button
              mt={4}
              size="sm"
              variant="ghost"
              colorScheme="whiteAlpha"
              onClick={handleLogout}
            >
              Sign out securely
            </Button>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Box bg={cardBg} borderWidth="1px" borderRadius="xl" p={4}>
              <Badge colorScheme="blue" mb={2}>Security</Badge>
              <Flex align="center" gap={3}>
                <Icon as={FaUserShield} color="blue.500" boxSize={5} />
                <Text fontWeight="semibold">PIN protected access</Text>
              </Flex>
            </Box>
            <Box bg={cardBg} borderWidth="1px" borderRadius="xl" p={4}>
              <Badge colorScheme="green" mb={2}>Scholarship</Badge>
              <Text fontWeight="semibold">Application workflow ready</Text>
            </Box>
            <Box bg={cardBg} borderWidth="1px" borderRadius="xl" p={4}>
              <Badge colorScheme="purple" mb={2}>Training</Badge>
              <Text fontWeight="semibold">Free courses available</Text>
            </Box>
          </SimpleGrid>

          {errorMessage ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Text>{errorMessage}</Text>
            </Alert>
          ) : null}

          <Box>
            <Heading size="md" mb={4}>
              Available Actions
            </Heading>
          </Box>

          {isLoading ? (
            <Stack align="center" py={10}>
              <Spinner size="lg" color="blue.500" />
              <Text color="gray.500">Loading dashboard...</Text>
            </Stack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {actions.map((action) => (
                <Box
                  key={action.id}
                  borderWidth="1px"
                  borderRadius="2xl"
                  p={{ base: 5, md: 6 }}
                  bg={cardBg}
                  boxShadow="sm"
                >
                  <Stack spacing={4}>
                    <Flex align="center" gap={3}>
                      <Flex
                        boxSize="42px"
                        borderRadius="xl"
                        align="center"
                        justify="center"
                        bg={action.id === "scholarship" ? "blue.50" : "teal.50"}
                      >
                        <Icon
                          as={actionIconMap[action.id] || FaGraduationCap}
                          color={action.id === "scholarship" ? "blue.600" : "teal.600"}
                          boxSize={5}
                        />
                      </Flex>
                      <Heading size="md">{action.title}</Heading>
                    </Flex>

                    <Text color="gray.600">{action.description}</Text>

                    <Button
                      as={RouterLink}
                      to={actionRouteMap[action.id] || "/scholarship-portal"}
                      rightIcon={<Icon as={FaArrowRight} />}
                      colorScheme={action.id === "scholarship" ? "blue" : "teal"}
                      width="fit-content"
                    >
                      Open
                    </Button>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default ScholarshipPortalPage;
