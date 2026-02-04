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
import { FiArrowUpRight, FiCheckCircle } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";

const PROMO_PACKAGES = [
  {
    title: "Featured listing",
    description: "Pin a job to the top of search results for more qualified leads.",
    tone: "green",
    features: ["Priority placement", "Featured badge", "Weekly performance recap"],
  },
  {
    title: "Social spotlight",
    description: "Share your role across social channels with branded assets.",
    tone: "teal",
    features: ["Branded creatives", "Social scheduling", "Audience boost"],
  },
  {
    title: "Talent outreach",
    description: "Send targeted outreach to the talent pool you need most.",
    tone: "purple",
    features: ["Curated shortlist", "Email outreach", "Response tracking"],
  },
];

const EmployerPromotion = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const highlightBg = useColorModeValue("green.50", "green.900");

  return (
    <Box maxW="7xl" mx="auto">
      <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={6}>
        <Box>
          <Heading size="lg">Promotion</Heading>
          <Text color={mutedText} mt={1}>
            Boost visibility for your openings with curated promotion packages.
          </Text>
        </Box>
        <Button
          as={RouterLink}
          to="/employer/post"
          colorScheme="green"
          rightIcon={<FiArrowUpRight />}
        >
          Post a new job
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {PROMO_PACKAGES.map((item) => (
          <Card key={item.title} bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="sm">{item.title}</Heading>
                <Badge colorScheme={item.tone} variant="subtle">
                  Recommended
                </Badge>
              </Flex>
              <Text color={mutedText} fontSize="sm" mt={2}>
                {item.description}
              </Text>
            </CardHeader>
            <CardBody>
              <Stack spacing={2}>
                {item.features.map((feature) => (
                  <Flex key={feature} align="center" gap={2}>
                    <Box color="green.400">
                      <FiCheckCircle />
                    </Box>
                    <Text fontSize="sm">{feature}</Text>
                  </Flex>
                ))}
                <Button variant="outline" size="sm" mt={3}>
                  Request this package
                </Button>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        mt={8}
        boxShadow="md"
      >
        <CardHeader>
          <Heading size="sm">Promotion status</Heading>
          <Text color={mutedText} mt={1}>
            Track what is active and what is ready to launch.
          </Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Box bg={highlightBg} borderRadius="lg" p={4}>
              <Text fontSize="xs" color={mutedText}>
                Active promotion
              </Text>
              <Heading size="sm" mt={2}>
                No active boosts
              </Heading>
              <Text fontSize="sm" color={mutedText} mt={1}>
                Start a promotion to increase reach.
              </Text>
            </Box>
            <Box bg={highlightBg} borderRadius="lg" p={4}>
              <Text fontSize="xs" color={mutedText}>
                Pending approval
              </Text>
              <Heading size="sm" mt={2}>
                0 requests
              </Heading>
              <Text fontSize="sm" color={mutedText} mt={1}>
                Submitted promotions appear here.
              </Text>
            </Box>
            <Box bg={highlightBg} borderRadius="lg" p={4}>
              <Text fontSize="xs" color={mutedText}>
                Next launch window
              </Text>
              <Heading size="sm" mt={2}>
                Within 24 hours
              </Heading>
              <Text fontSize="sm" color={mutedText} mt={1}>
                Promotions launch quickly once approved.
              </Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default EmployerPromotion;
