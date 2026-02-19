import { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Tooltip,
  VStack,
  useColorModeValue,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiLogOut,
  FiUser,
  FiCamera,
} from 'react-icons/fi';
import { useUserStore } from '../../store/user';
import apiClient from '../../utils/apiClient';

const EmployeeSidebar = ({ collapsed, onToggleCollapsed }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('teal.50', 'teal.900');
  const activeBorder = useColorModeValue('teal.500', 'teal.300');
  const headerGradient = useColorModeValue(
    'linear(to-br, teal.500, cyan.500)',
    'linear(to-br, teal.600, cyan.600)'
  );

  const displayName = currentUser?.username || currentUser?.email || '';

  useEffect(() => {
    if (currentUser?.photoUrl) {
      setAvatarUrl(currentUser.photoUrl);
    } else {
      setAvatarUrl('');
    }
  }, [currentUser]);

  const triggerFilePick = () => {
    if (isUploading) return;
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAvatarKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerFilePick();
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser?._id) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('userId', currentUser._id);
      formData.append('photo', file);

      const response = await apiClient.post('/upload-info', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = response?.data?.user;
      const newPhotoUrl = updatedUser?.photoUrl || avatarUrl;
      setAvatarUrl(newPhotoUrl);

      setCurrentUser({
        ...currentUser,
        photo: updatedUser?.photo,
        photoUrl: newPhotoUrl,
        token: currentUser.token,
      });
      window.dispatchEvent(new Event('employee-profile-updated'));

      toast({
        title: 'Avatar updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Avatar upload failed:', error);
      const uploadMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Could not update avatar';
      toast({
        title: 'Upload failed',
        description: uploadMessage,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const navItems = [
    { label: 'Dashboard', to: '/employee/dashboard', icon: FiUser },
    { label: 'Profile', to: '/employee/profile', icon: FiUser },
    { label: 'Jobs', to: '/employee/jobs', icon: FiBriefcase },
    { label: 'All Jobs', to: '/employee/all-jobs', icon: FiBriefcase },
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
      borderRadius="0"
      position="sticky"
      top="0"
      height="100vh"
      overflow="hidden"
      transition="width 0.2s ease"
    >
      <Flex direction="column" height="100%">
        <Box bgGradient={headerGradient} color="white" px={4} py={4}>
          <HStack justify={collapsed ? 'center' : 'space-between'} align="center">
            <HStack spacing={3} align="center">
              <Tooltip label={isUploading ? 'Uploading...' : 'Click avatar to change photo'}>
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={triggerFilePick}
                  onKeyDown={handleAvatarKeyDown}
                  cursor={isUploading ? 'not-allowed' : 'pointer'}
                  aria-label="Change avatar image"
                  opacity={isUploading ? 0.7 : 1}
                >
                  <Avatar
                    size={collapsed ? 'md' : 'lg'}
                    name={displayName || 'Employee'}
                    src={avatarUrl || undefined}
                    bg="whiteAlpha.300"
                  />
                </Box>
              </Tooltip>
              {!collapsed && (
                <Button
                  size="xs"
                  leftIcon={isUploading ? <Spinner size="xs" /> : <Icon as={FiCamera} boxSize={4} />}
                  variant="outline"
                  colorScheme="whiteAlpha"
                  onClick={triggerFilePick}
                  isDisabled={isUploading}
                >
                  Change
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </HStack>
            {collapsed && (
              <Tooltip label="Change avatar" placement="left">
                <IconButton
                  aria-label="Change avatar"
                  icon={isUploading ? <Spinner size="sm" /> : <Icon as={FiCamera} />}
                  size="sm"
                  variant="ghost"
                  onClick={triggerFilePick}
                  isDisabled={isUploading}
                />
              </Tooltip>
            )}
          </HStack>
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
