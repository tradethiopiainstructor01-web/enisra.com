import {
  Badge,
  Box,
  Button,
  Divider,
  HStack,
  Icon,
  IconButton,
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

  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedText = useColorModeValue('gray.600', 'gray.300');
  const activeBg = useColorModeValue('teal.50', 'teal.900');

  const navItems = [
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
      p={4}
      bg={bgColor}
      boxShadow="lg"
      borderRadius="lg"
      position="sticky"
      top="24px"
      height="fit-content"
    >
      <HStack justify="space-between" mb={3}>
        {collapsed ? null : (
          <Text fontWeight="bold" color={textColor}>
            Employee
          </Text>
        )}
        <IconButton
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          size="sm"
          variant="ghost"
          icon={<Icon as={collapsed ? FiChevronRight : FiChevronLeft} />}
          onClick={onToggleCollapsed}
        />
      </HStack>

      {!collapsed ? (
        <Box mb={4}>
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold" color={textColor}>
              {currentUser?.username || currentUser?.email || 'Employee'}
            </Text>
            {currentUser?.email ? (
              <Text fontSize="sm" color={mutedText}>
                {currentUser.email}
              </Text>
            ) : null}
            <HStack spacing={2} pt={1} flexWrap="wrap">
              <Badge colorScheme="teal">
                {currentUser?.displayRole || currentUser?.role || 'employee'}
              </Badge>
              {currentUser?.status ? (
                <Badge colorScheme={currentUser.status === 'active' ? 'green' : 'orange'}>
                  {currentUser.status}
                </Badge>
              ) : null}
            </HStack>
          </VStack>
        </Box>
      ) : null}

      <Divider mb={4} />

      <VStack spacing={2} align="stretch">
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
              leftIcon={<Icon as={item.icon} />}
              bg={active ? activeBg : 'transparent'}
              aria-label={item.label}
              px={collapsed ? 2 : 3}
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

      <Divider my={4} />

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
    </Box>
  );
};

export default EmployeeSidebar;
