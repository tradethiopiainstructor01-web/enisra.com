import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import EmployeeNavDrawer from '../../components/employee/EmployeeNavDrawer';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';

const EmployeeLayout = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isDesktop = useBreakpointValue({ base: false, lg: true }) || false;

  const bgGradient = useColorModeValue(
    'linear(to-br, gray.50, teal.50)',
    'linear(to-br, gray.900, teal.900)'
  );

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('employeeSidebarCollapsed') === '1'
  );

  useEffect(() => {
    localStorage.setItem('employeeSidebarCollapsed', sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  const navBg = useColorModeValue('white', 'gray.800');
  const navBorder = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box bgGradient={bgGradient} minH="100vh">
      <Flex
        width="100%"
        direction={{ base: 'column', lg: 'row' }}
        gap={{ base: 0, lg: 6 }}
        px={{ base: 0, md: 0, lg: 0 }}
        pt={0}
        pb={0}
        align="stretch"
      >
        {isDesktop ? (
          <Box as="aside">
            <EmployeeSidebar
              collapsed={sidebarCollapsed}
              onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
            />
          </Box>
        ) : (
          <EmployeeNavDrawer isOpen={isOpen} onClose={onClose} />
        )}

        <Box flex="1" minW={0}>
          <Flex
            align="center"
            justify="space-between"
            bg={navBg}
            borderWidth="1px"
            borderColor={navBorder}
            borderRadius="lg"
            px={{ base: 3, md: 4 }}
            py={{ base: 2, md: 3 }}
            boxShadow="sm"
            gap={3}
            flexWrap="wrap"
            position="sticky"
            top="0"
            zIndex="banner"
            mb={6}
          >
            <HStack spacing={2}>
              <Button as={RouterLink} to="/" size="sm" variant="ghost">
                Home
              </Button>
              <Button as={RouterLink} to="/employee/jobs" size="sm" variant="ghost">
                Jobs
              </Button>
              <Button as={RouterLink} to="/employee/jobs" size="sm" variant="ghost">
                Scholarships
              </Button>
              <Button as={RouterLink} to="/" size="sm" colorScheme="teal" variant="solid">
                Free Trainings
              </Button>
            </HStack>

            <HStack spacing={2}>
              {!isDesktop ? (
                <IconButton
                  aria-label="Open menu"
                  icon={<HamburgerIcon />}
                  onClick={onOpen}
                  colorScheme="teal"
                />
              ) : null}
              <IconButton
                aria-label="Toggle theme"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                variant="ghost"
                onClick={toggleColorMode}
              />
            </HStack>
          </Flex>

          <Outlet />
        </Box>
      </Flex>
    </Box>
  );
};

export default EmployeeLayout;
