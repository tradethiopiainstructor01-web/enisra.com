import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiCheck } from "react-icons/fi";

const PLANS = [
  {
    name: "Starter",
    tone: "gray",
    description: "For small teams hiring occasionally.",
    highlights: ["1 active role", "Standard visibility", "Email support"],
  },
  {
    name: "Growth",
    tone: "green",
    description: "Best for growing teams with frequent hiring.",
    highlights: ["5 active roles", "Featured boosts", "Analytics snapshots"],
  },
  {
    name: "Enterprise",
    tone: "purple",
    description: "For enterprises managing multiple hiring pipelines.",
    highlights: ["Unlimited roles", "Dedicated support", "Custom reporting"],
  },
];

const EmployerUpgradePackage = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const panelBg = useColorModeValue("green.50", "green.900");

  return (
    <Box maxW="7xl" mx="auto">
      <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={6}>
        <Box>
          <Heading size="lg">Upgrade package</Heading>
          <Text color={mutedText} mt={1}>
            Choose a plan that matches your hiring cadence.
          </Text>
        </Box>
      </Flex>

      <Card bg={panelBg} borderWidth="1px" borderColor={borderColor} mb={8}>
        <CardBody>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <Box>
              <Text fontSize="xs" color={mutedText}>
                Current plan
              </Text>
              <Heading size="sm" mt={1}>
                Standard
              </Heading>
            </Box>
            <Badge colorScheme="green" variant="subtle">
              Active
            </Badge>
          </Flex>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {PLANS.map((plan) => (
          <Card key={plan.name} bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="sm">{plan.name}</Heading>
                <Badge colorScheme={plan.tone} variant="subtle">
                  Package
                </Badge>
              </Flex>
              <Text color={mutedText} fontSize="sm" mt={2}>
                {plan.description}
              </Text>
            </CardHeader>
            <CardBody>
              <Stack spacing={2}>
                {plan.highlights.map((item) => (
                  <Flex key={item} align="center" gap={2}>
                    <Box color="green.400">
                      <FiCheck />
                    </Box>
                    <Text fontSize="sm">{item}</Text>
                  </Flex>
                ))}
                <Button variant="outline" size="sm" mt={3}>
                  Select {plan.name}
                </Button>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default EmployerUpgradePackage;
