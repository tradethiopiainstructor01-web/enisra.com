import { Box, Drawer, DrawerCloseButton, DrawerContent, DrawerOverlay, Flex, useBreakpointValue, useDisclosure } from "@chakra-ui/react";
import NavbarPage from "./Navbar";
import Sidebar from "./Sidebar";
import { useState } from "react";

const AppLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, sm: true, md: false }) ?? false;
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false }) ?? false;

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const sidebarWidth = isMobile ? "0px" : isSidebarCollapsed ? "60px" : "220px";
  const contentWidth = isMobile ? "100%" : `calc(100% - ${sidebarWidth})`;
  const navbarHeight = useBreakpointValue({ 
    base: "60px", 
    sm: "65px", 
    md: "56px", 
    lg: "52px" 
  }) || "52px";

  return (
    <Flex direction="column" minHeight="100vh" bg="gray.50">
      <NavbarPage 
        sidebarWidth={sidebarWidth} 
        onOpenSidebar={onOpen} 
        isMobile={isMobile}
        navbarHeight={navbarHeight}
      />

      <Flex flex="1" mt={navbarHeight}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            topOffset={navbarHeight}
            isTablet={isTablet}
          />
        )}

        {/* Mobile/Tablet Drawer */}
        <Drawer 
          isOpen={isOpen} 
          onClose={onClose} 
          placement="left"
          size={isTablet ? "sm" : "xs"}
        >
          <DrawerOverlay bg="blackAlpha.300" />
          <DrawerContent maxW={isTablet ? "280px" : "240px"}>
            <DrawerCloseButton 
              size="lg" 
              mt={2} 
              mr={2}
              bg="gray.700"
              color="white"
              _hover={{ bg: "gray.600" }}
              borderRadius="full"
            />
            <Sidebar
              isCollapsed={false}
              onToggleCollapse={onClose}
              isDrawer
              topOffset="0"
            />
          </DrawerContent>
        </Drawer>

        <Box
          flex="1"
          ml={{ base: 0, md: sidebarWidth }}
          width={contentWidth}
          minWidth={0}
          transition="margin-left 0.3s ease"
          p={{ base: 2, sm: 3, md: 4 }}
          pb={{ base: 4, sm: 6, md: 8 }}
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AppLayout;
