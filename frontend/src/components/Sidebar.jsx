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
const Sidebar = ({ isCollapsed: controlledIsCollapsed, onToggleCollapse, isDrawer = false, topOffset = "52px" }) => {
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
      width={isDrawer ? "100%" : effectiveIsCollapsed ? "50px" : "200px"}
      height={isDrawer ? "100%" : "100vh"}
      position={isDrawer ? "relative" : "fixed"}
      left={0}
      top={0}
      bg="gray.800"
      color="white"
      transition="width 0.3s"
      zIndex="1"
      paddingTop={isDrawer ? "56px" : topOffset}
      overflowY="auto"
    >
      {/* Collapse Toggle Button */}
      {!isDrawer && (
        <Flex justify="flex-end" align="center" p={4}>
          <IconButton
            icon={<Icon as={FiMenu} boxSize={4} />}
            variant="ghost"
            color="white"
            onClick={toggleCollapse}
            aria-label="Toggle Sidebar"
          />
        </Flex>
      )}

      {/* Sidebar Links */}
      <VStack align="start" spacing={1} p={1}>
        {/* Account Management Link */}
        <Link as={RouterLink} to="/users" _hover={{ textDecoration: "none" }}>
          <Flex align="center" p={1} borderRadius="md" _hover={{ bg: "gray.700" }}>
            <Icon as={FiUsers} boxSize={4} />
            {!effectiveIsCollapsed && <Text ml={3} fontSize="sm">Account Management</Text>}
          </Flex>
        </Link>

        {/* Asset Management Link */}
        <Link as={RouterLink} to="/assets" _hover={{ textDecoration: "none" }}>
          <Flex align="center" p={1} borderRadius="md" _hover={{ bg: "gray.700" }}>
            <Icon as={FiBriefcase} boxSize={4} />
            {!effectiveIsCollapsed && <Text ml={3} fontSize="sm">Asset Management</Text>}
          </Flex>
        </Link>

        {/* Company Documents Link */}
        <Link as={RouterLink} to="/documentlist" _hover={{ textDecoration: "none" }}>
          <Flex align="center" p={1} borderRadius="md" _hover={{ bg: "gray.700" }}>
            <Icon as={FiBookOpen} boxSize={4} />
            {!effectiveIsCollapsed && <Text ml={3} fontSize="sm">Company Documents</Text>}
          </Flex>
        </Link>

        {/* Employee Document Link */}
        <Link as={RouterLink} to="/EmployeeDocument" _hover={{ textDecoration: "none" }}>
          <Flex align="center" p={1} borderRadius="md" _hover={{ bg: "gray.700" }}>
            <Icon as={FiFolder} boxSize={4} />
            {!effectiveIsCollapsed && <Text ml={3} fontSize="sm">Employee Document</Text>}
          </Flex>
        </Link>

        {/* Quiz Center Link */}
        <Link as={RouterLink} to="/quiz" _hover={{ textDecoration: "none" }}>
          <Flex align="center" p={1} borderRadius="md" _hover={{ bg: "gray.700" }}>
            <Icon as={FiSearch} boxSize={4} />
            {!effectiveIsCollapsed && <Text ml={3} fontSize="sm">Quiz Center</Text>}
          </Flex>
        </Link>


        {/* Training Tab */}
        <Link as={RouterLink} to="/admin-training-upload" _hover={{ textDecoration: "none" }}>
          <Flex align="center" p={1} borderRadius="md" _hover={{ bg: "gray.700" }}>
            <Icon as={FiBookOpen} boxSize={4} />
            {!effectiveIsCollapsed && <Text ml={3} fontSize="sm">Training</Text>}
          </Flex>
        </Link>

        {/* Awards Link */}
        <Link as={RouterLink} to="/awards" _hover={{ textDecoration: "none" }}>
          <Flex align="center" p={1} borderRadius="md" _hover={{ bg: "gray.700" }}>
            <Icon as={FiBarChart} boxSize={4} />
            {!effectiveIsCollapsed && <Text ml={3} fontSize="sm">Awards</Text>}
          </Flex>
        </Link>
      
        {/* Notes Board Link */}
        <Link as={RouterLink} to="/messages" _hover={{ textDecoration: "none" }}>
          <Flex align="center" p={1} borderRadius="md" _hover={{ bg: "gray.700" }}>
            <Icon as={FiFileText} boxSize={4} />
            {!effectiveIsCollapsed && <Text ml={3} fontSize="sm">Notes Board</Text>}
          </Flex>
        </Link>
      </VStack>
    </Box>
  );
};

export default Sidebar;
