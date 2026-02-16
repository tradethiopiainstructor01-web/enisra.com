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
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
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
  FiCheckCircle,
  FiClock,
  FiBarChart2,
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
  const [allEmployers, setAllEmployers] = useState([]);
  const [employersStatsLoading, setEmployersStatsLoading] = useState(false);
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
  const [documentCategorySection, setDocumentCategorySection] = useState("companys");
  const [documentCategorySubmitting, setDocumentCategorySubmitting] = useState(false);
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

  // Calculate statistics
  const employerStats = {
    total: allEmployers.length,
    pending: pendingEmployers.length,
    approved: allEmployers.filter((e) => e.status === "approved" || e.status === "active").length,
    rejected: allEmployers.filter((e) => e.status === "rejected" || e.status === "inactive").length,
    approvalRate: allEmployers.length > 0 
      ? ((allEmployers.filter((e) => e.status === "approved" || e.status === "active").length / allEmployers.length) * 100).toFixed(1)
      : 0,
  };

  const employeeStats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    inactive: employees.filter((e) => e.status === "inactive").length,
    activeRate: employees.length > 0 
      ? ((employees.filter((e) => e.status === "active").length / employees.length) * 100).toFixed(1)
      : 0,
  };

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

  const adminSections = [
    {
      id: "overview",
      title: "Overview",
      description: "Dashboard overview with statistics and progress metrics.",
      icon: FiBarChart2,
      tone: "blue",
    },
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
    {
      id: "employer-categories",
      title: "Employer Categories",
      description: "Manage the category dropdown used in the employer details form.",
      icon: FiTag,
      tone: "green",
      to: "/admin#employer-categories",
      cta: "Manage employer categories",
    },
    {
      id: "categories",
      title: "Document Categories",
      description: "Manage categories used for uploading company and employee documents.",
      icon: FiTag,
      tone: "teal",
      to: "",
      cta: "Manage categories",
    },
  ];
  const [activeSectionId, setActiveSectionId] = useState(adminSections[0]?.id || "overview");

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

  const loadAllEmployers = async () => {
    setEmployersStatsLoading(true);
    try {
      const response = await apiClient.get("/users");
      const payload = response?.data?.data ?? response?.data ?? [];
      const users = Array.isArray(payload) ? payload : [];
      const employerUsers = users.filter((user) => {
        const normalizedRole = normalizeRoleValue(user?.role);
        return normalizedRole === "employer" || normalizedRole === "employers";
      });
      setAllEmployers(employerUsers);
    } catch (error) {
      console.error("Failed to load all employers:", error);
    } finally {
      setEmployersStatsLoading(false);
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

  const loadPackages = async () => {
    setPackagesLoading(true);
    try {
      const response = await apiClient.get("/packages");
      const payload = response?.data?.data ?? response?.data ?? [];
      setPackages(Array.isArray(payload) ? payload : []);
    } catch (error) {
      toast({
        title: "Failed to load packages",
        description: error?.message || "Unable to load packages.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPackagesLoading(false);
    }
  };

  const loadDocumentCategories = async () => {
    setDocumentCategoriesLoading(true);
    try {
      const response = await apiClient.get("/categories");
      const payload = response?.data?.data ?? response?.data ?? [];
      setDocumentCategories(Array.isArray(payload) ? payload : []);
    } catch (error) {
      toast({
        title: "Failed to load categories",
        description: error?.message || "Unable to load categories.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDocumentCategoriesLoading(false);
    }
  };

  const handleAddDocumentCategory = async () => {
    const name = documentCategoryName.trim();
    const section = (documentCategorySection || "").toString().trim();

    if (!name) {
      toast({
        title: "Missing category",
        description: "Please enter a category name.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    if (!section) {
      toast({
        title: "Missing section",
        description: "Please select a section.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setDocumentCategorySubmitting(true);
    try {
      await apiClient.post("/categories", { name, section });
      setDocumentCategoryName("");
      await loadDocumentCategories();
      toast({
        title: "Category added",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to add category",
        description: error?.response?.data?.message || error?.message || "Unable to add category.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDocumentCategorySubmitting(false);
    }
  };

  const handleDeleteDocumentCategory = async (category) => {
    if (!category?._id) return;
    setDocumentCategoryActionId(category._id);
    try {
      await apiClient.delete(`/categories/${category._id}`);
      setDocumentCategories((prev) => prev.filter((item) => item._id !== category._id));
      toast({
        title: "Category deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to delete category",
        description: error?.response?.data?.message || error?.message || "Unable to delete category.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDocumentCategoryActionId(null);
    }
  };

  const handleCreatePackage = async () => {
    const packageNumber = Number(packageForm.packageNumber);
    const price = packageForm.price === "" ? 0 : Number(packageForm.price);
    const services = parseServicesText(packageForm.servicesText);
    const market = (packageForm.market || "Local").toString().trim();

    if (!Number.isFinite(packageNumber) || packageNumber <= 0) {
      toast({
        title: "Invalid package number",
        description: "Package number must be a positive number.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    if (!services.length) {
      toast({
        title: "Missing services",
        description: "Add at least one service (one per line).",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      toast({
        title: "Invalid price",
        description: "Price must be 0 or more.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setPackageSubmitting(true);
    try {
      await apiClient.post("/packages", {
        packageNumber,
        services,
        price,
        description: packageForm.description?.toString?.().trim?.() || "",
        market,
      });
      toast({
        title: "Package created",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      closeCreatePackageModal();
      await loadPackages();
    } catch (error) {
      toast({
        title: "Failed to create package",
        description: error?.response?.data?.message || error?.message || "Unable to create package.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setPackageSubmitting(false);
    }
  };

  const loadEmployerCategories = async () => {
    setEmployerCategoriesLoading(true);
    try {
      const response = await apiClient.get("/employer-categories", {
        params: { active: "false" },
      });
      const payload = response?.data?.data ?? response?.data ?? [];
      setEmployerCategories(Array.isArray(payload) ? payload : []);
    } catch (error) {
      toast({
        title: "Failed to load employer categories",
        description: error?.message || "Unable to load categories.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEmployerCategoriesLoading(false);
    }
  };

  const handleAddEmployerCategory = async () => {
    const name = employerCategoryName.trim();
    if (!name) {
      toast({
        title: "Missing category",
        description: "Please enter a category name.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setEmployerCategorySubmitting(true);
    try {
      await apiClient.post("/employer-categories", { name });
      setEmployerCategoryName("");
      await loadEmployerCategories();
      toast({
        title: "Category added",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to add category",
        description: error?.response?.data?.message || error?.message || "Unable to add category.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEmployerCategorySubmitting(false);
    }
  };

  const handleToggleEmployerCategory = async (category) => {
    if (!category?._id) return;
    setEmployerCategoryActionId(category._id);
    try {
      const response = await apiClient.patch(`/employer-categories/${category._id}`, {
        active: !category.active,
      });
      const updated = response?.data?.data;
      if (updated) {
        setEmployerCategories((prev) =>
          prev.map((item) => (item._id === updated._id ? updated : item))
        );
      }
    } catch (error) {
      toast({
        title: "Failed to update category",
        description: error?.response?.data?.message || error?.message || "Unable to update category.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEmployerCategoryActionId(null);
    }
  };

  const handleDeleteEmployerCategory = async (category) => {
    if (!category?._id) return;
    setEmployerCategoryActionId(category._id);
    try {
      await apiClient.delete(`/employer-categories/${category._id}`);
      setEmployerCategories((prev) => prev.filter((item) => item._id !== category._id));
      toast({
        title: "Category deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to delete category",
        description: error?.response?.data?.message || error?.message || "Unable to delete category.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEmployerCategoryActionId(null);
    }
  };

  useEffect(() => {
    loadPendingJobs();
    loadEmployers();
    loadAllEmployers();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (activeSectionId === "employee" && employees.length === 0 && !employeesLoading) {
      loadEmployees();
    }
    if (activeSectionId === "package" && packages.length === 0 && !packagesLoading) {
      loadPackages();
    }
    if (activeSectionId === "categories" && documentCategories.length === 0 && !documentCategoriesLoading) {
      loadDocumentCategories();
    }
    if (activeSectionId === "employer-categories" && employerCategories.length === 0 && !employerCategoriesLoading) {
      loadEmployerCategories();
    }
    if (activeSectionId === "overview") {
      loadAllEmployers();
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
      await loadAllEmployers();
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
      await loadAllEmployers();
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
    if (section.id === "overview") {
      return (
        <Stack spacing={6}>
          <Text color={mutedText} fontSize="sm">
            Overview of system statistics and progress metrics for employers and employees.
          </Text>

          {/* Employer Progress Section */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Flex align="center" gap={2}>
                <Icon as={FiUsers} color="blue.500" boxSize={5} />
                <Heading size="md">Employer Progress</Heading>
              </Flex>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                  <Stat>
                    <StatLabel>Total Employers</StatLabel>
                    <StatNumber>{employerStats.total}</StatNumber>
                    <StatHelpText>
                      <Icon as={FiUsers} mr={1} />
                      All registered
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Pending Approval</StatLabel>
                    <StatNumber color="orange.500">{employerStats.pending}</StatNumber>
                    <StatHelpText>
                      <Icon as={FiClock} mr={1} />
                      Awaiting review
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Approved</StatLabel>
                    <StatNumber color="green.500">{employerStats.approved}</StatNumber>
                    <StatHelpText>
                      <Icon as={FiCheckCircle} mr={1} />
                      Active accounts
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Rejected</StatLabel>
                    <StatNumber color="red.500">{employerStats.rejected}</StatNumber>
                    <StatHelpText>
                      <Icon as={FiTrash2} mr={1} />
                      Inactive accounts
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>

                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Approval Rate
                    </Text>
                    <Text fontSize="sm" color={mutedText}>
                      {employerStats.approvalRate}%
                    </Text>
                  </Flex>
                  <Progress
                    value={employerStats.approvalRate}
                    colorScheme="green"
                    size="lg"
                    borderRadius="md"
                  />
                </Box>

                {employerStats.total > 0 && (
                  <Box>
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="semibold">
                        Status Distribution
                      </Text>
                    </Flex>
                    <Stack spacing={2}>
                      <Flex align="center" justify="space-between">
                        <Text fontSize="xs" color={mutedText}>
                          Approved
                        </Text>
                        <Text fontSize="xs" fontWeight="semibold">
                          {employerStats.approved} ({employerStats.total > 0 ? ((employerStats.approved / employerStats.total) * 100).toFixed(1) : 0}%)
                        </Text>
                      </Flex>
                      <Progress
                        value={employerStats.total > 0 ? (employerStats.approved / employerStats.total) * 100 : 0}
                        colorScheme="green"
                        size="sm"
                        borderRadius="md"
                      />
                      <Flex align="center" justify="space-between">
                        <Text fontSize="xs" color={mutedText}>
                          Pending
                        </Text>
                        <Text fontSize="xs" fontWeight="semibold">
                          {employerStats.pending} ({employerStats.total > 0 ? ((employerStats.pending / employerStats.total) * 100).toFixed(1) : 0}%)
                        </Text>
                      </Flex>
                      <Progress
                        value={employerStats.total > 0 ? (employerStats.pending / employerStats.total) * 100 : 0}
                        colorScheme="orange"
                        size="sm"
                        borderRadius="md"
                      />
                      <Flex align="center" justify="space-between">
                        <Text fontSize="xs" color={mutedText}>
                          Rejected
                        </Text>
                        <Text fontSize="xs" fontWeight="semibold">
                          {employerStats.rejected} ({employerStats.total > 0 ? ((employerStats.rejected / employerStats.total) * 100).toFixed(1) : 0}%)
                        </Text>
                      </Flex>
                      <Progress
                        value={employerStats.total > 0 ? (employerStats.rejected / employerStats.total) * 100 : 0}
                        colorScheme="red"
                        size="sm"
                        borderRadius="md"
                      />
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardBody>
          </Card>

          {/* Employee Progress Section */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Flex align="center" gap={2}>
                <Icon as={FiUser} color="orange.500" boxSize={5} />
                <Heading size="md">Employee Progress</Heading>
              </Flex>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                  <Stat>
                    <StatLabel>Total Employees</StatLabel>
                    <StatNumber>{employeeStats.total}</StatNumber>
                    <StatHelpText>
                      <Icon as={FiUser} mr={1} />
                      All registered
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Active</StatLabel>
                    <StatNumber color="green.500">{employeeStats.active}</StatNumber>
                    <StatHelpText>
                      <Icon as={FiCheckCircle} mr={1} />
                      Currently active
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Inactive</StatLabel>
                    <StatNumber color="red.500">{employeeStats.inactive}</StatNumber>
                    <StatHelpText>
                      <Icon as={FiPauseCircle} mr={1} />
                      On hold
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>

                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Active Rate
                    </Text>
                    <Text fontSize="sm" color={mutedText}>
                      {employeeStats.activeRate}%
                    </Text>
                  </Flex>
                  <Progress
                    value={employeeStats.activeRate}
                    colorScheme="green"
                    size="lg"
                    borderRadius="md"
                  />
                </Box>

                {employeeStats.total > 0 && (
                  <Box>
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="semibold">
                        Status Distribution
                      </Text>
                    </Flex>
                    <Stack spacing={2}>
                      <Flex align="center" justify="space-between">
                        <Text fontSize="xs" color={mutedText}>
                          Active
                        </Text>
                        <Text fontSize="xs" fontWeight="semibold">
                          {employeeStats.active} ({employeeStats.total > 0 ? ((employeeStats.active / employeeStats.total) * 100).toFixed(1) : 0}%)
                        </Text>
                      </Flex>
                      <Progress
                        value={employeeStats.total > 0 ? (employeeStats.active / employeeStats.total) * 100 : 0}
                        colorScheme="green"
                        size="sm"
                        borderRadius="md"
                      />
                      <Flex align="center" justify="space-between">
                        <Text fontSize="xs" color={mutedText}>
                          Inactive
                        </Text>
                        <Text fontSize="xs" fontWeight="semibold">
                          {employeeStats.inactive} ({employeeStats.total > 0 ? ((employeeStats.inactive / employeeStats.total) * 100).toFixed(1) : 0}%)
                        </Text>
                      </Flex>
                      <Progress
                        value={employeeStats.total > 0 ? (employeeStats.inactive / employeeStats.total) * 100 : 0}
                        colorScheme="red"
                        size="sm"
                        borderRadius="md"
                      />
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <Stat>
                  <StatLabel>Pending Jobs</StatLabel>
                  <StatNumber>{pendingJobs.length}</StatNumber>
                  <StatHelpText>
                    <Icon as={FiBriefcase} mr={1} />
                    Awaiting approval
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <Stat>
                  <StatLabel>Total Packages</StatLabel>
                  <StatNumber>{packages.length}</StatNumber>
                  <StatHelpText>
                    <Icon as={FiPackage} mr={1} />
                    Available packages
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <Stat>
                  <StatLabel>Document Categories</StatLabel>
                  <StatNumber>{documentCategories.length}</StatNumber>
                  <StatHelpText>
                    <Icon as={FiTag} mr={1} />
                    Total categories
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <Stat>
                  <StatLabel>Employer Categories</StatLabel>
                  <StatNumber>{employerCategories.length}</StatNumber>
                  <StatHelpText>
                    <Icon as={FiTag} mr={1} />
                    Total categories
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Stack>
      );
    }

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
                <Flex gap={2} mt={3} wrap="wrap">
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
                <Flex justify="space-between" align="center" direction={{ base: "column", sm: "row" }} gap={3}>
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
                <Flex gap={2} mt={3} wrap="wrap">
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
      const sortedPackages = packages
        .slice()
        .sort((a, b) => {
          const marketA = (a?.market || "").toString();
          const marketB = (b?.market || "").toString();
          const marketSort = marketA.localeCompare(marketB);
          if (marketSort !== 0) return marketSort;
          return Number(a?.packageNumber || 0) - Number(b?.packageNumber || 0);
        });

      return (
        <Stack spacing={4}>
          <Text color={mutedText}>
            Create and maintain packages available for customers.
          </Text>

          <Flex gap={2} wrap="wrap">
            <Button
              size="sm"
              colorScheme="teal"
              leftIcon={<Icon as={FiPlus} />}
              onClick={onCreatePackageOpen}
            >
              Create package
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={loadPackages}
              isLoading={packagesLoading}
            >
              Refresh
            </Button>
          </Flex>

          {packagesLoading ? (
            <Text color={mutedText}>Loading packages...</Text>
          ) : sortedPackages.length ? (
            <Stack spacing={3}>
              <Text color={mutedText} fontSize="sm">
                Showing {sortedPackages.length} package{sortedPackages.length === 1 ? "" : "s"}.
              </Text>
              <TableContainer border="1px solid" borderColor={borderColor} borderRadius="md" overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead bg={tableHeadBg}>
                    <Tr>
                      <Th>Market</Th>
                      <Th>Package #</Th>
                      <Th isNumeric>Price</Th>
                      <Th>Services</Th>
                      <Th>Description</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sortedPackages.map((pkg) => {
                      const services = Array.isArray(pkg?.services) ? pkg.services : [];
                      const servicesPreview = services.slice(0, 3).join(", ");
                      const servicesSuffix = services.length > 3 ? ` (+${services.length - 3})` : "";
                      return (
                        <Tr key={pkg?._id || `${pkg?.market}-${pkg?.packageNumber}`}>
                          <Td>
                            <Badge colorScheme={pkg?.market === "International" ? "purple" : "green"}>
                              {pkg?.market || "Local"}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontWeight="semibold">Package {pkg?.packageNumber ?? "-"}</Text>
                          </Td>
                          <Td isNumeric>
                            <Text fontSize="sm" color={mutedText}>
                              {pkg?.price ?? 0}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" fontWeight="semibold">
                              {services.length} service{services.length === 1 ? "" : "s"}
                            </Text>
                            {servicesPreview ? (
                              <Text fontSize="xs" color={mutedText} noOfLines={2}>
                                {servicesPreview}
                                {servicesSuffix}
                              </Text>
                            ) : null}
                          </Td>
                          <Td>
                            <Text fontSize="sm" color={mutedText} noOfLines={2}>
                              {pkg?.description || "-"}
                            </Text>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Stack>
          ) : (
            <Text color={mutedText}>No packages found yet. Create one to get started.</Text>
          )}
        </Stack>
      );
    }

    if (section.id === "categories") {
      const sortedCategories = documentCategories
        .slice()
        .sort((a, b) => {
          const sectionA = (a?.section || "").toString();
          const sectionB = (b?.section || "").toString();
          const sectionSort = sectionA.localeCompare(sectionB);
          if (sectionSort !== 0) return sectionSort;
          return (a?.name || "").toString().localeCompare((b?.name || "").toString());
        });

      return (
        <Stack spacing={4}>
          <Text color={mutedText}>
            These categories are used in document upload pages. Choose the section that matches where the category should appear.
          </Text>

          <Flex
            gap={3}
            direction={{ base: "column", md: "row" }}
            align={{ md: "flex-end" }}
            justify="space-between"
          >
            <FormControl isRequired>
              <FormLabel fontSize="sm">Category name</FormLabel>
              <Input
                placeholder="e.g. Policies"
                value={documentCategoryName}
                onChange={(event) => setDocumentCategoryName(event.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Section</FormLabel>
              <Select
                value={documentCategorySection}
                onChange={(event) => setDocumentCategorySection(event.target.value)}
              >
                <option value="companys">Company documents</option>
                <option value="employees">Employee documents</option>
              </Select>
            </FormControl>

            <Flex gap={2} wrap="wrap">
              <Button
                size="sm"
                colorScheme="teal"
                leftIcon={<Icon as={FiPlus} />}
                onClick={handleAddDocumentCategory}
                isLoading={documentCategorySubmitting}
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={loadDocumentCategories}
                isLoading={documentCategoriesLoading}
              >
                Refresh
              </Button>
            </Flex>
          </Flex>

          {documentCategoriesLoading ? (
            <Text color={mutedText}>Loading categories...</Text>
          ) : sortedCategories.length ? (
            <Stack spacing={3}>
              <Text color={mutedText} fontSize="sm">
                Showing {sortedCategories.length} category{sortedCategories.length === 1 ? "" : "ies"}.
              </Text>
              <TableContainer border="1px solid" borderColor={borderColor} borderRadius="md" overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead bg={tableHeadBg}>
                    <Tr>
                      <Th>Section</Th>
                      <Th>Name</Th>
                      <Th textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sortedCategories.map((category) => {
                      const isActing = documentCategoryActionId === category._id;
                      return (
                        <Tr key={category._id}>
                          <Td>
                            <Badge colorScheme={category.section === "employees" ? "purple" : "green"}>
                              {category.section || "-"}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontWeight="semibold">{category.name || "-"}</Text>
                          </Td>
                          <Td>
                            <Flex justify="flex-end" gap={1}>
                              <Tooltip label="Delete">
                                <IconButton
                                  aria-label="Delete category"
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="red"
                                  icon={<Icon as={FiTrash2} />}
                                  onClick={() => handleDeleteDocumentCategory(category)}
                                  isLoading={isActing}
                                />
                              </Tooltip>
                            </Flex>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Stack>
          ) : (
            <Text color={mutedText}>No categories found yet. Add one above.</Text>
          )}
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
            <FormControl flex="1">
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
              <TableContainer border="1px solid" borderColor={borderColor} borderRadius="md" overflowX="auto">
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

    if (section.id === "employer-categories") {
      return (
        <Stack spacing={4}>
          <Flex
            gap={3}
            direction={{ base: "column", md: "row" }}
            align={{ md: "flex-end" }}
            justify="space-between"
          >
            <FormControl isRequired flex="1">
              <FormLabel fontSize="sm">New category</FormLabel>
              <Input
                placeholder="Private"
                value={employerCategoryName}
                onChange={(event) => setEmployerCategoryName(event.target.value)}
              />
            </FormControl>

            <Flex gap={2} wrap="wrap">
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<Icon as={FiPlus} />}
                onClick={handleAddEmployerCategory}
                isLoading={employerCategorySubmitting}
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={loadEmployerCategories}
                isLoading={employerCategoriesLoading}
              >
                Refresh
              </Button>
            </Flex>
          </Flex>

          {employerCategoriesLoading ? (
            <Text color={mutedText}>Loading categories...</Text>
          ) : employerCategories.length ? (
            <Stack spacing={3}>
              {employerCategories.map((category) => {
                const isActing = employerCategoryActionId === category._id;
                return (
                  <Flex
                    key={category._id}
                    align="center"
                    justify="space-between"
                    gap={3}
                    p={3}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    direction={{ base: "column", sm: "row" }}
                  >
                    <Box minW={0}>
                      <Text fontWeight="semibold" noOfLines={1}>
                        {category.name}
                      </Text>
                      <Badge colorScheme={category.active ? "green" : "gray"} variant="subtle" mt={1}>
                        {category.active ? "Active" : "Inactive"}
                      </Badge>
                    </Box>

                    <Flex gap={2} wrap="wrap" justify="flex-end">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleToggleEmployerCategory(category)}
                        isLoading={isActing}
                      >
                        {category.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Tooltip label="Delete">
                        <IconButton
                          aria-label="Delete category"
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          icon={<Icon as={FiTrash2} />}
                          onClick={() => handleDeleteEmployerCategory(category)}
                          isLoading={isActing}
                        />
                      </Tooltip>
                    </Flex>
                  </Flex>
                );
              })}
            </Stack>
          ) : (
            <Text color={mutedText}>No categories yet. Add one above.</Text>
          )}
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
    <Box maxW="7xl" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
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
          width={{ base: "100%", lg: isCollapsed ? "76px" : "280px" }}
          minW={{ base: "100%", lg: isCollapsed ? "76px" : "280px" }}
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
                    width="100%"
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
              width="100%"
            >
              {!isCollapsed && "Log out"}
            </Button>
          </Stack>
        </Box>

        <Stack spacing={6} flex="1" minW={0}>
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
                  <Flex justify="space-between" align="center" direction={{ base: "column", sm: "row" }} gap={2}>
                    <Box>
                      <Heading size="md">{section.title}</Heading>
                      <Text color={mutedText} fontSize="sm" mt={2}>
                        {section.description}
                      </Text>
                    </Box>
                    <Badge colorScheme={section.tone} variant="subtle" fontSize="sm">
                      Admin
                    </Badge>
                  </Flex>
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
            <Button variant="ghost" onClick={closeAddEmployeeModal} mr={3}>
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
            <Button variant="ghost" onClick={closeEditEmployeeModal} mr={3}>
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
            <Button variant="ghost" onClick={closeHoldEmployeeModal} mr={3}>
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
            <Button variant="ghost" onClick={closeDeleteEmployeeModal} mr={3}>
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

      <Modal isOpen={isCreatePackageOpen} onClose={closeCreatePackageModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create package</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <Flex gap={3} direction={{ base: "column", md: "row" }}>
                <FormControl isRequired>
                  <FormLabel>Market</FormLabel>
                  <Select value={packageForm.market} onChange={handlePackageFormChange("market")}>
                    <option value="Local">Local</option>
                    <option value="International">International</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Package number</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    value={packageForm.packageNumber}
                    onChange={handlePackageFormChange("packageNumber")}
                  />
                </FormControl>
              </Flex>

              <FormControl>
                <FormLabel>Price</FormLabel>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  value={packageForm.price}
                  onChange={handlePackageFormChange("price")}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Short description"
                  value={packageForm.description}
                  onChange={handlePackageFormChange("description")}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Services</FormLabel>
                <Textarea
                  placeholder={"One service per line\\nExample:\\n- Candidate screening\\n- Interview scheduling"}
                  value={packageForm.servicesText}
                  onChange={handlePackageFormChange("servicesText")}
                  rows={6}
                />
                <Text fontSize="xs" color={mutedText} mt={2}>
                  Tip: You can enter one service per line (or comma-separated).
                </Text>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeCreatePackageModal} mr={3}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleCreatePackage}
              isLoading={packageSubmitting}
            >
              Create package
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminDashboard;
