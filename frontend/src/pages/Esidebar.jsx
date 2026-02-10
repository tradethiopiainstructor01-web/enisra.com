import { Box, Divider, Icon, Text, VStack, Button, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { FiBriefcase, FiFileText, FiLogOut, FiUser } from 'react-icons/fi';
import { useUserStore } from '../store/user';

const Esidebar = () => {
    const currentUser = useUserStore((state) => state.currentUser);
    const clearUser = useUserStore((state) => state.clearUser); // Use clearUser for logout
    const navigate = useNavigate(); // Initialize navigate for navigation
    const location = useLocation();
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const textColor = useColorModeValue('black', 'white');
    const activeBg = useColorModeValue('teal.50', 'teal.900');

    const handleLogout = () => {
        clearUser(); // Clear the user state
        navigate('/login'); // Redirect to the login page
    };

    const navItems = [
        { label: 'Profile', to: '/employee/profile', icon: FiUser },
        { label: 'Jobs', to: '/employee/jobs', icon: FiBriefcase },
        { label: 'Create CV', to: '/employee/create-cv', icon: FiFileText },
    ];

    const isActive = (to) => location.pathname.toLowerCase().startsWith(to.toLowerCase());

    return (
        <Box
            width="250px"
            p={4}
            bg={bgColor}
            boxShadow="md"
            borderRadius="md"
            position="sticky"
            top="10"
            height="fit-content"
            mt={16}
        >
            <VStack spacing={4} align="start">
                <Text fontSize="lg" fontWeight="bold" color={textColor}>Employee Menu</Text>

                <Text fontSize="sm" color={textColor}>Username: {currentUser?.username || 'N/A'}</Text>
                {currentUser?.email ? (
                    <Text fontSize="sm" color={textColor}>Email: {currentUser.email}</Text>
                ) : null}
                <Text fontSize="sm" color={textColor}>Role: {currentUser?.displayRole || currentUser?.role || 'N/A'}</Text>

                <Divider />

                <VStack spacing={2} align="stretch" width="full">
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
                        >
                            {item.label}
                        </Button>
                    ))}
                </VStack>

                <Divider />

                <Button
                    colorScheme="teal"
                    variant="solid"
                    size="sm"
                    width="full"
                    onClick={handleLogout}
                    leftIcon={<Icon as={FiLogOut} />}
                >
                    Logout
                </Button>
            </VStack>
        </Box>
    );
};

export default Esidebar;
