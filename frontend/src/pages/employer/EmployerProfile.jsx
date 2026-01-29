import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useUserStore } from "../../store/user";

const EmployerProfile = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");

  return (
    <Box maxW="7xl" mx="auto">
      <Heading size="lg" mb={6}>
        Profile
      </Heading>
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
        <CardHeader>
          <Heading size="md">Employer account</Heading>
          <Text color={mutedText} mt={1}>
            Your company details at a glance.
          </Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Box>
              <Text fontSize="sm" color={mutedText}>
                Company / Name
              </Text>
              <Text fontWeight="semibold">
                {currentUser?.fullName || currentUser?.username || "Employer"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color={mutedText}>
                Email
              </Text>
              <Text fontWeight="semibold">
                {currentUser?.email || "employer@gmail.com"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color={mutedText}>
                Role
              </Text>
              <Text fontWeight="semibold">
                {currentUser?.displayRole || currentUser?.role || "employer"}
              </Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default EmployerProfile;
