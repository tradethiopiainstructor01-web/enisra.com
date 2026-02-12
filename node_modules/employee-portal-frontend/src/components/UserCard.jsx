import { Box, Heading, HStack, Divider, IconButton, Text, useColorModeValue, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, VStack, Input, Select, Switch } from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ViewIcon, ViewOffIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { useUserStore } from '../store/user';
import { useState, useEffect } from 'react';
import UserDetailDrawer from './UserDetailDrawer'; // Import the new drawer component

const UserCard = ({ user }) => {
    const [updatedUser, setUpdatedUser] = useState(user);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordDraft, setPasswordDraft] = useState("");
    const [isDrawerOpen, setDrawerOpen] = useState(false); // State for the drawer
    const [hireDate, setHireDate] = useState(user.hireDate ? new Date(user.hireDate).toISOString().split("T")[0] : "");
    const textColor = useColorModeValue("gray.600", "gray.200");
    const bg = useColorModeValue("white", "gray.800");

    const formatSalary = (value) => {
        if (value === undefined || value === null || Number.isNaN(Number(value))) {
            return "N/A";
        }
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(Number(value));
    };

    const salaryLabel = formatSalary(user.salary);

    const normalizeRoleValue = (value = '') =>
        value?.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    const { deleteUser, updateUser, fetchUsers } = useUserStore();
    const toast = useToast();

    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    useEffect(() => {
        if (isEditOpen) {
            setUpdatedUser(user);
            setPasswordDraft("");
            setHireDate(user.hireDate ? new Date(user.hireDate).toISOString().split("T")[0] : "");
        }
    }, [isEditOpen, user]);

    const handleDeleteUser = async (uid) => {
        const { success, message } = await deleteUser(uid);
        toast({
            title: success ? 'Success' : 'Error',
            description: message,
            status: success ? 'success' : 'error',
            duration: 3000,
            isClosable: true,
        });
        if (success) onDeleteClose();
        await fetchUsers();
    };

    const handleUpdateUser = async () => {
        const payload = { ...updatedUser, hireDate };
        if (passwordDraft) {
            payload.password = passwordDraft;
        } else {
            delete payload.password;
        }
        const { success } = await updateUser(user._id, payload);
        toast({
            title: success ? 'Success' : 'Error',
            description: success ? "User updated successfully" : "Failed to update user",
            status: success ? 'success' : 'error',
            duration: 3000,
            isClosable: true,
        });

        if (success) {
            onEditClose();
            await fetchUsers();
        }
    };

    const toggleUserStatus = async () => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        const { success } = await updateUser(user._id, { ...updatedUser, status: newStatus });
        toast({
            title: success ? 'Success' : 'Error',
            description: success ? `User status updated to ${newStatus}` : "Failed to update user status",
            status: success ? 'success' : 'error',
            duration: 3000,
            isClosable: true,
        });

        if (success) {
            setUpdatedUser({ ...updatedUser, status: newStatus });
            await fetchUsers();
        }
    };

    return (
        <Box
            shadow="md"
            rounded="xl"
            overflow="hidden"
            w="100%"
            maxW="sm"
            transition="all 0.3s"
            _hover={{ transform: "translateY(-5px)", shadow: "lg" }}
            bg={bg}
                    p={{ base: 3, sm: 4 }}
            onClick={() => setDrawerOpen(true)}
            cursor="pointer"
            borderWidth="1px"
            borderColor={useColorModeValue("gray.200", "gray.700")}
        >
            <VStack spacing={{ base: 2, sm: 3 }} align="stretch">
                <Box borderBottom="2px" borderColor={useColorModeValue("gray.300", "gray.600")} pb={2} width="full">
                    <Heading 
                        as="h3" 
                        size={{ base: "sm", sm: "md" }} 
                        mb={1}
                        lineHeight="1.3"
                        noOfLines={1}
                    >
                        {user.username || "No Username Available"}
                    </Heading>
                </Box>
                <Text 
                    fontWeight="semibold" 
                    fontSize={{ base: "sm", sm: "md" }} 
                    color={textColor}
                    noOfLines={1}
                    wordBreak="break-all"
                >
                    {user.email || "No Email Available"}
                </Text>
                <Text 
                    fontSize={{ base: "sm", sm: "md" }} 
                    color={textColor}
                    fontWeight="medium"
                >
                    Role: {user.role || "No Role Assigned"}
                </Text>
                <Text 
                    fontSize={{ base: "sm", sm: "md" }} 
                    color={textColor}
                    fontWeight="medium"
                >
                    Salary: {salaryLabel}
                </Text>

                <HStack
                    spacing={{ base: 2, sm: 3 }}
                    alignItems="center"
                    width="full"
                    py={{ base: 2, sm: 2 }}
                    px={{ base: 2, sm: 3 }}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    rounded="lg"
                    boxShadow="sm"
                >
                    <Text
                        fontSize={{ base: "xs", sm: "sm" }}
                        fontWeight="medium"
                        color={textColor}
                        minWidth={{ base: "70px", sm: "80px" }}
                        flexShrink={0}
                    >
                        Hire Date:
                    </Text>
                    <Input
                        type="date"
                        value={hireDate}
                        onChange={(e) => setHireDate(e.target.value)}
                        size={{ base: "sm", sm: "sm" }}
                        variant="flushed"
                        placeholder="Select a date"
                        borderColor="blue.300"
                        _hover={{ borderColor: "blue.400" }}
                        _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
                        }}
                        fontSize={{ base: "sm", sm: "sm" }}
                        color={textColor}
                        width={{ base: "50%", sm: "60%" }}
                        minH="36px"
                    />
                    <Button
                        onClick={handleUpdateUser}
                        size={{ base: "sm", sm: "sm" }}
                        colorScheme="blue"
                        px={{ base: 3, sm: 4 }}
                        boxShadow="sm"
                        _hover={{ bg: "blue.600" }}
                        fontSize={{ base: "sm", sm: "sm" }}
                        minH="36px"
                        minW="70px"
                    >
                        Save
                    </Button>
                </HStack>

                <Divider borderColor="gray.300" />

                <HStack spacing={{ base: 2, sm: 2 }} alignItems="center" justifyContent="space-between" width="full" py={1}>
                    <Switch
                        isChecked={user.status === 'active'}
                        onChange={toggleUserStatus}
                        size={{ base: "sm", sm: "sm" }}
                        colorScheme="teal"
                        sx={{
                            '& .chakra-switch__track': {
                                minWidth: '40px'
                            }
                        }}
                    />
                    <Text 
                        fontSize={{ base: "sm", sm: "md" }} 
                        color={textColor} 
                        display="flex" 
                        alignItems="center"
                        fontWeight="medium"
                    >
                        {user.status === 'active' ? (
                            <>
                                <CheckCircleIcon color="green.500" boxSize={{ base: 3, sm: 4 }} mr={1} />
                                Active
                            </>
                        ) : (
                            <>
                                <WarningIcon color="red.500" boxSize={{ base: 3, sm: 4 }} mr={1} />
                                Inactive
                            </>
                        )}
                    </Text>
                </HStack>

                <HStack spacing={{ base: 1, sm: 2 }} pt={2}>
                    <IconButton 
                        icon={<EditIcon />} 
                        onClick={onEditOpen} 
                        colorScheme="blue" 
                        aria-label="Edit user" 
                        size={{ base: "sm", sm: "sm" }}
                        minW="40px"
                        minH="40px"
                        borderRadius="full"
                    />
                    <IconButton 
                        icon={<DeleteIcon />} 
                        onClick={onDeleteOpen} 
                        colorScheme="red" 
                        aria-label="Delete user" 
                        size={{ base: "sm", sm: "sm" }}
                        minW="40px"
                        minH="40px"
                        borderRadius="full"
                    />
                </HStack>
            </VStack>

            <UserDetailDrawer 
                isOpen={isDrawerOpen} 
                onClose={() => setDrawerOpen(false)} 
                user={user} 
            />

            <Modal isOpen={isEditOpen} onClose={onEditClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Update User</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Input
                                placeholder="User Name"
                                name="username"
                                value={updatedUser.username || ''}
                                onChange={(e) => setUpdatedUser({ ...updatedUser, username: e.target.value })}
                            />
                            <Input
                                placeholder="User Email"
                                name="email"
                                value={updatedUser.email || ''}
                                onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
                            />
                            <Box position="relative" width="100%">
                                <Input
                                    placeholder="User Password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={passwordDraft}
                                    onChange={(e) => setPasswordDraft(e.target.value)}
                                />
                                <IconButton
                                    aria-label="Toggle password visibility"
                                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                    onClick={() => setShowPassword(!showPassword)}
                                    position="absolute"
                                    right="10px"
                                    top="50%"
                                    transform="translateY(-50%)"
                                />
                            </Box>
                            <Select
                                placeholder="Select Role"
                                value={normalizeRoleValue(updatedUser.role) || ''}
                                onChange={(e) => setUpdatedUser({ ...updatedUser, role: e.target.value })}
                            >
                                <option value="admin">Admin</option>
                                <option value="employee">Employee</option>
                                <option value="employer">Employer</option>
                                <option value="it">IT</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="tradextv">TradexTV</option>
                                <option value="socialmediamanager">Social Media</option>
                                <option value="enisra">Enisra</option>
                                <option value="instructor">Instructor</option>
                                <option value="eventmanager">Event Manager</option>
                                <option value="coo">COO</option>
                                <option value="reception">Reception</option>
                                <option value="finance">Finance</option>
                            </Select>
                            <Input
                                placeholder="Salary"
                                name="salary"
                                type="number"
                                value={updatedUser.salary || ''}
                                onChange={(e) => setUpdatedUser({ ...updatedUser, salary: e.target.value })}
                            />
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleUpdateUser}>
                            Save
                        </Button>
                        <Button variant="ghost" onClick={onEditClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Deletion</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>Are you sure you want to delete the user {user.username}?</Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" onClick={() => handleDeleteUser(user._id)}>
                            Yes, Delete
                        </Button>
                        <Button variant="ghost" onClick={onDeleteClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default UserCard;``
