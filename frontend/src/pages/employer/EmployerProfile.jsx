import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Progress,
  SimpleGrid,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiBriefcase, FiMail, FiShield, FiUsers } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { useUserStore } from "../../store/user";

const EmployerProfile = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const pageBg = useColorModeValue("gray.50", "gray.950");
  const panelBg = useColorModeValue("white", "gray.900");
  const heroBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const subtleText = useColorModeValue("gray.500", "gray.400");
  const accent = useColorModeValue("green.500", "green.300");

  const displayName = currentUser?.fullName || currentUser?.username || "Employer";
  const displayEmail = currentUser?.email || "employer@gmail.com";
  const displayRole = currentUser?.displayRole || currentUser?.role || "employer";
  const displayDepartment = currentUser?.department || "Not set";
  const displayStatus = currentUser?.status || "Active";
  const normalizedStatus = displayStatus.toString().toLowerCase();
  const statusScheme = normalizedStatus.includes("pending")
    ? "orange"
    : normalizedStatus.includes("inactive")
    ? "red"
    : "green";

  const profileFields = [displayName, displayEmail, displayRole, displayDepartment];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  return (
    <Box bg={pageBg} minH="100vh">
      <Container maxW="7xl">
        <Stack spacing={{ base: 6, md: 8 }}>
          <Box
            bg={heroBg}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="lg"
            px={{ base: 4, md: 6 }}
            py={{ base: 4, md: 5 }}
            position="relative"
            overflow="hidden"
            position="sticky"
            top={{ base: 3, md: 6 }}
            zIndex="1"
            sx={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(34, 197, 94, 0.12), transparent 55%), radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.18), transparent 45%)",
            }}
          >
            <Flex
              direction={{ base: "column", lg: "row" }}
              align={{ base: "flex-start", lg: "center" }}
              justify="space-between"
              gap={{ base: 4, md: 6 }}
            >
              <Stack spacing={3} maxW="2xl">
                <HStack spacing={2} flexWrap="wrap">
                  <Badge colorScheme="green" variant="subtle">
                    Employer
                  </Badge>
                  <Badge colorScheme={statusScheme} variant="outline">
                    {displayStatus}
                  </Badge>
                </HStack>
                <Heading size="lg">Welcome back, {displayName}</Heading>
                <Text color={mutedText} fontSize="sm">
                  Manage your company profile, keep listings up to date, and stay aligned with your team.
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  <Button
                    as={RouterLink}
                    to="/employer/post"
                    colorScheme="green"
                    size="sm"
                  >
                    Post a job
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/employer/employees"
                    variant="outline"
                    borderColor={borderColor}
                    size="sm"
                  >
                    View employees
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/requests"
                    variant="ghost"
                    color={accent}
                    size="sm"
                  >
                    Submit request
                  </Button>
                </HStack>
              </Stack>

              <Card
                bg={panelBg}
                borderWidth="1px"
                borderColor={borderColor}
                minW={{ base: "100%", lg: "280px" }}
                boxShadow="lg"
              >
                <CardBody>
                  <HStack spacing={4} align="center">
                    <Avatar size="md" name={displayName} bg={accent} />
                    <Box>
                      <Heading size="sm">{displayName}</Heading>
                      <Text fontSize="xs" color={subtleText}>
                        {displayRole}
                      </Text>
                    </Box>
                  </HStack>
                  <Divider my={3} borderColor={borderColor} />
                  <Stack spacing={2}>
                    <HStack spacing={3}>
                      <Icon as={FiMail} color={accent} />
                      <Text fontSize="xs">{displayEmail}</Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={FiBriefcase} color={accent} />
                      <Text fontSize="xs">{displayDepartment}</Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={FiShield} color={accent} />
                      <Text fontSize="xs">Account ID: {currentUser?._id || "Not assigned"}</Text>
                    </HStack>
                  </Stack>
                </CardBody>
              </Card>
            </Flex>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg={panelBg} borderWidth="1px" borderColor={borderColor} boxShadow="md">
              <CardHeader>
                <Heading size="sm">Company details</Heading>
                <Text color={subtleText} fontSize="sm" mt={1}>
                  Keep your profile consistent across the portal.
                </Text>
              </CardHeader>
              <CardBody>
                <Stack spacing={3}>
                  <Box>
                    <Text fontSize="xs" color={subtleText}>
                      Company / Name
                    </Text>
                    <Text fontWeight="semibold">{displayName}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={subtleText}>
                      Role
                    </Text>
                    <Text fontWeight="semibold">{displayRole}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={subtleText}>
                      Department
                    </Text>
                    <Text fontWeight="semibold">{displayDepartment}</Text>
                  </Box>
                </Stack>
              </CardBody>
            </Card>

            <Card bg={panelBg} borderWidth="1px" borderColor={borderColor} boxShadow="md">
              <CardHeader>
                <Heading size="sm">Contact</Heading>
                <Text color={subtleText} fontSize="sm" mt={1}>
                  Main points of contact for the employer account.
                </Text>
              </CardHeader>
              <CardBody>
                <Stack spacing={3}>
                  <Box>
                    <Text fontSize="xs" color={subtleText}>
                      Email
                    </Text>
                    <Text fontWeight="semibold">{displayEmail}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={subtleText}>
                      Username
                    </Text>
                    <Text fontWeight="semibold">{currentUser?.username || "Not set"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={subtleText}>
                      Status
                    </Text>
                    <Badge colorScheme={statusScheme} variant="subtle">
                      {displayStatus}
                    </Badge>
                  </Box>
                </Stack>
              </CardBody>
            </Card>

            <Card bg={panelBg} borderWidth="1px" borderColor={borderColor} boxShadow="md">
              <CardHeader>
                <Heading size="sm">Profile health</Heading>
                <Text color={subtleText} fontSize="sm" mt={1}>
                  Complete profiles unlock more automation.
                </Text>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <Box>
                    <Stat>
                      <StatLabel color={subtleText}>Profile completion</StatLabel>
                      <StatNumber>{profileCompletion}%</StatNumber>
                    </Stat>
                    <Progress
                      mt={3}
                      value={profileCompletion}
                      size="sm"
                      borderRadius="full"
                      colorScheme="green"
                      bg={useColorModeValue("gray.100", "gray.700")}
                    />
                  </Box>
                  <Box>
                    <HStack spacing={3}>
                      <Icon as={FiUsers} color={accent} />
                      <Text fontSize="sm" color={mutedText}>
                        Track employee records and job postings from the Employer dashboard.
                      </Text>
                    </HStack>
                  </Box>
                  <Button
                    as={RouterLink}
                    to="/employer/employees"
                    variant="outline"
                    borderColor={borderColor}
                    size="sm"
                    alignSelf="flex-start"
                  >
                    Review employees
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
};

export default EmployerProfile;
