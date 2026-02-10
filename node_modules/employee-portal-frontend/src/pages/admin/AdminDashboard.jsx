import {
  Badge,
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
  FiLogOut,
  FiMenu,
  FiPauseCircle,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTrendingUp,
  FiTrash2,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import apiClient from "../../utils/apiClient";
import { useUserStore } from "../../store/user";
import * as XLSX from "xlsx";

const AdminDashboard = () => {
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

  const adminSections = [
    {
      id: "job-post",
      title: "Job Post",
      description: "Review employer job submissions and publishing readiness.",
      icon: FiBriefcase,
      tone: "green",
      to: "/admin#job-post",
      cta: "Open job post queue",
    },
    {
      id: "promotions",
      title: "Promotions",
      description: "Plan promotions and coordinate social media campaigns.",
      icon: FiTrendingUp,
      tone: "purple",
      to: "/social-media",
      cta: "Open promotion tools",
    },
    {
      id: "employer",
      title: "Employer",
      description: "Manage employer accounts and access requests.",
      icon: FiUsers,
      tone: "blue",
      to: "/users",
      cta: "View employer accounts",
    },
    {
      id: "package",
      title: "Package",
      description: "Review packages and pricing configuration.",
      icon: FiPackage,
      tone: "teal",
      to: "",
      cta: "Manage packages",
    },
    {
      id: "employee",
      title: "Employee",
      description: "Browse registered employees and search employee accounts.",
      icon: FiUser,
      tone: "orange",
      to: "/employee/profile",
      cta: "Open employee info form",
    },
  ];
  const [activeSectionId, setActiveSectionId] = useState(adminSections[0]?.id || "job-post");

  const loadPendingJobs = async () => {
    setJobsLoading(true);
    try {
      const response = await apiClient.get("/jobs/pending");
      const payload = response?.data?.data ?? response?.data ?? [];
      setPendingJobs(Array.isArray(payload) ? payload : []);
    } catch (error) {
      toast({
        title: "Failed to load jobs",
        description: error?.message || "Unable to load pending jobs.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setJobsLoading(false);
    }
  };

  const loadEmployers = async () => {
    setEmployersLoading(true);
    try {
      const response = await apiClient.get("/admin/employers/pending");
      const payload = response?.data?.data ?? response?.data ?? [];
      setPendingEmployers(Array.isArray(payload) ? payload : []);
    } catch (error) {
      toast({
        title: "Failed to load employers",
        description: error?.message || "Unable to load pending employers.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEmployersLoading(false);
    }
  };

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

  useEffect(() => {
    loadPendingJobs();
    loadEmployers();
  }, []);

  useEffect(() => {
    if (activeSectionId === "employee" && employees.length === 0 && !employeesLoading) {
      loadEmployees();
    }
  }, [activeSectionId]);

  const handleLogout = () => {
    clearUser();
    toast({
      title: "Signed out",
      description: "You have been logged out.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
    navigate("/login");
  };

  const handleApproveJob = async (jobId) => {
    try {
      await apiClient.patch(`/jobs/${jobId}/approve`);
      setPendingJobs((prev) => prev.filter((job) => job._id !== jobId));
      toast({
        title: "Job approved",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to approve job",
        description: error?.message || "Unable to approve job.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      await apiClient.patch(`/jobs/${jobId}/reject`);
      setPendingJobs((prev) => prev.filter((job) => job._id !== jobId));
      toast({
        title: "Job rejected",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to reject job",
        description: error?.message || "Unable to reject job.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleApproveEmployer = async (employerId) => {
    try {
      await apiClient.patch(`/admin/employers/${employerId}/approve`);
      setPendingEmployers((prev) => prev.filter((emp) => emp._id !== employerId));
      toast({
        title: "Employer approved",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to approve employer",
        description: error?.message || "Unable to approve employer.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRejectEmployer = async (employerId) => {
    try {
      await apiClient.patch(`/admin/employers/${employerId}/reject`);
      setPendingEmployers((prev) => prev.filter((emp) => emp._id !== employerId));
      toast({
        title: "Employer rejected",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to reject employer",
        description: error?.message || "Unable to reject employer.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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

  const renderSectionBody = (section) => {
    if (section.id === "job-post") {
      return (
        <Stack spacing={4}>
          {jobsLoading ? (
            <Text color={mutedText}>Loading pending jobs...</Text>
          ) : pendingJobs.length ? (
            pendingJobs.map((job) => (
              <Box
                key={job._id}
                p={4}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading size="sm">{job.title}</Heading>
                  <Badge colorScheme="orange">Pending</Badge>
                </Flex>
                <Text fontSize="sm" color={mutedText}>
                  {job.category} · {job.location} · {job.type}
                </Text>
                <Flex gap={2} mt={3}>
                  <Button size="sm" colorScheme="green" onClick={() => handleApproveJob(job._id)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRejectJob(job._id)}>
                    Reject
                  </Button>
                </Flex>
              </Box>
            ))
          ) : (
            <Text color={mutedText}>No pending jobs.</Text>
          )}
        </Stack>
      );
    }

    if (section.id === "employer") {
      return (
        <Stack spacing={4}>
          {employersLoading ? (
            <Text color={mutedText}>Loading employers...</Text>
          ) : pendingEmployers.length ? (
            pendingEmployers.map((employer) => (
              <Box
                key={employer._id}
                p={4}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="semibold">
                      {employer.fullName || employer.username || "Employer"}
                    </Text>
                    <Text fontSize="sm" color={mutedText}>
                      {employer.email}
                    </Text>
                  </Box>
                  <Badge colorScheme="orange">Pending</Badge>
                </Flex>
                <Flex gap={2} mt={3}>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => handleApproveEmployer(employer._id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectEmployer(employer._id)}
                  >
                    Reject
                  </Button>
                </Flex>
              </Box>
            ))
          ) : (
            <Text color={mutedText}>No pending employers.</Text>
          )}
        </Stack>
      );
    }

    if (section.id === "package") {
      return (
        <Stack spacing={3}>
          <Text color={mutedText}>
            Package management is handled by admin. Define offerings, benefits, and pricing tiers here.
          </Text>
          <Button size="sm" variant="outline" isDisabled>
            Package editor coming soon
          </Button>
        </Stack>
      );
    }

    if (section.id === "employee") {
      const normalizedQuery = employeeSearch.trim().toLowerCase();
      const filteredEmployees = employees.filter((user) => {
        if (!normalizedQuery) return true;
        const haystack = [
          user?.fullName,
          user?.username,
          user?.phone,
          user?.email,
          user?.role,
          user?.jobTitle,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });
      const sortedEmployees = filteredEmployees
        .slice()
        .sort((a, b) =>
          (a?.fullName || a?.username || "")
            .toString()
            .toLowerCase()
            .localeCompare((b?.fullName || b?.username || "").toString().toLowerCase())
        );

      return (
        <Stack spacing={4}>
          <Flex
            gap={3}
            direction={{ base: "column", md: "row" }}
            align={{ md: "flex-end" }}
            justify="space-between"
          >
            <FormControl>
              <FormLabel fontSize="sm">Search employees</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color={mutedText} />
                </InputLeftElement>
                <Input
                  placeholder="Name, phone, email, role..."
                  value={employeeSearch}
                  onChange={(event) => setEmployeeSearch(event.target.value)}
                />
              </InputGroup>
            </FormControl>

            <Flex gap={2} wrap="wrap">
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<Icon as={FiPlus} />}
                onClick={onAddEmployeeOpen}
              >
                Add employee
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={FiDownload} />}
                onClick={() => handleExportEmployees(filteredEmployees)}
                isDisabled={employeesLoading || filteredEmployees.length === 0}
              >
                Export Excel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={loadEmployees}
                isLoading={employeesLoading}
              >
                Refresh list
              </Button>
            </Flex>
          </Flex>

          {employeesLoading ? (
            <Text color={mutedText}>Loading employees...</Text>
          ) : sortedEmployees.length ? (
            <Stack spacing={3}>
              <Text color={mutedText} fontSize="sm">
                Showing {sortedEmployees.length} employee{sortedEmployees.length === 1 ? "" : "s"}.
              </Text>
              <TableContainer border="1px solid" borderColor={borderColor} borderRadius="md">
                <Table size="sm" variant="simple">
                  <Thead bg={tableHeadBg}>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Phone</Th>
                      <Th>Job Title</Th>
                      <Th>Status</Th>
                      <Th textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sortedEmployees.map((user) => (
                      <Tr key={user._id}>
                        <Td>
                          <Text fontWeight="semibold">
                            {user.fullName || user.username || "Employee"}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color={mutedText}>
                            {user.email || "No email"}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color={mutedText}>
                            {getEmployeePhone(user) || "N/A"}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color={mutedText}>
                            {user.jobTitle || "-"}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={user.status === "active" ? "green" : "red"}>
                            {user.status || "unknown"}
                          </Badge>
                        </Td>
                        <Td>
                          <Flex justify="flex-end" gap={1} wrap="wrap">
                            <Tooltip label="Edit">
                              <IconButton
                                aria-label="Edit employee"
                                size="xs"
                                variant="ghost"
                                icon={<Icon as={FiEdit} />}
                                onClick={() => openEditEmployeeModal(user)}
                              />
                            </Tooltip>
                            <Tooltip label="Hold (set inactive)">
                              <IconButton
                                aria-label="Hold employee"
                                size="xs"
                                variant="ghost"
                                colorScheme="orange"
                                icon={<Icon as={FiPauseCircle} />}
                                onClick={() => openHoldEmployeeModal(user)}
                                isDisabled={user.status === "inactive"}
                              />
                            </Tooltip>
                            <Tooltip label="Delete">
                              <IconButton
                                aria-label="Delete employee"
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                icon={<Icon as={FiTrash2} />}
                                onClick={() => openDeleteEmployeeModal(user)}
                              />
                            </Tooltip>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Stack>
          ) : (
            <Text color={mutedText}>No employees found.</Text>
          )}

          <Button
            as={RouterLink}
            to={section.to}
            size="sm"
            variant="outline"
            leftIcon={<Icon as={section.icon} />}
            alignSelf="flex-start"
          >
            {section.cta}
          </Button>
        </Stack>
      );
    }

    return (
      <Button
        as={RouterLink}
        to={section.to}
        size="sm"
        variant="outline"
        leftIcon={<Icon as={section.icon} />}
      >
        {section.cta}
      </Button>
    );
  };

  return (
    <Box maxW="7xl" mx="auto">
      <Flex direction={{ base: "column", lg: "row" }} gap={6}>
        {isMobile && (
          <Flex justify="flex-end">
            <IconButton
              aria-label="Open admin navigation"
              icon={<FiMenu />}
              variant="outline"
              size="sm"
              onClick={onOpen}
            />
          </Flex>
        )}

        <Box
          as="aside"
          bg={sidebarBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="xl"
          p={isCollapsed ? 3 : 4}
          width={{ base: "100%", lg: isCollapsed ? "76px" : "240px" }}
          minW={{ base: "100%", lg: isCollapsed ? "76px" : "240px" }}
          position={{ base: "static", lg: "sticky" }}
          top={{ lg: 0 }}
          minH={{ lg: "100vh" }}
          height={{ base: "auto", lg: "100vh" }}
          boxShadow={sidebarShadow}
          display={{ base: "none", lg: "block" }}
          transition="width 0.2s ease"
        >
          <Stack spacing={3}>
            <Flex justify="space-between" align="center">
              {!isCollapsed && <Heading size="sm">Admin Navigation</Heading>}
              <IconButton
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                size="sm"
                variant="ghost"
                onClick={() => setIsCollapsed((prev) => !prev)}
              />
            </Flex>
            {adminSections.map((section) => {
              const isActive = section.id === activeSectionId;
              return (
              <Tooltip
                key={section.id}
                label={section.title}
                placement="right"
                isDisabled={!isCollapsed}
              >
                <Button
                  justifyContent={isCollapsed ? "center" : "flex-start"}
                  leftIcon={<Icon as={section.icon} />}
                  variant="ghost"
                  size="sm"
                  iconSpacing={isCollapsed ? 0 : 2}
                  onClick={() => setActiveSectionId(section.id)}
                  bg={isActive ? highlightBg : "transparent"}
                  _hover={{ bg: isActive ? highlightBg : "gray.50" }}
                  _dark={{ _hover: { bg: isActive ? highlightBg : "gray.700" } }}
                >
                  {!isCollapsed && section.title}
                </Button>
              </Tooltip>
              );
            })}
            <Divider borderColor={borderColor} />
            <Button
              justifyContent={isCollapsed ? "center" : "flex-start"}
              leftIcon={<Icon as={FiLogOut} />}
              variant="ghost"
              size="sm"
              iconSpacing={isCollapsed ? 0 : 2}
              onClick={handleLogout}
              _hover={{ bg: "red.50", color: "red.600" }}
              _dark={{ _hover: { bg: "red.900", color: "red.200" } }}
            >
              {!isCollapsed && "Log out"}
            </Button>
          </Stack>
        </Box>

        <Stack spacing={6} flex="1">
          {(() => {
            const section = adminSections.find((item) => item.id === activeSectionId);
            if (!section) {
              return (
                <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <Text color={mutedText}>Select a section from the sidebar.</Text>
                  </CardBody>
                </Card>
              );
            }

            return (
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">{section.title}</Heading>
                    <Badge colorScheme={section.tone} variant="subtle">
                      Admin
                    </Badge>
                  </Flex>
                  <Text color={mutedText} fontSize="sm" mt={2}>
                    {section.description}
                  </Text>
                </CardHeader>
                <CardBody>{renderSectionBody(section)}</CardBody>
              </Card>
            );
          })()}
        </Stack>
      </Flex>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={sidebarBg}>
          <DrawerCloseButton />
          <DrawerBody pt={12}>
            <Stack spacing={3}>
              <Heading size="sm">Admin Navigation</Heading>
              {adminSections.map((section) => (
                <Button
                  key={`drawer-${section.id}`}
                  justifyContent="flex-start"
                  leftIcon={<Icon as={section.icon} />}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveSectionId(section.id);
                    onClose();
                  }}
                >
                  {section.title}
                </Button>
              ))}
              <Divider />
              <Button
                justifyContent="flex-start"
                leftIcon={<Icon as={FiLogOut} />}
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
              >
                Log out
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

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

export default AdminDashboard;
