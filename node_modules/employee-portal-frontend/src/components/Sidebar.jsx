import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  IconButton,
  VStack,
  Link,
  Text,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FiFolder, FiMenu, FiUsers, FiBookOpen, FiSearch, FiBriefcase, FiBarChart } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { FiFileText } from 'react-icons/fi';
const Sidebar = ({ isCollapsed: controlledIsCollapsed, onToggleCollapse, isDrawer = false, topOffset = "52px", isTablet = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const breakpointValue = useBreakpointValue({ base: true, md: false });
  
  // Use controlled prop if provided, otherwise use internal state
  const effectiveIsCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : isCollapsed;

  useEffect(() => {
    // Only set initial collapse state if not controlled by parent
    if (controlledIsCollapsed === undefined) {
      setIsCollapsed(breakpointValue);
    }
  }, [breakpointValue, controlledIsCollapsed]);

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setIsCollapsed((prevState) => !prevState);
    }
  };

  return (
    <Box
      as="nav"
      width={isDrawer ? "100%" : effectiveIsCollapsed ? "60px" : isTablet ? "240px" : "220px"}
      height={isDrawer ? "100%" : "100vh"}
      position={isDrawer ? "relative" : "fixed"}
      left={0}
      top={0}
      bg="gray.800"
      color="white"
      transition="width 0.3s ease"
      zIndex="999"
      paddingTop={isDrawer ? "56px" : topOffset}
      overflowY="auto"
      boxShadow={isDrawer ? "none" : "2px 0 10px rgba(0,0,0,0.1)"}
    >
      {/* Collapse Toggle Button */}
      {!isDrawer && (
        <Flex justify="flex-end" align="center" p={{ base: 3, md: 4 }}>
          <IconButton
            icon={<Icon as={FiMenu} boxSize={{ base: 4, md: 5 }} />}
            variant="ghost"
            color="white"
            onClick={toggleCollapse}
            aria-label="Toggle Sidebar"
            minW="44px"
            minH="44px"
            borderRadius="full"
            _hover={{ bg: "whiteAlpha.200" }}
            transition="all 0.2s"
          />
        </Flex>
      )}

      {/* Sidebar Links */}
      <VStack align="stretch" spacing={1} p={{ base: 1, md: 2 }}>
        {/* Account Management Link */}
        <Link as={RouterLink} to="/users" _hover={{ textDecoration: "none" }}>
          <Flex 
            align="center" 
            p={{ base: 2, md: 3 }} 
            borderRadius="lg" 
            _hover={{ bg: "gray.700", transform: "translateX(4px)" }}
            transition="all 0.2s"
            minH="44px"
          >
            <Icon as={FiUsers} boxSize={{ base: 4, md: 5 }} />
            {!effectiveIsCollapsed && <Text ml={{ base: 3, md: 4 }} fontSize={{ base: "sm", md: "md" }} fontWeight="medium">Account Management</Text>}
          </Flex>
        </Link>

        {/* Asset Management Link */}
        <Link as={RouterLink} to="/assets" _hover={{ textDecoration: "none" }}>
          <Flex 
            align="center" 
            p={{ base: 2, md: 3 }} 
            borderRadius="lg" 
            _hover={{ bg: "gray.700", transform: "translateX(4px)" }}
            transition="all 0.2s"
            minH="44px"
          >
            <Icon as={FiBriefcase} boxSize={{ base: 4, md: 5 }} />
            {!effectiveIsCollapsed && <Text ml={{ base: 3, md: 4 }} fontSize={{ base: "sm", md: "md" }} fontWeight="medium">Asset Management</Text>}
          </Flex>
        </Link>

        {/* Company Documents Link */}
        <Link as={RouterLink} to="/documentlist" _hover={{ textDecoration: "none" }}>
          <Flex 
            align="center" 
            p={{ base: 2, md: 3 }} 
            borderRadius="lg" 
            _hover={{ bg: "gray.700", transform: "translateX(4px)" }}
            transition="all 0.2s"
            minH="44px"
          >
            <Icon as={FiBookOpen} boxSize={{ base: 4, md: 5 }} />
            {!effectiveIsCollapsed && <Text ml={{ base: 3, md: 4 }} fontSize={{ base: "sm", md: "md" }} fontWeight="medium">Company Documents</Text>}
          </Flex>
        </Link>

        {/* Employee Document Link */}
        <Link as={RouterLink} to="/EmployeeDocument" _hover={{ textDecoration: "none" }}>
          <Flex 
            align="center" 
            p={{ base: 2, md: 3 }} 
            borderRadius="lg" 
            _hover={{ bg: "gray.700", transform: "translateX(4px)" }}
            transition="all 0.2s"
            minH="44px"
          >
            <Icon as={FiFolder} boxSize={{ base: 4, md: 5 }} />
            {!effectiveIsCollapsed && <Text ml={{ base: 3, md: 4 }} fontSize={{ base: "sm", md: "md" }} fontWeight="medium">Employee Document</Text>}
          </Flex>
        </Link>

        {/* Quiz Center Link */}
        <Link as={RouterLink} to="/quiz" _hover={{ textDecoration: "none" }}>
          <Flex 
            align="center" 
            p={{ base: 2, md: 3 }} 
            borderRadius="lg" 
            _hover={{ bg: "gray.700", transform: "translateX(4px)" }}
            transition="all 0.2s"
            minH="44px"
          >
            <Icon as={FiSearch} boxSize={{ base: 4, md: 5 }} />
            {!effectiveIsCollapsed && <Text ml={{ base: 3, md: 4 }} fontSize={{ base: "sm", md: "md" }} fontWeight="medium">Quiz Center</Text>}
          </Flex>
        </Link>


        {/* Training Tab */}
        <Link as={RouterLink} to="/admin-training-upload" _hover={{ textDecoration: "none" }}>
          <Flex 
            align="center" 
            p={{ base: 2, md: 3 }} 
            borderRadius="lg" 
            _hover={{ bg: "gray.700", transform: "translateX(4px)" }}
            transition="all 0.2s"
            minH="44px"
          >
            <Icon as={FiBookOpen} boxSize={{ base: 4, md: 5 }} />
            {!effectiveIsCollapsed && <Text ml={{ base: 3, md: 4 }} fontSize={{ base: "sm", md: "md" }} fontWeight="medium">Training</Text>}
          </Flex>
        </Link>

        {/* Awards Link */}
        <Link as={RouterLink} to="/awards" _hover={{ textDecoration: "none" }}>
          <Flex 
            align="center" 
            p={{ base: 2, md: 3 }} 
            borderRadius="lg" 
            _hover={{ bg: "gray.700", transform: "translateX(4px)" }}
            transition="all 0.2s"
            minH="44px"
          >
            <Icon as={FiBarChart} boxSize={{ base: 4, md: 5 }} />
            {!effectiveIsCollapsed && <Text ml={{ base: 3, md: 4 }} fontSize={{ base: "sm", md: "md" }} fontWeight="medium">Awards</Text>}
          </Flex>
        </Link>
      
        {/* Notes Board Link */}
        <Link as={RouterLink} to="/messages" _hover={{ textDecoration: "none" }}>
          <Flex 
            align="center" 
            p={{ base: 2, md: 3 }} 
            borderRadius="lg" 
            _hover={{ bg: "gray.700", transform: "translateX(4px)" }}
            transition="all 0.2s"
            minH="44px"
          >
            <Icon as={FiFileText} boxSize={{ base: 4, md: 5 }} />
            {!effectiveIsCollapsed && <Text ml={{ base: 3, md: 4 }} fontSize={{ base: "sm", md: "md" }} fontWeight="medium">Notes Board</Text>}
          </Flex>
        </Link>
      </VStack>
    </Box>
  );
};

export default Sidebar;
