import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiClipboard, FiUser, FiUsers } from "react-icons/fi";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Profile", icon: FiUser, to: "/employer/profile" },
  { label: "Post", icon: FiClipboard, to: "/employer/post" },
  { label: "Employee", icon: FiUsers, to: "/employer/employees" },
];

const EmployerLayout = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
        >
          <Flex align="center" justify={showSidebarLabels ? "space-between" : "center"} p={4}>
            {showSidebarLabels && (
              <Text fontWeight="bold" fontSize="sm" color={mutedText}>
                Employer
              </Text>
            )}
            <IconButton
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              icon={isSidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
              size="sm"
              variant="ghost"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            />
          </Flex>
          <Stack spacing={1} px={2} pb={4}>
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Tooltip
                  key={item.to}
                  label={item.label}
                  placement="right"
                  isDisabled={showSidebarLabels}
                >
                  <Button
                    as={RouterLink}
                    to={item.to}
                    variant="ghost"
                    justifyContent={showSidebarLabels ? "flex-start" : "center"}
                    leftIcon={<Icon as={item.icon} boxSize={5} />}
                    iconSpacing={showSidebarLabels ? 3 : 0}
                    color={isActive ? sidebarActiveColor : sidebarIconColor}
                    bg={isActive ? sidebarActiveBg : "transparent"}
                    _hover={{ bg: isActive ? sidebarActiveBg : sidebarHover }}
                    _active={{ bg: sidebarActiveBg }}
                    width="100%"
                    size="sm"
                  >
                    {showSidebarLabels && item.label}
                  </Button>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>
        <Box flex="1" py={{ base: 8, lg: 12 }} px={{ base: 4, md: 6 }}>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  );
};

export default EmployerLayout;
