
import {
    Container,
    Flex,
    Text,
    HStack,
    Button,
    useColorMode,
    Avatar,
    Box,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Divider,
    Badge,
    VStack,
    useColorModeValue
} from "@chakra-ui/react";
import { BsBell, BsChat } from "react-icons/bs";
import { IoMoon } from "react-icons/io5";
import { SunIcon } from "@chakra-ui/icons";
import { FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/user";
import { useEffect, useState } from "react";

const NavbarPage = ({ sidebarWidth = "0px", onOpenSidebar, isMobile = false, navbarHeight = "52px" }) => {
    const { colorMode, toggleColorMode } = useColorMode();
    const gradient = useColorModeValue(
        "linear(to-r,rgb(11, 11, 25),rgb(47, 24, 174))",
        "linear(to-r, #0f172a, #111827)"
    );
    const textColor = useColorModeValue("gray.900", "gray.100");
    const borderColor = useColorModeValue("rgba(15,23,42,0.8)", "rgba(255,255,255,0.2)");
    const toggleLabel = colorMode === "light" ? "Switch to dark theme" : "Switch to light theme";
    const navigate = useNavigate();
    const currentUser = useUserStore((state) => state.currentUser);
    const users = useUserStore((state) => state.users);
    const [notifications, setNotifications] = useState([]);

    const clearUser = useUserStore((state) => state.clearUser);

    const handleLogout = () => {
        // Use the Zustand store to clear user state (also clears localStorage)
        if (typeof clearUser === 'function') clearUser();
        // Navigate to login
        navigate('/login');
    };

    useEffect(() => {
        const pendingNotifications = users.filter(user => user.infoStatus === 'pending');
        setNotifications(pendingNotifications);
    }, [users]);

    const navigateToUser = (userId) => {
        navigate("/users");
    };

    return (
        <Container
            maxW="100%"
            px={{ base: 2, sm: 3, md: 4 }}
            py={{ base: 1, sm: 2, md: 2 }}
            bgGradient={gradient}
            color={textColor}
            zIndex="1000"
            position="fixed"
            top="0"
            left={isMobile ? 0 : sidebarWidth}
            width={isMobile ? "100%" : `calc(100% - ${sidebarWidth})`}
            boxShadow="0 2px 10px rgba(0,0,0,0.1)"
            transition="all 0.3s ease"
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
            height={navbarHeight}
        >
            <Flex
                minH={{ base: "44px", sm: "48px", md: "52px" }}
                alignItems="center"
                justifyContent="space-between"
                px={{ base: 2, sm: 3 }}
                flexDir={{ base: "row", sm: "row" }}
                gap={{ base: 1, sm: 2 }}
                width="100%"
            >
                {/* Dashboard Title */}
                <HStack spacing={{ base: 2, sm: 3 }} w={{ base: "auto", sm: "auto" }} justifyContent="flex-start">
                    <IconButton
                        display={{ base: "inline-flex", md: "inline-flex" }}
                        icon={<FiMenu />}
                        onClick={onOpenSidebar}
                        variant="ghost"
                        color="white"
                        aria-label="Open navigation"
                        size={{ base: "sm", sm: "md" }}
                        minW="44px"
                        minH="44px"
                        borderRadius="full"
                        _hover={{ bg: "whiteAlpha.200" }}
                    />
                    <Text
                        fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="wide"
                        color="white"
                        textShadow="0 1px 4px rgba(0,0,0,0.3)"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        maxW={{ base: "120px", sm: "180px", md: "none" }}
                    >
                        Dashboard
                    </Text>
                </HStack>
{/* Navigation Icons */}
                <HStack 
                    spacing={{ base: 1, sm: 2, md: 4 }} 
                    alignItems="center" 
                    w={{ base: "auto", sm: "auto" }} 
                    justifyContent="flex-end"
                    flexWrap="nowrap"
                >
                    {/* Notifications Dropdown */}
                    <Menu>
                        <MenuButton 
                            as={Button} 
                            variant="ghost"
                            minW="44px"
                            minH="44px"
                            p={2}
                            borderRadius="full"
                            _hover={{ bg: "whiteAlpha.200" }}
                        >
                            <BsBell size={20} color="inherit" />
                            {notifications.length > 0 && (
                                <Badge 
                                    ml={1} 
                                    colorScheme="red"
                                    fontSize="xs"
                                    borderRadius="full"
                                    minW="18px"
                                    h="18px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    {notifications.length > 9 ? '9+' : notifications.length}
                                </Badge>
                            )}
                        </MenuButton>
                        <MenuList p={3} minW="250px" boxShadow="lg">
                            <Text fontWeight="bold" mb={2}>Notifications</Text>
                            <Divider />
                            {notifications.length === 0 ? (
                                <Text mt={2} textAlign="center">No new notifications</Text>
                            ) : (
                                <VStack spacing={3} align="stretch">
                                    {notifications.map(user => (
                                        <Box
                                            key={user._id}
                                            p={2}
                                            borderRadius="md"
                                            bg="gray.100"
                                            cursor="pointer"
                                            _hover={{ bg: "gray.200" }}
                                            onClick={() => navigateToUser(user._id)}
                                        >
                                            <HStack>
                                                <Avatar size="sm" name={user.username} src={user.photoURL} />
                                                <Box>
                                                    <Text fontWeight="bold">{user.username}</Text>
                                                    <Text fontSize="sm" color="gray.500">
                                                        {user.infoStatus}
                                                    </Text>
                                                </Box>
                                            </HStack>
                                        </Box>
                                    ))}
                                </VStack>
                            )}
                        </MenuList>
                    </Menu>

                    {/* Messages Dropdown */}
                    <Menu>
                        <MenuButton 
                            as={Button} 
                            variant="ghost"
                            minW="44px"
                            minH="44px"
                            p={2}
                            borderRadius="full"
                            _hover={{ bg: "whiteAlpha.200" }}
                        >
                            <BsChat size={20} color="inherit" />
                        </MenuButton>
                        <MenuList>
                            <MenuItem>No new messages</MenuItem>
                        </MenuList>
                    </Menu>

                    {/* User Profile Dropdown */}
                    <Menu>
                        <MenuButton 
                            as={Avatar} 
                            size={{ base: "sm", sm: "md" }} 
                            name={currentUser?.username} 
                            src={currentUser?.photoURL}
                            cursor="pointer"
                            border="2px solid white"
                            _hover={{ transform: "scale(1.05)" }}
                            transition="transform 0.2s"
                        />
                        <MenuList 
                            minW="200px" 
                            boxShadow="xl"
                            border="none"
                            py={2}
                        >
                            <Box p={4} textAlign="center" bg="gray.50" borderRadius="md" mx={2} mb={2}>
                                <Avatar 
                                    size="xl" 
                                    name={currentUser?.username} 
                                    src={currentUser?.photoURL} 
                                    mb={3}
                                    border="3px solid"
                                    borderColor="blue.500"
                                />
                                <Text fontSize="lg" fontWeight="bold" mb={1}>{currentUser?.username}</Text>
                                <Text fontSize="sm" color="gray.600">Role: {currentUser?.role}</Text>
                            </Box>
                            <Divider my={2} />
                            <MenuItem 
                                onClick={handleLogout}
                                py={3}
                                px={4}
                                fontSize="sm"
                                _hover={{ bg: "red.50" }}
                                color="red.600"
                                fontWeight="medium"
                            >
                                Logout
                            </MenuItem>
                        </MenuList>
                    </Menu>


{/* Dark Mode Toggle */}
                    <IconButton
                        icon={colorMode === "light" ? <IoMoon size={20} /> : <SunIcon boxSize={5} />}
                        onClick={toggleColorMode}
                        variant="solid"
                        colorScheme={colorMode === "light" ? "purple" : "yellow"}
                        aria-label={toggleLabel}
                        rounded="full"
                        boxShadow="md"
                        size={{ base: "sm", sm: "md" }}
                        minW="44px"
                        minH="44px"
                        _hover={{ transform: "scale(1.1)", boxShadow: "lg" }}
                        transition="all 0.2s"
                    />
                </HStack>
            </Flex>
        </Container>
    );
};

export default NavbarPage;
