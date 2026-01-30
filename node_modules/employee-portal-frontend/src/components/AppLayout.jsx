import { Box, Drawer, DrawerCloseButton, DrawerContent, DrawerOverlay, Flex, useBreakpointValue, useDisclosure } from "@chakra-ui/react";
import NavbarPage from "./Navbar";
import Sidebar from "./Sidebar";
import { useState } from "react";

const AppLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const sidebarWidth = isMobile ? "0px" : isSidebarCollapsed ? "50px" : "200px";
  const contentWidth = isMobile ? "100%" : `calc(100% - ${sidebarWidth})`;
  const navbarHeight = useBreakpointValue({ base: "96px", sm: "72px", md: "52px" }) || "52px";

  return (
    <Flex direction="column" minHeight="100vh">
      <NavbarPage sidebarWidth={sidebarWidth} onOpenSidebar={onOpen} isMobile={isMobile} />

      <Flex flex="1" mt={navbarHeight}>
        {!isMobile && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            topOffset={navbarHeight}
          />
        )}

        <Drawer isOpen={isOpen} onClose={onClose} placement="left">
          <DrawerOverlay />
          <DrawerContent maxW="240px" w="100%">
            <DrawerCloseButton />
            <Sidebar
              isCollapsed={false}
              onToggleCollapse={onClose}
              isDrawer
            />
          </DrawerContent>
        </Drawer>

        <Box
          flex="1"
          ml={sidebarWidth}
          width={contentWidth}
          minWidth={0}
          transition="margin-left 0.3s"
          p={{ base: 3, md: 4 }}
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AppLayout;
