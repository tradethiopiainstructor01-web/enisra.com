import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiClipboard, FiDollarSign, FiUsers } from "react-icons/fi";

const HRDashboard = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");

  const hrActions = [
    {
      title: "Payroll",
      description: "Review payroll runs and approvals.",
      icon: FiDollarSign,
      to: "/payroll",
      cta: "Open payroll",
    },
    {
      title: "Employee Records",
      description: "Manage employee accounts and profiles.",
      icon: FiUsers,
      to: "/users",
      cta: "View employees",
    },
    {
      title: "Requests",
      description: "Track internal HR requests and follow-ups.",
      icon: FiClipboard,
      to: "/requests",
      cta: "View requests",
    },
  ];

  return (
    <Box maxW="7xl" mx="auto">
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg">HR Dashboard</Heading>
          <Text color={mutedText} mt={1}>
            HR workflows and employee services.
          </Text>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {hrActions.map((action) => (
          <Card key={action.title} bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Heading size="md">{action.title}</Heading>
              <Text color={mutedText} fontSize="sm" mt={2}>
                {action.description}
              </Text>
            </CardHeader>
            <CardBody>
              <Button
                as={RouterLink}
                to={action.to}
                size="sm"
                variant="outline"
                leftIcon={<action.icon />}
              >
                {action.cta}
              </Button>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default HRDashboard;
