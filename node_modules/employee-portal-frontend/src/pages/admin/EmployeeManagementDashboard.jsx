import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Text,
  Textarea,
  Tr,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEdit,
  FiList,
  FiLogOut,
  FiMenu,
  FiPauseCircle,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTag,
  FiTrendingUp,
  FiTrash2,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import apiClient from "../../utils/apiClient";
import { useUserStore } from "../../store/user";
import * as XLSX from "xlsx";
import EmployeeProfileListView from "../../components/admin/EmployeeProfileListView";

const EmployeeManagementDashboard = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const highlightBg = useColorModeValue("green.50", "green.900");
  const tableHeadBg = useColorModeValue("gray.50", "gray.900");
  const sidebarBg = useColorModeValue("white", "gray.800");
  const sidebarShadow = useColorModeValue("md", "dark-lg");
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isAddEmployeeOpen,
    onOpen: onAddEmployeeOpen,
    onClose: onAddEmployeeClose,
  } = useDisclosure();
  const {
    isOpen: isEditEmployeeOpen,
    onOpen: onEditEmployeeOpen,
    onClose: onEditEmployeeClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteEmployeeOpen,
    onOpen: onDeleteEmployeeOpen,
    onClose: onDeleteEmployeeClose,
  } = useDisclosure();
  const {
    isOpen: isHoldEmployeeOpen,
    onOpen: onHoldEmployeeOpen,
    onClose: onHoldEmployeeClose,
  } = useDisclosure();
  const {
    isOpen: isCreatePackageOpen,
    onOpen: onCreatePackageOpen,
    onClose: onCreatePackageClose,
  } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const clearUser = useUserStore((state) => state.clearUser);

  const [pendingJobs, setPendingJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [employersLoading, setEmployersLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeActionLoading, setEmployeeActionLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    jobTitle: "",
  });
  const [employeeEditForm, setEmployeeEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    jobTitle: "",
    status: "active",
  });
  const [employerCategories, setEmployerCategories] = useState([]);
  const [employerCategoriesLoading, setEmployerCategoriesLoading] = useState(false);
  const [employerCategoryName, setEmployerCategoryName] = useState("");
  const [employerCategorySubmitting, setEmployerCategorySubmitting] = useState(false);
  const [employerCategoryActionId, setEmployerCategoryActionId] = useState(null);
  const [documentCategories, setDocumentCategories] = useState([]);
  const [documentCategoriesLoading, setDocumentCategoriesLoading] = useState(false);
  const [documentCategoryName, setDocumentCategoryName] = useState("");
  const [documentCategorySubmitting, setDocumentCategorySubmitting] = useState(false);
  const [documentCategorySection, setDocumentCategorySection] = useState("companys");
  const [documentCategoryActionId, setDocumentCategoryActionId] = useState(null);
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [packageSubmitting, setPackageSubmitting] = useState(false);
  const [packageForm, setPackageForm] = useState({
    market: "Local",
    packageNumber: "",
    price: "",
    description: "",
    servicesText: "",
  });

  const normalizeRoleValue = (value = "") =>
    value?.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  // "Employee" accounts are users whose role is explicitly `employee`.
  const EMPLOYEE_ROLE_SET = new Set(["employee"]);
  const getEmployeePhone = (user) => user?.phone || user?.username || "";

  const resetEmployeeForm = () => {
    setEmployeeForm({
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      jobTitle: "",
    });
  };

  const closeAddEmployeeModal = () => {
    onAddEmployeeClose();
    resetEmployeeForm();
  };

  const closeEditEmployeeModal = () => {
    onEditEmployeeClose();
    setSelectedEmployee(null);
  };

  const closeDeleteEmployeeModal = () => {
    onDeleteEmployeeClose();
    setSelectedEmployee(null);
  };

  const closeHoldEmployeeModal = () => {
    onHoldEmployeeClose();
    setSelectedEmployee(null);
  };

  const handleEmployeeFormChange = (field) => (event) => {
    setEmployeeForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleEmployeeEditChange = (field) => (event) => {
    setEmployeeEditForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const openEditEmployeeModal = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeEditForm({
      fullName: employee?.fullName || "",
      phoneNumber: getEmployeePhone(employee),
      email: employee?.email || "",
      jobTitle: employee?.jobTitle || "",
      status: employee?.status || "active",
    });
    onEditEmployeeOpen();
  };

  const openDeleteEmployeeModal = (employee) => {
    setSelectedEmployee(employee);
    onDeleteEmployeeOpen();
  };

  const openHoldEmployeeModal = (employee) => {
    setSelectedEmployee(employee);
    onHoldEmployeeOpen();
  };

  const resetPackageForm = () => {
    setPackageForm({
      market: "Local",
      packageNumber: "",
      price: "",
      description: "",
      servicesText: "",
    });
  };

  const closeCreatePackageModal = () => {
    onCreatePackageClose();
    resetPackageForm();
  };

  const handlePackageFormChange = (field) => (event) => {
    setPackageForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const parseServicesText = (value = "") =>
    value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

  // Load employees function
  const loadEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const response = await apiClient.get("/users");
      const payload = response?.data?.data ?? response?.data ?? [];
      const users = Array.isArray(payload) ? payload : [];
      const employeeUsers = users.filter((user) => {
        const normalizedRole = normalizeRoleValue(user?.role);
        const username = user?.username?.toString?.() || "";
        return (
          EMPLOYEE_ROLE_SET.has(normalizedRole) &&
          normalizedRole !== "employer" &&
          username !== "." &&
          username !== ".."
        );
      });
      setEmployees(employeeUsers);
    } catch (error) {
      toast({
        title: "Failed to load employees",
        description: error?.message || "Unable to load registered employees.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Handle export employees
  const handleExportEmployees = (rows) => {
    const safeRows = Array.isArray(rows) ? rows : [];
    if (safeRows.length === 0) {
      toast({
        title: "Nothing to export",
        description: "No employees match the current filter.",
        status: "info",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    const data = safeRows.map((user) => ({
      "Full Name": user?.fullName || "",
      "Phone Number": getEmployeePhone(user) || "",
      Email: user?.email || "",
      Role: user?.role || "",
      Status: user?.status || "",
      "Job Title": user?.jobTitle || "",
      "Created At": user?.createdAt ? new Date(user.createdAt).toISOString() : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const dateStamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `employees_${dateStamp}.xlsx`);
  };

  // Handle add employee
  const handleAddEmployee = async () => {
    const fullName = employeeForm.fullName.trim();
    const phoneNumber = employeeForm.phoneNumber.trim();
    const email = employeeForm.email.trim();
    const password = employeeForm.password;
    const jobTitle = employeeForm.jobTitle.trim();

    if (!fullName || !phoneNumber || !email || !password) {
      toast({
        title: "Missing details",
        description: "Full name, phone number, email, and password are required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setEmployeeActionLoading(true);
    try {
      const payload = {
        fullName,
        username: phoneNumber,
        phone: phoneNumber,
        email,
        password,
        role: "employee",
        status: "active",
      };
      if (jobTitle) {
        payload.jobTitle = jobTitle;
      }
      const response = await apiClient.post("/users", payload);
      const createdEmployee = response?.data?.data;
      if (createdEmployee) {
        setEmployees((prev) => [createdEmployee, ...prev]);
      }
      toast({
        title: "Employee added",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      closeAddEmployeeModal();
    } catch (error) {
      toast({
        title: "Failed to add employee",
        description: error?.message || "Unable to add employee.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEmployeeActionLoading(false);
    }
  };

  // Handle edit employee
  const handleEditEmployee = async () => {
    if (!selectedEmployee?._id) return;
    const fullName = employeeEditForm.fullName.trim();
    const phoneNumber = employeeEditForm.phoneNumber.trim();
    const email = employeeEditForm.email.trim();
    const jobTitle = employeeEditForm.jobTitle.trim();
    const status = employeeEditForm.status || "active";

    if (!fullName || !phoneNumber || !email) {
      toast({
        title: "Missing details",
        description: "Full name, phone number, and email are required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setEmployeeActionLoading(true);
    try {
      const payload = {
        fullName,
        username: phoneNumber,
        phone: phoneNumber,
        email,
        status,
        jobTitle,
      };
      const response = await apiClient.put(`/users/${selectedEmployee._id}`, payload);
      const updatedEmployee = response?.data?.data;
      if (updatedEmployee) {
        setEmployees((prev) =>
          prev.map((employee) => (employee._id === updatedEmployee._id ? updatedEmployee : employee))
        );
      }
      toast({
        title: "Employee updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      closeEditEmployeeModal();
    } catch (error) {
      toast({
        title: "Failed to update employee",
        description: error?.message || "Unable to update employee.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEmployeeActionLoading(false);
    }
  };

  // Handle hold employee
  const handleHoldEmployee = async () => {
    if (!selectedEmployee?._id) return;
    setEmployeeActionLoading(true);
    try {
      const response = await apiClient.put(`/users/${selectedEmployee._id}`, {
        status: "inactive",
      });
      const updatedEmployee = response?.data?.data;
      if (updatedEmployee) {
        setEmployees((prev) =>
          prev.map((employee) => (employee._id === updatedEmployee._id ? updatedEmployee : employee))
        );
      }
      toast({
        title: "Employee placed on hold",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      closeHoldEmployeeModal();
    } catch (error) {
      toast({
        title: "Failed to hold employee",
        description: error?.message || "Unable to update employee status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEmployeeActionLoading(false);
    }
  };

  // Handle delete employee
  const handleDeleteEmployee = async () => {
    if (!selectedEmployee?._id) return;
    setEmployeeActionLoading(true);
    try {
      await apiClient.delete(`/users/${selectedEmployee._id}`);
      setEmployees((prev) => prev.filter((employee) => employee._id !== selectedEmployee._id));
      toast({
        title: "Employee deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      closeDeleteEmployeeModal();
    } catch (error) {
      toast({
        title: "Failed to delete employee",
        description: error?.message || "Unable to delete employee.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEmployeeActionLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const bgGradient = useColorModeValue(
    "linear(to-br, gray.50, teal.50)",
    "linear(to-br, gray.900, teal.900)"
  );
  const brandText = useColorModeValue("teal.700", "teal.200");

  return (
    <Box bgGradient={bgGradient} minH="100vh">
      <Flex
        maxW="7xl"
        mx="auto"
        direction={{ base: "column", lg: "row" }}
        gap={{ base: 0, lg: 6 }}
        px={{ base: 3, md: 5 }}
        py={{ base: 4, lg: 6 }}
        align="stretch"
      >
        <Box flex="1" minW={0}>
          <Box>
            <Box>
              <HStack justify="space-between" mb={6} align="center">
                <HStack spacing={3}>
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
                        Employee Management Dashboard
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={mutedText}>
                      Manage Employees
                    </Text>
                  </Box>
                </HStack>
              </HStack>
              
              <Card>
                <CardBody>
                  <EmployeeProfileListView
                    employees={employees}
                    loading={employeesLoading}
                    onEdit={openEditEmployeeModal}
                    onHold={openHoldEmployeeModal}
                    onDelete={openDeleteEmployeeModal}
                    searchText={employeeSearch}
                    onSearchChange={setEmployeeSearch}
                  />
                </CardBody>
              </Card>
            </Box>
          </Box>
        </Box>
      </Flex>

      {/* Add Employee Modal */}
      <Modal isOpen={isAddEmployeeOpen} onClose={closeAddEmployeeModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add employee</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <FormControl isRequired>
                <FormLabel>Full name</FormLabel>
                <Input
                  placeholder="Employee name"
                  value={employeeForm.fullName}
                  onChange={handleEmployeeFormChange("fullName")}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Phone number</FormLabel>
                <Input
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={employeeForm.phoneNumber}
                  onChange={handleEmployeeFormChange("phoneNumber")}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="employee@enisra.com"
                  value={employeeForm.email}
                  onChange={handleEmployeeFormChange("email")}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Set a temporary password"
                  value={employeeForm.password}
                  onChange={handleEmployeeFormChange("password")}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Job title</FormLabel>
                <Input
                  placeholder="Role or department"
                  value={employeeForm.jobTitle}
                  onChange={handleEmployeeFormChange("jobTitle")}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeAddEmployeeModal}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleAddEmployee}
              isLoading={employeeActionLoading}
            >
              Add employee
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditEmployeeOpen} onClose={closeEditEmployeeModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit employee</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <FormControl isRequired>
                <FormLabel>Full name</FormLabel>
                <Input
                  placeholder="Employee name"
                  value={employeeEditForm.fullName}
                  onChange={handleEmployeeEditChange("fullName")}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Phone number</FormLabel>
                <Input
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={employeeEditForm.phoneNumber}
                  onChange={handleEmployeeEditChange("phoneNumber")}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="employee@enisra.com"
                  value={employeeEditForm.email}
                  onChange={handleEmployeeEditChange("email")}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Job title</FormLabel>
                <Input
                  placeholder="Role or department"
                  value={employeeEditForm.jobTitle}
                  onChange={handleEmployeeEditChange("jobTitle")}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={employeeEditForm.status}
                  onChange={handleEmployeeEditChange("status")}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeEditEmployeeModal}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleEditEmployee}
              isLoading={employeeActionLoading}
            >
              Save changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Hold Employee Modal */}
      <Modal isOpen={isHoldEmployeeOpen} onClose={closeHoldEmployeeModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Hold employee</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Place{" "}
              {selectedEmployee?.fullName || selectedEmployee?.username || "this employee"} on
              hold? This will set the account status to inactive.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeHoldEmployeeModal}>
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleHoldEmployee}
              isLoading={employeeActionLoading}
            >
              Confirm hold
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Employee Modal */}
      <Modal isOpen={isDeleteEmployeeOpen} onClose={closeDeleteEmployeeModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete employee</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Delete{" "}
              {selectedEmployee?.fullName || selectedEmployee?.username || "this employee"}? This
              action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeDeleteEmployeeModal}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteEmployee}
              isLoading={employeeActionLoading}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EmployeeManagementDashboard;