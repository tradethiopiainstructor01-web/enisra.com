import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { FiBriefcase, FiFileText, FiLogOut, FiUser } from 'react-icons/fi';
import { useUserStore } from '../../store/user';

const EmployeeNavDrawer = ({ isOpen, onClose }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const navigate = useNavigate();
  const location = useLocation();

  const activeBg = useColorModeValue('teal.50', 'teal.900');
  const mutedText = useColorModeValue('gray.600', 'gray.300');

  const navItems = [
    { label: 'Profile', to: '/employee/profile', icon: FiUser },
    { label: 'Jobs', to: '/employee/jobs', icon: FiBriefcase },
    { label: 'Create CV', to: '/employee/create-cv', icon: FiFileText },
  ];

  const isActive = (to) => location.pathname.toLowerCase().startsWith(to.toLowerCase());

  const handleLogout = () => {
    clearUser();
    onClose?.();
    navigate('/login');
  };

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <Drawer isOpen={isOpen} placement="left" size="xs" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Employee Menu</DrawerHeader>

        <DrawerBody>
          <Box mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">
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

          <Divider mb={4} />

          <VStack spacing={2} align="stretch">
            {navItems.map((item) => (
              <Button
                key={item.to}
                as={RouterLink}
                to={item.to}
                size="sm"
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<Icon as={item.icon} />}
                bg={isActive(item.to) ? activeBg : 'transparent'}
                onClick={handleNavClick}
              >
                {item.label}
              </Button>
            ))}
          </VStack>
        </DrawerBody>

        <DrawerFooter>
          <Button
            width="full"
            colorScheme="teal"
            leftIcon={<Icon as={FiLogOut} />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EmployeeNavDrawer;
