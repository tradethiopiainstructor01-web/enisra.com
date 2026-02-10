import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Text,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Outlet, useLocation } from 'react-router-dom';
import EmployeeNavDrawer from '../../components/employee/EmployeeNavDrawer';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';

const EmployeeLayout = () => {
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isDesktop = useBreakpointValue({ base: false, lg: true }) || false;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('employeeSidebarCollapsed') === '1'
  );

  useEffect(() => {
    localStorage.setItem('employeeSidebarCollapsed', sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  const bgGradient = useColorModeValue(
    'linear(to-br, gray.50, teal.50)',
    'linear(to-br, gray.900, teal.900)'
  );
  const mutedText = useColorModeValue('gray.600', 'gray.300');
  const brandText = useColorModeValue('teal.700', 'teal.200');

  const pageTitle = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/employee/jobs')) return 'Jobs';
    if (path.includes('/employee/create-cv')) return 'Create CV';
    return 'Profile';
  }, [location.pathname]);

  return (
    <Box bgGradient={bgGradient} minH="100vh">
      <Flex
        maxW="7xl"
        mx="auto"
        direction={{ base: 'column', lg: 'row' }}
        gap={{ base: 0, lg: 6 }}
        px={{ base: 3, md: 5 }}
        py={{ base: 4, lg: 6 }}
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
          <HStack justify="space-between" mb={6} align="center">
            <HStack spacing={3}>
              {!isDesktop ? (
                <IconButton
                  aria-label="Open menu"
                  icon={<HamburgerIcon />}
                  onClick={onOpen}
                  colorScheme="teal"
                />
              ) : null}
              <Box>
                <HStack spacing={2}>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color={brandText}
                  >
                    ENISRA
                  </Text>
                  <Text fontWeight="bold" fontSize="lg">
                    Employee Dashboard
                  </Text>
                </HStack>
                <Text fontSize="sm" color={mutedText}>
                  {pageTitle}
                </Text>
              </Box>
            </HStack>

            <IconButton
              aria-label="Toggle theme"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              variant="ghost"
              onClick={toggleColorMode}
            />
          </HStack>

          <Outlet />
        </Box>
      </Flex>
    </Box>
  );
};

export default EmployeeLayout;
