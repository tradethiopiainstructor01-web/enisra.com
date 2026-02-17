import { 
    Container, 
    Text, 
    VStack, 
    SimpleGrid, 
    Spinner, 
    Alert, 
    AlertIcon, 
    Input, 
    InputGroup, 
    InputLeftElement, 
    Select, 
    HStack, 
    Box, 
    IconButton, 
    Drawer, 
    DrawerBody, 
    DrawerCloseButton, 
    DrawerContent, 
    DrawerHeader, 
    DrawerOverlay, 
    useDisclosure, 
    useColorModeValue 
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from '../store/user.js';
import UserCard from '../components/UserCard';
import { SearchIcon, AddIcon, RepeatIcon, ArrowUpDownIcon } from '@chakra-ui/icons'; 
import CreatePage from './CreatePage';

const HomePage = () => {
    const navigate = useNavigate();
    const { fetchUsers, users, loading, error, currentUser } = useUserStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const { isOpen, onOpen, onClose } = useDisclosure();

    const normalizeRoleValue = (value = '') =>
        value?.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // If already logged in, keep session and send user to their area when landing on home.
    useEffect(() => {
        if (!currentUser?.token) return;
        const role = (currentUser.role || currentUser.normalizedRole || '').toLowerCase();
        const roleRedirects = {
            admin: '/admin',
            coo: '/admin',
            supervisor: '/supervisor',
            employee: '/employee/dashboard',
            enisra: '/enisra',
            tradextv: '/tradextv-dashboard',
            tradextvmanager: '/tradextv-dashboard',
            it: '/it',
            employer: '/employer',
        };
        const target = roleRedirects[role] || '/employee/dashboard';
        navigate(target, { replace: true });
    }, [currentUser, navigate]);

    const filteredUsers = users.filter(user => {
        // Filter out users with username 
        const isValidUser = user.username !== "." && user.username !== "..";
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole ? normalizeRoleValue(user.role) === selectedRole : true;
        return isValidUser && matchesSearch && matchesRole;
    });

    const sortedUsers = filteredUsers.sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.username.localeCompare(b.username);
        } else {
            return b.username.localeCompare(a.username);
        }
    });

    const handleRefresh = () => {
        fetchUsers();
    };

    const toggleSortOrder = () => {
        setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    return (
        <Container maxW='container.xl' py={{ base: 6, sm: 8, md: 12 }} px={{ base: 2, sm: 3, md: 4 }} mt={{ base: -8, sm: -12, md: -16 }}>
            <VStack spacing={8}>
                <Text
                    fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                    fontWeight="bold"
                    bgGradient="linear(to-r, cyan.400, blue.500)"
                    bgClip="text"
                    textAlign="center"
                    lineHeight="1.2"
                >
                    List of User Accounts 📜
                </Text>

                <Box 
                    width="full" 
                    maxW="800px" 
                    bg={useColorModeValue("gray.50", "gray.800")} 
                    p={{ base: 3, sm: 4, md: 5 }} 
                    borderRadius="lg" 
                    boxShadow="md"
                >
                    <VStack 
                        spacing={{ base: 3, sm: 4 }} 
                        align="stretch"
                        width="full"
                    >
                        <HStack 
                            spacing={{ base: 2, sm: 3, md: 4 }} 
                            alignItems="center" 
                            justifyContent={{ base: "stretch", sm: "stretch", md: "space-between" }} 
                            wrap={{ base: "wrap", sm: "wrap", md: "nowrap" }}
                            width="full"
                        >
                            <InputGroup flex={{ base: "1", sm: "1", md: "1" }} maxW={{ base: "100%", sm: "100%", md: "260px" }}>
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color={useColorModeValue("gray.500", "gray.300")} boxSize={4} />
                                </InputLeftElement>
                                <Input
                                    type="text"
                                    placeholder="Search by username or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size={{ base: "md", sm: "lg", md: "lg" }}
                                    borderRadius="md"
                                    focusBorderColor={useColorModeValue("blue.400", "blue.300")}
                                    bg={useColorModeValue("white", "gray.700")}
                                    color={useColorModeValue("black", "white")}
                                    minH="44px"
                                    pr={10}
                                />
                            </InputGroup>
                            <Select 
                                placeholder="Select role" 
                                onChange={(e) => setSelectedRole(e.target.value)} 
                                maxW={{ base: "100%", sm: "100%", md: "200px" }}
                                bg={useColorModeValue("white", "gray.700")}
                                color={useColorModeValue("black", "white")}
                                borderColor={useColorModeValue("gray.300", "gray.600")}
                                size={{ base: "md", sm: "lg", md: "lg" }}
                                minH="44px"
                            >
                            <option value="admin">Admin</option>
                            <option value="employee">Employee</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="tradextv">TradexTV</option>
                            <option value="it">IT</option>
                            <option value="socialmediamanager">Social Media</option>
                            <option value="coo">COO</option>
                            <option value="reception">Reception</option>
                            <option value="finance">Finance</option>
                            <option value="employer">Employer</option>
                            <option value="enisra">Enisra</option>
                            <option value="instructor">Instructor</option>
                            <option value="eventmanager">Event Manager</option>          
                                          </Select>

                            <HStack spacing={{ base: 1, sm: 2 }} wrap="wrap" justifyContent="flex-end">
                                <IconButton 
                                    aria-label="Add User" 
                                    icon={<AddIcon />} 
                                    colorScheme="teal" 
                                    onClick={onOpen}
                                    size={{ base: "sm", sm: "md", md: "lg" }}
                                    variant="outline"
                                    minW="44px"
                                    minH="44px"
                                    borderRadius="full"
                                />
                                <IconButton 
                                    aria-label="Refresh Users" 
                                    icon={<RepeatIcon />} 
                                    colorScheme="blue" 
                                    onClick={handleRefresh}
                                    size={{ base: "sm", sm: "md", md: "lg" }}
                                    variant="outline"
                                    minW="44px"
                                    minH="44px"
                                    borderRadius="full"
                                />
                                <IconButton 
                                    aria-label="Sort Users" 
                                    icon={<ArrowUpDownIcon />} 
                                    colorScheme="purple" 
                                    onClick={toggleSortOrder}
                                    size={{ base: "sm", sm: "md", md: "lg" }}
                                    variant="outline"
                                    minW="44px"
                                    minH="44px"
                                    borderRadius="full"
                                />
                            </HStack>
                        </HStack>
                    </VStack>
                </Box>

                <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader> </DrawerHeader>
                        <DrawerBody>
                            <CreatePage onClose={onClose} />
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>

                {loading ? (
                    <Flex justify="center" align="center" height="200px">
                        <Spinner 
                            size={{ base: "lg", sm: "xl", md: "xl" }} 
                            color="blue.500" 
                            thickness="4px"
                        />
                    </Flex>
                ) : error ? (
                    <Alert 
                        status="error" 
                        variant="left-accent"
                        borderRadius="lg"
                        boxShadow="md"
                    >
                        <AlertIcon boxSize={5} />
                        <Text fontSize={{ base: "sm", sm: "md" }}>{error}</Text>
                    </Alert>
                ) : sortedUsers.length === 0 ? (
                    <Box textAlign="center" py={10}>
                        <Text 
                            fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
                            fontWeight="bold" 
                            color="gray.500"
                            mb={2}
                        >
                            No Users Found 😢
                        </Text>
                        <Text color="gray.400" fontSize={{ base: "sm", sm: "md" }}>
                            Try adjusting your search criteria
                        </Text>
                    </Box>
                ) : (
                    <SimpleGrid
                        columns={{
                            base: 1,
                            sm: 1,
                            md: 2,
                            lg: 3
                        }}
                        spacing={{ base: 4, sm: 6, md: 8 }}
                        w="full"
                    >
                        {sortedUsers.map((user) => (
                            <UserCard key={user._id} user={user} />
                        ))}
                    </SimpleGrid>
                )}
            </VStack>
        </Container>
    );
};

export default HomePage;
