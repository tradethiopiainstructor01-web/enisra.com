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
  Tooltip,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiLogOut,
  FiUser,
} from 'react-icons/fi';
import { useUserStore } from '../../store/user';

const EmployeeSidebar = ({ collapsed, onToggleCollapsed }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const navigate = useNavigate();
  const location = useLocation();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedText = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('teal.50', 'teal.900');
  const activeBorder = useColorModeValue('teal.500', 'teal.300');
  const headerGradient = useColorModeValue(
    'linear(to-br, teal.500, cyan.500)',
    'linear(to-br, teal.600, cyan.600)'
  );

  const displayName = currentUser?.username || currentUser?.email || 'Employee';
  const roleLabel = currentUser?.displayRole || currentUser?.role || 'employee';

  const navItems = [
    { label: 'Dashboard', to: '/employee/dashboard', icon: FiUser },
    { label: 'Profile', to: '/employee/profile', icon: FiUser },
    { label: 'Jobs', to: '/employee/jobs', icon: FiBriefcase },
    { label: 'Create CV', to: '/employee/create-cv', icon: FiFileText },
  ];

  const isActive = (to) => location.pathname.toLowerCase().startsWith(to.toLowerCase());

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const width = collapsed ? '76px' : '260px';

  return (
    <Box
      width={width}
      minW={width}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="xl"
      borderRadius="2xl"
      position="sticky"
      top="24px"
      maxH="calc(100vh - 48px)"
      overflow="hidden"
      transition="width 0.2s ease"
    >
      <Flex direction="column" height="100%">
        <Box bgGradient={headerGradient} color="white" px={4} py={4}>
          <HStack justify={collapsed ? 'center' : 'space-between'} align="center">
            <HStack spacing={3}>
              <Avatar
                size="sm"
                name={displayName}
                bg="whiteAlpha.300"
              />
              {collapsed ? null : (
                <Stack spacing={0}>
                  <Text fontWeight="bold" fontSize="sm">
                    ENISRA
                  </Text>
                  <Text fontSize="xs" opacity={0.85}>
                    Employee Portal
                  </Text>
                </Stack>
              )}
            </HStack>
          </HStack>

          {collapsed ? null : (
            <Box mt={4}>
              <Text fontWeight="semibold" fontSize="sm">
                {displayName}
              </Text>
              {currentUser?.email ? (
                <Text fontSize="xs" opacity={0.9}>
                  {currentUser.email}
                </Text>
              ) : null}
              <HStack spacing={2} mt={2} flexWrap="wrap">
                <Badge
                  bg="whiteAlpha.200"
                  color="white"
                  borderWidth="1px"
                  borderColor="whiteAlpha.300"
                  borderRadius="full"
                >
                  {roleLabel}
                </Badge>
                {currentUser?.status ? (
                  <Badge
                    bg="whiteAlpha.200"
                    color="white"
                    borderWidth="1px"
                    borderColor="whiteAlpha.300"
                    borderRadius="full"
                  >
                    {currentUser.status}
                  </Badge>
                ) : null}
              </HStack>
            </Box>
          )}
        </Box>

        <Box px={3} py={4}>
          <VStack spacing={1} align="stretch">
            {navItems.map((item) => {
              const active = isActive(item.to);
              const button = (
                <Button
                  key={item.to}
                  as={RouterLink}
                  to={item.to}
                  size="sm"
                  variant="ghost"
                  justifyContent={collapsed ? 'center' : 'flex-start'}
                  leftIcon={<Icon as={item.icon} boxSize={5} />}
                  iconSpacing={collapsed ? 0 : 3}
                  bg={active ? activeBg : 'transparent'}
                  borderLeftWidth="3px"
                  borderLeftColor={active ? activeBorder : 'transparent'}
                  borderRadius="xl"
                  px={collapsed ? 2 : 3}
                  aria-current={active ? 'page' : undefined}
                  aria-label={item.label}
                  _hover={{ bg: active ? activeBg : hoverBg, transform: 'translateX(2px)' }}
                  _active={{ bg: activeBg }}
                >
                  {collapsed ? null : item.label}
                </Button>
              );

              if (!collapsed) return button;
              return (
                <Tooltip key={item.to} label={item.label} placement="right">
                  {button}
                </Tooltip>
              );
            })}
          </VStack>
        </Box>

        <Box mt="auto" px={3} pb={4}>
          <Divider mb={3} borderColor={borderColor} />

          <VStack spacing={2} align="stretch">
            {collapsed ? (
              <Tooltip label="Logout" placement="right">
                <IconButton
                  aria-label="Logout"
                  width="full"
                  colorScheme="teal"
                  variant="solid"
                  icon={<Icon as={FiLogOut} />}
                  onClick={handleLogout}
                />
              </Tooltip>
            ) : (
              <Button
                width="full"
                colorScheme="teal"
                leftIcon={<Icon as={FiLogOut} />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            )}

            <Tooltip
              label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              placement="right"
            >
              <IconButton
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                width="full"
                size="sm"
                variant="outline"
                icon={<Icon as={collapsed ? FiChevronRight : FiChevronLeft} />}
                onClick={onToggleCollapsed}
              />
            </Tooltip>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default EmployeeSidebar;
