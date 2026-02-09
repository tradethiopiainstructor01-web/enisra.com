import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
  VStack,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiLogOut,
  FiStar,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/user";
import apiClient from "../../utils/apiClient";

const NAV_ITEMS = [
  { label: "Profile", icon: FiUser, to: "/employer/profile" },
  { label: "Post", icon: FiClipboard, to: "/employer/post" },
  { label: "Promotion", icon: FiTrendingUp, to: "/employer/promotion" },
  { label: "Upgrade Package", icon: FiStar, to: "/employer/upgrade" },
  { label: "Employee List", icon: FiUsers, to: "/employer/employees" },
];

const defaultEmployerDetails = {
  employerId: "",
  companyName: "",
  industry: "",
  companyLocation: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  packageType: "",
  jobPostingCredits: "",
  contractEndDate: "",
};

const EmployerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const clearUser = useUserStore((state) => state.clearUser);
  const currentUser = useUserStore((state) => state.currentUser);
  const toast = useToast();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [employerDetails, setEmployerDetails] = useState(() => defaultEmployerDetails);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const showSidebarLabels = isMobile || !isSidebarCollapsed;
  const sidebarWidth = isSidebarCollapsed ? "72px" : "240px";

  const bg = useColorModeValue("gray.50", "gray.900");
  const sidebarBg = useColorModeValue("white", "gray.800");
  const sidebarBorder = useColorModeValue("gray.200", "gray.700");
  const sidebarHover = useColorModeValue("gray.100", "gray.700");
  const sidebarActiveBg = useColorModeValue("green.50", "green.900");
  const sidebarActiveColor = useColorModeValue("green.700", "green.200");
  const sidebarIconColor = useColorModeValue("gray.600", "gray.300");
  const mutedText = useColorModeValue("gray.500", "gray.300");
  const sidebarAccent = useColorModeValue("green.600", "green.300");
  const sidebarShadow = useColorModeValue("xl", "dark-lg");

  const isEmployerDetailsComplete = useMemo(() => {
    return Object.values(employerDetails).every((value) =>
      String(value ?? "").trim()
    );
  }, [employerDetails]);

  const fetchEmployerDetails = useCallback(async (signal) => {
    if (!currentUser?.token) {
      setDetailsLoading(false);
      return;
    }
    try {
      setDetailsLoading(true);
      const response = await apiClient.get("/employer-details/me", {
        signal,
      });
      const payload = response?.data?.data;
      if (payload) {
        setEmployerDetails({
          ...defaultEmployerDetails,
          ...payload,
          contractEndDate: payload.contractEndDate
            ? payload.contractEndDate.toString().split("T")[0]
            : "",
        });
      }
    } catch (error) {
      if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;
      if (error?.response?.status !== 404) {
        toast({
          title: "Failed to load employer details",
          description: error?.message || "Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setDetailsLoading(false);
    }
  }, [currentUser?.token, toast]);

  useEffect(() => {
    const controller = new AbortController();
    fetchEmployerDetails(controller.signal);
    return () => controller.abort();
  }, [fetchEmployerDetails]);

  useEffect(() => {
    const handleRefresh = () => fetchEmployerDetails();
    window.addEventListener("employer-details-updated", handleRefresh);
    return () => {
      window.removeEventListener("employer-details-updated", handleRefresh);
    };
  }, [fetchEmployerDetails]);

  useEffect(() => {
    if (detailsLoading) return;
    if (isEmployerDetailsComplete) return;
    if (location.pathname !== "/employer/profile") {
      navigate("/employer/profile", { replace: true });
    }
  }, [detailsLoading, isEmployerDetailsComplete, location.pathname, navigate]);


  const handleLogout = () => {
    if (typeof clearUser === "function") {
      clearUser();
    }
    navigate("/");
  };

  return (
    <Box bg={bg} minH="100vh">
      <Flex direction={{ base: "column", md: "row" }} align="stretch">
        <Box
          as="aside"
          bg={sidebarBg}
          borderRight={{ base: "none", md: "1px solid" }}
          borderColor={sidebarBorder}
          width={{ base: "100%", md: sidebarWidth }}
          transition="width 0.2s ease"
          position={{ base: "static", md: "sticky" }}
          top="0"
          minH={{ base: "auto", md: "100vh" }}
          zIndex="1"
          boxShadow={{ base: "none", md: sidebarShadow }}
          borderRadius={{ base: "0", md: "2xl" }}
          mx={{ base: 0, md: 4 }}
          my={{ base: 0, md: 6 }}
          overflow="hidden"
        >
          <Flex direction="column" minH={{ base: "auto", md: "100%" }}>
            <Box
              bgGradient={useColorModeValue(
                "linear(to-br, green.500, teal.500)",
                "linear(to-br, green.600, teal.600)"
              )}
              color="white"
              px={4}
              py={4}
            >
              <Flex align="center" justify={showSidebarLabels ? "space-between" : "center"}>
                <HStack spacing={3}>
                  <Avatar size="sm" bg="whiteAlpha.300" icon={<FiBriefcase />} />
                  {showSidebarLabels && (
                    <Stack spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">
                        Employer Hub
                      </Text>
                      <Text fontSize="xs" opacity={0.85}>
                        Manage company access
                      </Text>
                    </Stack>
                  )}
                </HStack>
                <IconButton
                  aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  icon={isSidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                  size="sm"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                />
              </Flex>
            </Box>

            <VStack spacing={1} px={3} py={4} align="stretch">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                const isRestricted = !isEmployerDetailsComplete && item.to !== "/employer/profile";
                return (
                  <Tooltip
                    key={item.to}
                    label={item.label}
                    placement="right"
                    isDisabled={showSidebarLabels}
                  >
                    <Button
                      as={isRestricted ? "button" : RouterLink}
                      to={isRestricted ? undefined : item.to}
                      variant="ghost"
                      justifyContent={showSidebarLabels ? "flex-start" : "center"}
                      leftIcon={<Icon as={item.icon} boxSize={5} />}
                      iconSpacing={showSidebarLabels ? 3 : 0}
                      color={isActive ? sidebarActiveColor : sidebarIconColor}
                      bg={isActive ? sidebarActiveBg : "transparent"}
                      borderLeftWidth={isActive ? "3px" : "3px"}
                      borderLeftColor={isActive ? sidebarAccent : "transparent"}
                      _hover={{ bg: isActive ? sidebarActiveBg : sidebarHover, transform: "translateX(2px)" }}
                      _active={{ bg: sidebarActiveBg }}
                      borderRadius="xl"
                      width="100%"
                      size="sm"
                      fontWeight={isActive ? "semibold" : "medium"}
                      aria-disabled={isRestricted}
                      opacity={isRestricted ? 0.6 : 1}
                      cursor={isRestricted ? "not-allowed" : "pointer"}
                      onClick={(event) => {
                        if (isRestricted) {
                          event.preventDefault();
                          toast({
                            title: "Complete employer details",
                            description: "Fill the employer form in your Profile page to unlock this section.",
                            status: "info",
                            duration: 3000,
                            isClosable: true,
                          });
                        }
                      }}
                    >
                      {showSidebarLabels && item.label}
                    </Button>
                  </Tooltip>
                );
              })}
            </VStack>

            <Box mt={{ base: 0, md: "auto" }} px={2} pb={4}>
              <Divider mb={3} borderColor={sidebarBorder} />
              {showSidebarLabels && (
                <Box
                  bg={useColorModeValue("green.50", "gray.700")}
                  borderRadius="xl"
                  px={3}
                  py={3}
                  mb={3}
                >
                  <HStack justify="space-between" align="center">
                    <Text fontSize="xs" color={mutedText}>
                      Account status
                    </Text>
                    <Badge colorScheme="green" variant="subtle">
                      Active
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color={mutedText} mt={2}>
                    Keep listings and employee records updated.
                  </Text>
                </Box>
              )}
              <Tooltip label="Logout" placement="right" isDisabled={showSidebarLabels}>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  justifyContent={showSidebarLabels ? "flex-start" : "center"}
                  leftIcon={<Icon as={FiLogOut} boxSize={5} />}
                  iconSpacing={showSidebarLabels ? 3 : 0}
                  color={sidebarIconColor}
                  _hover={{ bg: sidebarHover }}
                  borderRadius="xl"
                  width="100%"
                  size="sm"
                >
                  {showSidebarLabels && "Logout"}
                </Button>
              </Tooltip>
            </Box>
          </Flex>
        </Box>
        <Box flex="1" py={{ base: 8, lg: 12 }} px={{ base: 4, md: 6 }}>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  );
};

export default EmployerLayout;
