import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { MoonIcon, RepeatIcon, SunIcon } from "@chakra-ui/icons";
import { FiArrowRight, FiFileText, FiFolder, FiMessageSquare } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import { useUserStore } from "../store/user";
import KpiCards from "../components/kpiCards";
import NotesLauncher from "../components/notes/NotesLauncher";

const safeArray = (payload) => (Array.isArray(payload) ? payload : []);

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
};

const PRIORITY_META = {
  critical: { label: "Critical", color: "red" },
  high: { label: "High", color: "orange" },
  medium: { label: "Medium", color: "yellow" },
  low: { label: "Low", color: "gray" },
};

const STATUS_META = {
  open: { label: "Open", color: "orange" },
  "in-progress": { label: "In progress", color: "blue" },
  review: { label: "Review", color: "purple" },
  completed: { label: "Completed", color: "green" },
};

const normalizeText = (value) => (value ? value.toString().trim() : "");

const COODashboard = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const { colorMode, toggleColorMode } = useColorMode();

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");

  const [actionItems, setActionItems] = useState([]);
  const [loadingActionItems, setLoadingActionItems] = useState(false);

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const loadActionItems = useCallback(async () => {
    setLoadingActionItems(true);
    try {
      const response = await apiClient.get("/action-items");
      const items = safeArray(response.data?.data);
      setActionItems(items);
    } catch (error) {
      console.error("Failed to load action items", error);
      setActionItems([]);
      toast({
        title: "Unable to load action items",
        description: error.message || "Please try again later.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setLoadingActionItems(false);
    }
  }, [toast]);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const response = await apiClient.get("/requests");
      const items = safeArray(response.data?.data);
      setRequests(items);
    } catch (error) {
      console.error("Failed to load requests", error);
      setRequests([]);
      toast({
        title: "Unable to load requests",
        description: error.message || "Please try again later.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setLoadingRequests(false);
    }
  }, [toast]);

  const handleRefresh = useCallback(() => {
    loadActionItems();
    loadRequests();
  }, [loadActionItems, loadRequests]);

  useEffect(() => {
    if (!currentUser?.token) return;
    handleRefresh();
  }, [currentUser?.token, handleRefresh]);

  const requestSummary = useMemo(() => {
    const total = requests.length;
    const byStatus = requests.reduce((acc, req) => {
      const key = normalizeText(req.status || "Pending").toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const open = total - (byStatus.completed || 0);
    const high = requests.filter((req) => normalizeText(req.priority).toLowerCase() === "high").length;

    return {
      total,
      open,
      high,
      completed: byStatus.completed || 0,
      approved: byStatus.approved || 0,
      pending: byStatus.pending || 0,
    };
  }, [requests]);

  const actionSummary = useMemo(() => {
    const total = actionItems.length;
    const open = actionItems.filter((item) => item.status !== "completed").length;
    const critical = actionItems.filter((item) => item.priority === "critical").length;
    return { total, open, critical };
  }, [actionItems]);

  if (!currentUser?.token) {
    return (
      <Center minH="100vh" bg={pageBg} px={6}>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} maxW="lg" w="100%">
          <CardHeader>
            <Heading size="md">COO Dashboard</Heading>
            <Text color={mutedText} mt={2}>
              Please sign in to access the operations dashboard.
            </Text>
          </CardHeader>
          <CardBody>
            <Button colorScheme="teal" onClick={() => navigate("/login")}>
              Go to login
            </Button>
          </CardBody>
        </Card>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg} px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={3} mb={6}>
        <Box>
          <Heading size="lg">COO Dashboard</Heading>
          <Text color={mutedText} mt={1}>
            Requests, action items, and operational health.
          </Text>
        </Box>

        <HStack spacing={2}>
          <NotesLauncher
            buttonProps={{ size: "sm", variant: "outline", colorScheme: "teal" }}
            tooltipLabel="Notes"
          />
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            variant="outline"
            size="sm"
            onClick={toggleColorMode}
          />
          <Button
            leftIcon={<RepeatIcon />}
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={loadingActionItems || loadingRequests}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      <Box mb={6}>
        <KpiCards />
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={6}>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="sm">Quick links</Heading>
            <Text color={mutedText} fontSize="sm" mt={1}>
              Jump to common operational tools.
            </Text>
          </CardHeader>
          <CardBody>
            <Stack spacing={2}>
              <Button
                leftIcon={<Icon as={FiFileText} />}
                rightIcon={<FiArrowRight />}
                variant="outline"
                justifyContent="space-between"
                onClick={() => navigate("/requests")}
              >
                Requests
              </Button>
              <Button
                leftIcon={<Icon as={FiFolder} />}
                rightIcon={<FiArrowRight />}
                variant="outline"
                justifyContent="space-between"
                onClick={() => navigate("/assets")}
              >
                Assets
              </Button>
              <Button
                leftIcon={<Icon as={FiMessageSquare} />}
                rightIcon={<FiArrowRight />}
                variant="outline"
                justifyContent="space-between"
                onClick={() => navigate("/messages")}
              >
                Notes board
              </Button>
            </Stack>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="sm">Requests snapshot</Heading>
            <Text color={mutedText} fontSize="sm" mt={1}>
              Live counts from the request system.
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={2} spacing={3}>
              <Box p={3} borderWidth="1px" borderColor={borderColor} borderRadius="md">
                <Text fontSize="xs" color={mutedText}>
                  Total
                </Text>
                <Heading size="md">{loadingRequests ? "..." : requestSummary.total}</Heading>
              </Box>
              <Box p={3} borderWidth="1px" borderColor={borderColor} borderRadius="md">
                <Text fontSize="xs" color={mutedText}>
                  Open
                </Text>
                <Heading size="md">{loadingRequests ? "..." : requestSummary.open}</Heading>
              </Box>
              <Box p={3} borderWidth="1px" borderColor={borderColor} borderRadius="md">
                <Text fontSize="xs" color={mutedText}>
                  High priority
                </Text>
                <Heading size="md">{loadingRequests ? "..." : requestSummary.high}</Heading>
              </Box>
              <Box p={3} borderWidth="1px" borderColor={borderColor} borderRadius="md">
                <Text fontSize="xs" color={mutedText}>
                  Completed
                </Text>
                <Heading size="md">{loadingRequests ? "..." : requestSummary.completed}</Heading>
              </Box>
            </SimpleGrid>
            <Divider my={4} />
            <Button colorScheme="teal" size="sm" onClick={() => navigate("/requests")}
              rightIcon={<FiArrowRight />}
            >
              Open requests
            </Button>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="sm">Action items</Heading>
            <Text color={mutedText} fontSize="sm" mt={1}>
              Prioritized view derived from requests.
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={2} spacing={3}>
              <Box p={3} borderWidth="1px" borderColor={borderColor} borderRadius="md">
                <Text fontSize="xs" color={mutedText}>
                  Total
                </Text>
                <Heading size="md">{loadingActionItems ? "..." : actionSummary.total}</Heading>
              </Box>
              <Box p={3} borderWidth="1px" borderColor={borderColor} borderRadius="md">
                <Text fontSize="xs" color={mutedText}>
                  Open
                </Text>
                <Heading size="md">{loadingActionItems ? "..." : actionSummary.open}</Heading>
              </Box>
              <Box p={3} borderWidth="1px" borderColor={borderColor} borderRadius="md" gridColumn="span 2">
                <Text fontSize="xs" color={mutedText}>
                  Critical
                </Text>
                <Heading size="md">{loadingActionItems ? "..." : actionSummary.critical}</Heading>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="sm">Top action items</Heading>
          <Text color={mutedText} fontSize="sm" mt={1}>
            Showing the next 12 items by priority and due date.
          </Text>
        </CardHeader>
        <CardBody>
          {loadingActionItems ? (
            <Stack spacing={3}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} height="44px" />
              ))}
            </Stack>
          ) : actionItems.length === 0 ? (
            <Text color={mutedText}>No action items found.</Text>
          ) : (
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Department</Th>
                    <Th>Priority</Th>
                    <Th>Status</Th>
                    <Th>Due</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {actionItems.slice(0, 12).map((item) => {
                    const priorityMeta = PRIORITY_META[item.priority] || PRIORITY_META.medium;
                    const statusMeta = STATUS_META[item.status] || STATUS_META.open;
                    return (
                      <Tr key={item.id || item.timestamp}>
                        <Td>
                          <Text fontWeight="semibold" noOfLines={1}>
                            {item.title || "Untitled"}
                          </Text>
                          {item.description ? (
                            <Text fontSize="xs" color={mutedText} noOfLines={1}>
                              {item.description}
                            </Text>
                          ) : null}
                        </Td>
                        <Td>
                          <Badge variant="subtle">{item.department || "-"}</Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={priorityMeta.color}>
                            {priorityMeta.label}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={statusMeta.color}>{statusMeta.label}</Badge>
                        </Td>
                        <Td>{formatDate(item.dueDate || item.timestamp)}</Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default COODashboard;