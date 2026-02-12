import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
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
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiLogOut,
  FiMenu,
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
  category: "",
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isDesktop = useBreakpointValue({ base: false, lg: true }) || false;
  const showSidebarLabels = !isSidebarCollapsed;
  const sidebarWidth = isSidebarCollapsed ? "72px" : "240px";

  const pageBg = useColorModeValue(
    "linear-gradient(180deg, #FAFCFB 0%, #F3F7F4 55%, #F7FAFF 100%)",
    "linear-gradient(180deg, #0B1220 0%, #0A0F1B 55%, #090B12 100%)"
  );
  const sidebarBg = useColorModeValue("white", "gray.800");
  const sidebarBorder = useColorModeValue("gray.200", "gray.700");
  const sidebarHover = useColorModeValue("gray.100", "gray.700");
  const sidebarActiveBg = useColorModeValue("green.50", "green.900");
  const sidebarActiveColor = useColorModeValue("green.700", "green.200");
  const sidebarIconColor = useColorModeValue("gray.600", "gray.300");
  const mutedText = useColorModeValue("gray.500", "gray.300");
  const sidebarAccent = useColorModeValue("green.600", "green.300");
  const sidebarShadow = useColorModeValue("xl", "dark-lg");
  const mobileTopBg = useColorModeValue("whiteAlpha.900", "blackAlpha.600");
  const sidebarHeaderGradient = useColorModeValue(
    "linear(to-br, green.500, teal.500)",
    "linear(to-br, green.600, teal.600)"
  );
  const accountStatusBg = useColorModeValue("green.50", "gray.700");

  const currentSectionLabel = useMemo(() => {
    const match = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to));
    return match?.label || "Dashboard";
  }, [location.pathname]);

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
    <Box bg={pageBg} minH="100vh">
      {!isDesktop ? (
        <Flex
          position="sticky"
          top={0}
          zIndex={20}
          bg={mobileTopBg}
          backdropFilter="blur(10px)"
          borderBottom="1px solid"
          borderColor={sidebarBorder}
          px={3}
          py={2}
          align="center"
          justify="space-between"
        >
          <HStack spacing={2} minW={0}>
            <IconButton
              aria-label="Open menu"
              icon={<FiMenu />}
              variant="outline"
              size="sm"
              onClick={onOpen}
            />
            <Box minW={0}>
              <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                Employer Hub
              </Text>
              <Text fontSize="xs" color={mutedText} noOfLines={1}>
                {currentSectionLabel}
              </Text>
            </Box>
          </HStack>

          <IconButton
            aria-label="Logout"
            icon={<FiLogOut />}
            variant="ghost"
            size="sm"
            onClick={handleLogout}
          />
        </Flex>
      ) : null}

      <Flex direction={{ base: "column", lg: "row" }} align="stretch">
        {isDesktop ? (
          <Box
            as="aside"
            bg={sidebarBg}
            borderRight="1px solid"
            borderColor={sidebarBorder}
            width={sidebarWidth}
            transition="width 0.2s ease"
            position="sticky"
            top="0"
            minH="100vh"
            zIndex="1"
            boxShadow={sidebarShadow}
            borderRadius="2xl"
            mx={4}
            my={6}
            overflow="hidden"
          >
            <Flex direction="column" minH="100%">
              <Box
                bgGradient={sidebarHeaderGradient}
                color="white"
                px={4}
                py={4}
              >
                <Flex align="center" justify={showSidebarLabels ? "space-between" : "center"}>
                  <HStack spacing={3}>
                    <Avatar size="sm" bg="whiteAlpha.300" icon={<FiBriefcase />} />
                    {showSidebarLabels ? (
                      <Stack spacing={0}>
                        <Text fontWeight="bold" fontSize="sm">
                          Employer Hub
                        </Text>
                        <Text fontSize="xs" opacity={0.85}>
                          Manage company access
                        </Text>
                      </Stack>
                    ) : null}
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
                        borderLeftWidth="3px"
                        borderLeftColor={isActive ? sidebarAccent : "transparent"}
                        _hover={{
                          bg: isActive ? sidebarActiveBg : sidebarHover,
                          transform: "translateX(2px)",
                        }}
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
                        {showSidebarLabels ? item.label : null}
                      </Button>
                    </Tooltip>
                  );
                })}
              </VStack>

              <Box mt="auto" px={2} pb={4}>
                <Divider mb={3} borderColor={sidebarBorder} />
                {showSidebarLabels ? (
                  <Box
                    bg={accountStatusBg}
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
                ) : null}
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
                    {showSidebarLabels ? "Logout" : null}
                  </Button>
                </Tooltip>
              </Box>
            </Flex>
          </Box>
        ) : null}

        <Box flex="1" py={{ base: 4, lg: 12 }} px={{ base: 3, md: 6 }}>
          <Outlet />
        </Box>
      </Flex>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={sidebarBg}>
          <DrawerCloseButton />
          <DrawerHeader>Employer Hub</DrawerHeader>
          <DrawerBody>
            <Stack spacing={2}>
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                const isRestricted = !isEmployerDetailsComplete && item.to !== "/employer/profile";
                return (
                  <Button
                    key={`drawer-${item.to}`}
                    as={isRestricted ? "button" : RouterLink}
                    to={isRestricted ? undefined : item.to}
                    leftIcon={<Icon as={item.icon} />}
                    variant={isActive ? "solid" : "ghost"}
                    colorScheme={isActive ? "green" : "gray"}
                    justifyContent="flex-start"
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
                        return;
                      }
                      onClose();
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}

              <Divider />
              <Button
                leftIcon={<Icon as={FiLogOut} />}
                variant="ghost"
                justifyContent="flex-start"
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
              >
                Logout
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default EmployerLayout;
