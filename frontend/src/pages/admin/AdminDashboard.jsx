import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  CheckboxGroup,
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
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
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
  Wrap,
  WrapItem,
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
  FiSettings,
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
  const [postedJobs, setPostedJobs] = useState([]);
  const [postedJobsLoading, setPostedJobsLoading] = useState(false);
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
  const [adminJobForm, setAdminJobForm] = useState({
    title: "",
    department: "",
    contactEmail: "",
    category: "",
    location: "",
    address: "",
    type: "",
    salary: "",
    deadline: "",
    expirationDate: "",
    description: "",
    flow: "",
  });
  const [adminJobSubmitting, setAdminJobSubmitting] = useState(false);
  const [editJobForm, setEditJobForm] = useState({
    title: "",
    department: "",
    contactEmail: "",
    category: "",
    location: "",
    address: "",
    type: "",
    salary: "",
    deadline: "",
    expirationDate: "",
    description: "",
    flow: "",
  });
  const [selectedJobId, setSelectedJobId] = useState(null);
  const {
    isOpen: isEditJobOpen,
    onOpen: onEditJobOpen,
    onClose: onEditJobClose,
  } = useDisclosure();
  const [editJobSubmitting, setEditJobSubmitting] = useState(false);
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

  // Column visibility state for Employee Directory
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    phone: true,
    jobTitle: true,
    status: true,
    role: true,
    employeeId: false,
    department: false,
    position: false,
    username: false,
    fullName: false,
    firstName: false,
    middleName: false,
    lastName: false,
    gender: false,
    dateOfBirth: false,
    nationality: false,
    maritalStatus: false,
    nationalIdOrPassportNumber: false,
    altEmail: false,
    altPhone: false,
    emergencyContactName: false,
    emergencyContactPhone: false,
    currentAddress: false,
    city: false,
    country: false,
    location: false,
    workLocation: false,
    reportingManager: false,
    employmentType: false,
    employmentStatus: false,
    education: false,
    educationLevel: false,
    primarySkill: false,
    yearsOfExperience: false,
    currentLocation: false,
    desiredJobTitle: false,
    salary: false,
    salaryDetails: false,
    createdAt: false,
    updatedAt: false,
    notes: false,
    points: false,
    rating: false,
    requiresApproval: false,
  });

  // All available columns for Employee Directory
  const employeeColumns = [
    { key: "name", label: "Name", category: "Basic Info" },
    { key: "fullName", label: "Full Name", category: "Basic Info" },
    { key: "firstName", label: "First Name", category: "Basic Info" },
    { key: "middleName", label: "Middle Name", category: "Basic Info" },
    { key: "lastName", label: "Last Name", category: "Basic Info" },
    { key: "email", label: "Email", category: "Contact" },
    { key: "altEmail", label: "Alternate Email", category: "Contact" },
    { key: "phone", label: "Phone", category: "Contact" },
    { key: "altPhone", label: "Alternate Phone", category: "Contact" },
    { key: "username", label: "Username", category: "Account" },
    { key: "employeeId", label: "Employee ID", category: "Employment" },
    { key: "jobTitle", label: "Job Title", category: "Employment" },
    { key: "department", label: "Department", category: "Employment" },
    { key: "position", label: "Position", category: "Employment" },
    { key: "workLocation", label: "Work Location", category: "Employment" },
    { key: "reportingManager", label: "Reporting Manager", category: "Employment" },
    { key: "employmentType", label: "Employment Type", category: "Employment" },
    { key: "employmentStatus", label: "Employment Status", category: "Employment" },
    { key: "role", label: "Role", category: "Account" },
    { key: "status", label: "Status", category: "Account" },
    { key: "gender", label: "Gender", category: "Personal" },
    { key: "dateOfBirth", label: "Date of Birth", category: "Personal" },
    { key: "nationality", label: "Nationality", category: "Personal" },
    { key: "maritalStatus", label: "Marital Status", category: "Personal" },
    { key: "nationalIdOrPassportNumber", label: "ID/Passport", category: "Personal" },
    { key: "currentAddress", label: "Current Address", category: "Location" },
    { key: "city", label: "City", category: "Location" },
    { key: "country", label: "Country", category: "Location" },
    { key: "location", label: "Location", category: "Location" },
    { key: "currentLocation", label: "Current Location", category: "Location" },
    { key: "emergencyContactName", label: "Emergency Contact Name", category: "Emergency" },
    { key: "emergencyContactPhone", label: "Emergency Contact Phone", category: "Emergency" },
    { key: "education", label: "Education", category: "Education" },
    { key: "educationLevel", label: "Education Level", category: "Education" },
    { key: "primarySkill", label: "Primary Skill", category: "Skills" },
    { key: "yearsOfExperience", label: "Years of Experience", category: "Skills" },
    { key: "desiredJobTitle", label: "Desired Job Title", category: "Career" },
    { key: "salary", label: "Salary", category: "Financial" },
    { key: "salaryDetails", label: "Salary Details", category: "Financial" },
    { key: "points", label: "Points", category: "Performance" },
    { key: "rating", label: "Rating", category: "Performance" },
    { key: "requiresApproval", label: "Requires Approval", category: "Account" },
    { key: "notes", label: "Notes", category: "Additional" },
    { key: "createdAt", label: "Created At", category: "Timestamps" },
    { key: "updatedAt", label: "Updated At", category: "Timestamps" },
  ];

  const handleColumnVisibilityChange = (columnKey, isVisible) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: isVisible,
    }));
  };

  const handleSelectAllColumns = () => {
    const allVisible = Object.values(visibleColumns).every((v) => v);
    const newVisibility = {};
    employeeColumns.forEach((col) => {
      newVisibility[col.key] = !allVisible;
    });
    setVisibleColumns(newVisibility);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const formatSalaryDetails = (salaryDetails) => {
    if (!salaryDetails || typeof salaryDetails !== "object") return "-";
    const parts = [];
    if (salaryDetails.basicSalary) parts.push(`Basic: ${salaryDetails.basicSalary}`);
    if (salaryDetails.allowances) parts.push(`Allowances: ${salaryDetails.allowances}`);
    if (salaryDetails.paymentMethod) parts.push(`Method: ${salaryDetails.paymentMethod}`);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  const normalizeRoleValue = (value = "") =>
    value?.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  // "Employees" here means all staff accounts (non-admin, non-employer).
  // This makes "Manage Employee Accounts" work even when users have roles like HR/IT/Sales/etc.
  const EXCLUDED_STAFF_ROLES = new Set(["admin", "employer", "employers"]);
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
      description: "Dashboard overview with statistics and progress metrics for employers and employees.",
      icon: FiBarChart2,
  FiSettings,
      tone: "blue",
    },
    {
      id: "employer-management",
      title: "Employer Management",
      description: "Comprehensive management of employer accounts, profiles, and settings.",
      icon: FiUsers,
      tone: "blue",
    },
    {
      id: "employee-management",
      title: "Employee Management",
      description: "Manage employee accounts, profiles, and track their progress.",
      icon: FiUser,
      tone: "orange",
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
      title: "Employer Approval",
      description: "Review and approve pending employer account requests.",
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
      title: "Employee Directory",
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

  const loadPostedJobs = async () => {
    setPostedJobsLoading(true);
    try {
      const response = await apiClient.get("/jobs", { params: { limit: 200 } });
      const payload = response?.data;
      const jobsArray = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
      const approved = jobsArray.filter((job) => job?.approved === true || job?.status === "approved");
      setPostedJobs(approved);
    } catch (error) {
      setPostedJobs([]);
      console.error("Failed to load posted jobs", error);
    } finally {
      setPostedJobsLoading(false);
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
          !EXCLUDED_STAFF_ROLES.has(normalizedRole) &&
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
    loadPostedJobs();
    loadEmployers();
    loadAllEmployers();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (activeSectionId === "employee" && employees.length === 0 && !employeesLoading) {
      loadEmployees();
    }
    if (activeSectionId === "employee-management") {
      // Always load employees when accessing employee management section
      if (employees.length === 0 && !employeesLoading) {
        loadEmployees();
      }
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
    if (activeSectionId === "job-post" && !postedJobsLoading) {
      loadPostedJobs();
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
      await loadPostedJobs();
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
      setPostedJobs((prev) => prev.filter((job) => job._id !== jobId));
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

  const handleDeleteJob = async (jobId) => {
    if (!jobId) return;
    const confirmed = window.confirm("Delete this job post? This cannot be undone.");
    if (!confirmed) return;
    try {
      await apiClient.delete(`/jobs/${jobId}`);
      setPostedJobs((prev) => prev.filter((job) => job._id !== jobId));
      setPendingJobs((prev) => prev.filter((job) => job._id !== jobId));
      toast({
        title: "Job deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to delete job",
        description: error?.response?.data?.message || error?.message || "Unable to delete job.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openEditJobModal = (job) => {
    if (!job) return;
    setSelectedJobId(job._id);
    setEditJobForm({
      title: job.title || "",
      department: job.department || "",
      contactEmail: job.contactEmail || job.email || "",
      category: job.category || "",
      location: job.location || "",
      address: job.address || "",
      type: job.type || "",
      salary: job.salary || "",
      deadline: job.deadline ? job.deadline.slice(0, 10) : "",
      expirationDate: job.expirationDate ? job.expirationDate.slice(0, 10) : "",
      description: job.description || "",
      flow: job.flow || "",
    });
    onEditJobOpen();
  };

  const closeEditJobModal = () => {
    setSelectedJobId(null);
    setEditJobForm({
      title: "",
      department: "",
      contactEmail: "",
      category: "",
      location: "",
      address: "",
      type: "",
      salary: "",
      deadline: "",
      expirationDate: "",
      description: "",
      flow: "",
    });
    onEditJobClose();
  };

  const handleEditJobChange = (field) => (event) => {
    setEditJobForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleEditJob = async () => {
    if (
      !selectedJobId ||
      !editJobForm.title.trim() ||
      !editJobForm.category.trim() ||
      !editJobForm.location.trim() ||
      !editJobForm.type.trim() ||
      !editJobForm.contactEmail.trim()
    ) {
      toast({
        title: "Missing details",
        description: "Please add job title, category, location, type, and contact email.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      title: editJobForm.title.trim(),
      department: editJobForm.department.trim(),
      contactEmail: editJobForm.contactEmail.trim(),
      category: editJobForm.category.trim(),
      location: editJobForm.location.trim(),
      address: editJobForm.address.trim(),
      type: editJobForm.type.trim(),
      salary: editJobForm.salary.trim(),
      deadline: editJobForm.deadline || undefined,
      expirationDate: editJobForm.expirationDate || undefined,
      description: editJobForm.description.trim(),
      flow: editJobForm.flow.trim(),
    };

    try {
      setEditJobSubmitting(true);
      await apiClient.patch(`/jobs/${selectedJobId}`, payload);
      toast({
        title: "Job updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      closeEditJobModal();
      await loadPostedJobs();
    } catch (error) {
      toast({
        title: "Failed to update job",
        description: error?.response?.data?.message || error?.message || "Unable to update job.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEditJobSubmitting(false);
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

  const handleAdminJobChange = (field) => (event) => {
    setAdminJobForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetAdminJobForm = () => {
    setAdminJobForm({
      title: "",
      department: "",
      contactEmail: "",
      category: "",
      location: "",
      address: "",
      type: "",
      salary: "",
      deadline: "",
      expirationDate: "",
      description: "",
      flow: "",
    });
  };

  const handleAdminPostJob = async () => {
    if (
      !adminJobForm.title.trim() ||
      !adminJobForm.category.trim() ||
      !adminJobForm.location.trim() ||
      !adminJobForm.type.trim() ||
      !adminJobForm.contactEmail.trim()
    ) {
      toast({
        title: "Missing details",
        description: "Please add job title, category, location, type, and contact email.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      title: adminJobForm.title.trim(),
      department: adminJobForm.department.trim(),
      contactEmail: adminJobForm.contactEmail.trim(),
      category: adminJobForm.category.trim(),
      location: adminJobForm.location.trim(),
      address: adminJobForm.address.trim(),
      type: adminJobForm.type.trim(),
      salary: adminJobForm.salary.trim(),
      deadline: adminJobForm.deadline || undefined,
      expirationDate: adminJobForm.expirationDate || undefined,
      description: adminJobForm.description.trim(),
      flow: adminJobForm.flow.trim(),
    };

    try {
      setAdminJobSubmitting(true);
      await apiClient.post("/jobs", payload);
      toast({
        title: "Job submitted",
        description: "Job posted by admin. It will appear in pending until approved.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      resetAdminJobForm();
      await loadPendingJobs();
    } catch (error) {
      toast({
        title: "Failed to post job",
        description: error?.response?.data?.message || error?.message || "Unable to save job.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setAdminJobSubmitting(false);
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
    if (section.id === "employer-management") {
      return (
        <Stack spacing={6}>
          <Text color={mutedText} fontSize="sm">
            Comprehensive management of employer accounts, profiles, and dashboard settings.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <Heading size="md">Employer Dashboard Management</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <Button
                    leftIcon={<Icon as={FiUsers} />}
                    colorScheme="blue"
                    onClick={() => setActiveSectionId("employer")}
                    width="100%"
                  >
                    Manage Employer Accounts
                  </Button>
                  <Button
                    leftIcon={<Icon as={FiBriefcase} />}
                    colorScheme="green"
                    onClick={() => setActiveSectionId("job-post")}
                    width="100%"
                  >
                    Review Job Posts
                  </Button>
                  <Button
                    leftIcon={<Icon as={FiTag} />}
                    colorScheme="teal"
                    onClick={() => setActiveSectionId("employer-categories")}
                    width="100%"
                  >
                    Manage Categories
                  </Button>
                </Stack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <Heading size="md">Employer Statistics</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <Stat>
                    <StatLabel>Total Employers</StatLabel>
                    <StatNumber>{employerStats.total}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Pending Approval</StatLabel>
                    <StatNumber color="orange.500">{employerStats.pending}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Approved</StatLabel>
                    <StatNumber color="green.500">{employerStats.approved}</StatNumber>
                  </Stat>
                  <Box>
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="semibold">Approval Rate</Text>
                      <Text fontSize="sm">{employerStats.approvalRate}%</Text>
                    </Flex>
                    <Progress value={employerStats.approvalRate} colorScheme="green" size="sm" borderRadius="md" />
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Heading size="md">Quick Actions</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                <Button
                  leftIcon={<Icon as={FiCheckCircle} />}
                  colorScheme="green"
                  variant="outline"
                  onClick={() => {
                    if (pendingEmployers.length > 0) {
                      handleApproveEmployer(pendingEmployers[0]._id);
                    }
                  }}
                  isDisabled={pendingEmployers.length === 0}
                >
                  Approve Next Pending
                </Button>
                <Button
                  leftIcon={<Icon as={FiUsers} />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={loadAllEmployers}
                  isLoading={employersStatsLoading}
                >
                  Refresh Employer List
                </Button>
                <Button
                  leftIcon={<Icon as={FiBarChart2} />}
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => setActiveSectionId("overview")}
                >
                  View Full Statistics
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>
        </Stack>
      );
    }

    if (section.id === "employee-management") {
      return (
        <Stack spacing={6}>
          <Text color={mutedText} fontSize="sm">
            Comprehensive management of employee accounts, profiles, and dashboard settings.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <Heading size="md">Employee Dashboard Management</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <Button
                    leftIcon={<Icon as={FiUser} />}
                    colorScheme="orange"
                    onClick={() => setActiveSectionId("employee")}
                    width="100%"
                  >
                    Manage Employee Accounts
                  </Button>
                  <Button
                    leftIcon={<Icon as={FiPlus} />}
                    colorScheme="green"
                    onClick={onAddEmployeeOpen}
                    width="100%"
                  >
                    Add New Employee
                  </Button>
                  <Button
                    leftIcon={<Icon as={FiDownload} />}
                    colorScheme="blue"
                    onClick={() => handleExportEmployees(employees)}
                    isDisabled={employees.length === 0}
                    width="100%"
                  >
                    Export Employee List
                  </Button>
                </Stack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <Heading size="md">Employee Statistics</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <Stat>
                    <StatLabel>Total Employees</StatLabel>
                    <StatNumber>{employeeStats.total}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Active</StatLabel>
                    <StatNumber color="green.500">{employeeStats.active}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Inactive</StatLabel>
                    <StatNumber color="red.500">{employeeStats.inactive}</StatNumber>
                  </Stat>
                  <Box>
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="semibold">Active Rate</Text>
                      <Text fontSize="sm">{employeeStats.activeRate}%</Text>
                    </Flex>
                    <Progress value={employeeStats.activeRate} colorScheme="green" size="sm" borderRadius="md" />
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Heading size="md">Quick Actions</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                <Button
                  leftIcon={<Icon as={FiPlus} />}
                  colorScheme="green"
                  variant="outline"
                  onClick={onAddEmployeeOpen}
                >
                  Add Employee
                </Button>
                <Button
                  leftIcon={<Icon as={FiUser} />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={loadEmployees}
                  isLoading={employeesLoading}
                >
                  Refresh Employee List
                </Button>
                <Button
                  leftIcon={<Icon as={FiBarChart2} />}
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => setActiveSectionId("overview")}
                >
                  View Full Statistics
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>
        </Stack>
      );
    }

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
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Flex justify="space-between" align="center" gap={3} wrap="wrap">
                <Box>
                  <Heading size="md">Create a job post</Heading>
                  <Text color={mutedText} fontSize="sm" mt={1}>
                    Post a new role without leaving the admin dashboard.
                  </Text>
                </Box>
                <Badge colorScheme="blue" variant="subtle">
                  Admin quick post
                </Badge>
              </Flex>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Job title</FormLabel>
                    <Input
                      placeholder="e.g., Senior Frontend Engineer"
                      value={adminJobForm.title}
                      onChange={handleAdminJobChange("title")}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Department</FormLabel>
                    <Input
                      placeholder="Product, Engineering, HR"
                      value={adminJobForm.department}
                      onChange={handleAdminJobChange("department")}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Contact email</FormLabel>
                    <Input
                      type="email"
                      placeholder="hiring@company.com"
                      value={adminJobForm.contactEmail}
                      onChange={handleAdminJobChange("contactEmail")}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Input
                      placeholder="Engineering, Marketing"
                      value={adminJobForm.category}
                      onChange={handleAdminJobChange("category")}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Location</FormLabel>
                    <Input
                      placeholder="Addis Ababa, Remote"
                      value={adminJobForm.location}
                      onChange={handleAdminJobChange("location")}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Address</FormLabel>
                    <Input
                      placeholder="Office or onsite address"
                      value={adminJobForm.address}
                      onChange={handleAdminJobChange("address")}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Job type</FormLabel>
                    <Select
                      placeholder="Select type"
                      value={adminJobForm.type}
                      onChange={handleAdminJobChange("type")}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Temporary">Temporary</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Salary range</FormLabel>
                    <Input
                      placeholder="ETB 15,000 - 20,000"
                      value={adminJobForm.salary}
                      onChange={handleAdminJobChange("salary")}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Application deadline</FormLabel>
                    <Input
                      type="date"
                      value={adminJobForm.deadline}
                      onChange={handleAdminJobChange("deadline")}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Post expiration date</FormLabel>
                    <Input
                      type="date"
                      value={adminJobForm.expirationDate}
                      onChange={handleAdminJobChange("expirationDate")}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Hiring flow</FormLabel>
                    <Select
                      placeholder="Select flow"
                      value={adminJobForm.flow}
                      onChange={handleAdminJobChange("flow")}
                    >
                      <option value="Interview only">Interview only</option>
                      <option value="Exam + Interview">Exam + Interview</option>
                      <option value="Multi-stage">Multi-stage</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Job description</FormLabel>
                  <Textarea
                    placeholder="Describe responsibilities, qualifications, and benefits."
                    value={adminJobForm.description}
                    onChange={handleAdminJobChange("description")}
                    minH="120px"
                  />
                </FormControl>

                <Flex justify="flex-end">
                  <Button
                    leftIcon={<Icon as={FiPlus} />}
                    colorScheme="blue"
                    onClick={handleAdminPostJob}
                    isLoading={adminJobSubmitting}
                  >
                    Post job
                  </Button>
                </Flex>
              </Stack>
            </CardBody>
          </Card>

          <Stack spacing={5}>
            <Box>
              <Heading size="sm" mb={3}>
                Pending jobs
              </Heading>
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
                      {job.category} - {job.location} - {job.type}
                    </Text>
                    <Flex gap={2} mt={3} wrap="wrap">
                      <Button size="sm" colorScheme="green" onClick={() => handleApproveJob(job._id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectJob(job._id)}>
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        leftIcon={<Icon as={FiTrash2} />}
                        onClick={() => handleDeleteJob(job._id)}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Box>
                ))
              ) : (
                <Text color={mutedText}>No pending jobs.</Text>
              )}
            </Box>

            <Divider />

            <Box>
              <Heading size="sm" mb={3}>
                Posted jobs
              </Heading>
              {postedJobsLoading ? (
                <Text color={mutedText}>Loading posted jobs...</Text>
              ) : postedJobs.length ? (
                postedJobs.map((job) => (
                  <Box
                    key={job._id}
                    p={4}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                  >
                    <Flex justify="space-between" align="center" mb={2} gap={3} wrap="wrap">
                      <Box>
                        <Heading size="sm">{job.title}</Heading>
                        <Text fontSize="sm" color={mutedText}>
                          {job.category} - {job.location} - {job.type}
                        </Text>
                      </Box>
                      <Badge colorScheme="green">Posted</Badge>
                    </Flex>
                    <Flex gap={2} mt={3} wrap="wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Icon as={FiEdit} />}
                        onClick={() => openEditJobModal(job)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        leftIcon={<Icon as={FiTrash2} />}
                        onClick={() => handleDeleteJob(job._id)}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Box>
                ))
              ) : (
                <Text color={mutedText}>No posted jobs yet.</Text>
              )}
            </Box>
          </Stack>
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
          user?.firstName,
          user?.lastName,
          user?.username,
          user?.phone,
          user?.email,
          user?.role,
          user?.jobTitle,
          user?.employeeId,
          user?.department,
          user?.position,
          user?.nationality,
          user?.city,
          user?.country,
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

      // Group columns by category
      const columnsByCategory = employeeColumns.reduce((acc, col) => {
        if (!acc[col.category]) acc[col.category] = [];
        acc[col.category].push(col);
        return acc;
      }, {});

      // Get visible column keys
      const visibleColumnKeys = employeeColumns
        .filter((col) => visibleColumns[col.key])
        .map((col) => col.key);

      return (
        <Stack spacing={4}>
          {/* Column Visibility Toggle */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader pb={2}>
              <Flex justify="space-between" align="center">
                <Heading size="sm">Column Visibility</Heading>
                <Popover placement="bottom-end">
                  <PopoverTrigger>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Icon as={FiSettings} />}
                    >
                      Configure Columns
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent maxW="400px" maxH="500px" overflowY="auto">
                    <PopoverBody>
                      <Stack spacing={4}>
                        <Flex justify="space-between" align="center">
                          <Text fontWeight="semibold" fontSize="sm">
                            Show/Hide Columns
                          </Text>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={handleSelectAllColumns}
                          >
                            {Object.values(visibleColumns).every((v) => v) ? "Hide All" : "Show All"}
                          </Button>
                        </Flex>
                        <Divider />
                        {Object.entries(columnsByCategory).map(([category, cols]) => (
                          <Box key={category}>
                            <Text fontWeight="semibold" fontSize="xs" color={mutedText} mb={2}>
                              {category}
                            </Text>
                            <Wrap spacing={2}>
                              {cols.map((col) => (
                                <WrapItem key={col.key}>
                                  <Checkbox
                                    isChecked={visibleColumns[col.key]}
                                    onChange={(e) =>
                                      handleColumnVisibilityChange(col.key, e.target.checked)
                                    }
                                    size="sm"
                                  >
                                    <Text fontSize="xs">{col.label}</Text>
                                  </Checkbox>
                                </WrapItem>
                              ))}
                            </Wrap>
                          </Box>
                        ))}
                      </Stack>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              <Text fontSize="xs" color={mutedText} mb={2}>
                Showing {visibleColumnKeys.length} of {employeeColumns.length} columns
              </Text>
              <Wrap spacing={2}>
                {visibleColumnKeys.slice(0, 10).map((key) => {
                  const col = employeeColumns.find((c) => c.key === key);
                  return col ? (
                    <WrapItem key={key}>
                      <Badge colorScheme="blue" fontSize="xs">
                        {col.label}
                      </Badge>
                    </WrapItem>
                  ) : null;
                })}
                {visibleColumnKeys.length > 10 && (
                  <WrapItem>
                    <Badge colorScheme="gray" fontSize="xs">
                      +{visibleColumnKeys.length - 10} more
                    </Badge>
                  </WrapItem>
                )}
              </Wrap>
            </CardBody>
          </Card>

          {/* Search and Actions */}
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
                  placeholder="Search by name, email, phone, ID, department..."
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
                Showing {sortedEmployees.length} employee{sortedEmployees.length === 1 ? "" : "s"} with {visibleColumnKeys.length} visible column{visibleColumnKeys.length === 1 ? "" : "s"}.
              </Text>
              <TableContainer border="1px solid" borderColor={borderColor} borderRadius="md" overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead bg={tableHeadBg}>
                    <Tr>
                      {visibleColumns.name && <Th>Name</Th>}
                      {visibleColumns.fullName && <Th>Full Name</Th>}
                      {visibleColumns.firstName && <Th>First Name</Th>}
                      {visibleColumns.middleName && <Th>Middle Name</Th>}
                      {visibleColumns.lastName && <Th>Last Name</Th>}
                      {visibleColumns.email && <Th>Email</Th>}
                      {visibleColumns.altEmail && <Th>Alt Email</Th>}
                      {visibleColumns.phone && <Th>Phone</Th>}
                      {visibleColumns.altPhone && <Th>Alt Phone</Th>}
                      {visibleColumns.username && <Th>Username</Th>}
                      {visibleColumns.employeeId && <Th>Employee ID</Th>}
                      {visibleColumns.jobTitle && <Th>Job Title</Th>}
                      {visibleColumns.department && <Th>Department</Th>}
                      {visibleColumns.position && <Th>Position</Th>}
                      {visibleColumns.workLocation && <Th>Work Location</Th>}
                      {visibleColumns.reportingManager && <Th>Reporting Manager</Th>}
                      {visibleColumns.employmentType && <Th>Employment Type</Th>}
                      {visibleColumns.employmentStatus && <Th>Employment Status</Th>}
                      {visibleColumns.role && <Th>Role</Th>}
                      {visibleColumns.status && <Th>Status</Th>}
                      {visibleColumns.gender && <Th>Gender</Th>}
                      {visibleColumns.dateOfBirth && <Th>Date of Birth</Th>}
                      {visibleColumns.nationality && <Th>Nationality</Th>}
                      {visibleColumns.maritalStatus && <Th>Marital Status</Th>}
                      {visibleColumns.nationalIdOrPassportNumber && <Th>ID/Passport</Th>}
                      {visibleColumns.currentAddress && <Th>Current Address</Th>}
                      {visibleColumns.city && <Th>City</Th>}
                      {visibleColumns.country && <Th>Country</Th>}
                      {visibleColumns.location && <Th>Location</Th>}
                      {visibleColumns.currentLocation && <Th>Current Location</Th>}
                      {visibleColumns.emergencyContactName && <Th>Emergency Contact</Th>}
                      {visibleColumns.emergencyContactPhone && <Th>Emergency Phone</Th>}
                      {visibleColumns.education && <Th>Education</Th>}
                      {visibleColumns.educationLevel && <Th>Education Level</Th>}
                      {visibleColumns.primarySkill && <Th>Primary Skill</Th>}
                      {visibleColumns.yearsOfExperience && <Th>Years Exp.</Th>}
                      {visibleColumns.desiredJobTitle && <Th>Desired Job</Th>}
                      {visibleColumns.salary && <Th>Salary</Th>}
                      {visibleColumns.salaryDetails && <Th>Salary Details</Th>}
                      {visibleColumns.points && <Th>Points</Th>}
                      {visibleColumns.rating && <Th>Rating</Th>}
                      {visibleColumns.requiresApproval && <Th>Requires Approval</Th>}
                      {visibleColumns.notes && <Th>Notes</Th>}
                      {visibleColumns.createdAt && <Th>Created At</Th>}
                      {visibleColumns.updatedAt && <Th>Updated At</Th>}
                      <Th textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sortedEmployees.map((user) => (
                      <Tr key={user._id}>
                        {visibleColumns.name && (
                          <Td>
                            <Text fontWeight="semibold">
                              {user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Employee"}
                            </Text>
                          </Td>
                        )}
                        {visibleColumns.fullName && <Td><Text fontSize="sm">{user.fullName || "-"}</Text></Td>}
                        {visibleColumns.firstName && <Td><Text fontSize="sm">{user.firstName || "-"}</Text></Td>}
                        {visibleColumns.middleName && <Td><Text fontSize="sm">{user.middleName || "-"}</Text></Td>}
                        {visibleColumns.lastName && <Td><Text fontSize="sm">{user.lastName || "-"}</Text></Td>}
                        {visibleColumns.email && (
                          <Td>
                            <Text fontSize="sm" color={mutedText}>
                              {user.email || "No email"}
                            </Text>
                          </Td>
                        )}
                        {visibleColumns.altEmail && <Td><Text fontSize="sm">{user.altEmail || "-"}</Text></Td>}
                        {visibleColumns.phone && (
                          <Td>
                            <Text fontSize="sm" color={mutedText}>
                              {getEmployeePhone(user) || "N/A"}
                            </Text>
                          </Td>
                        )}
                        {visibleColumns.altPhone && <Td><Text fontSize="sm">{user.altPhone || "-"}</Text></Td>}
                        {visibleColumns.username && <Td><Text fontSize="sm">{user.username || "-"}</Text></Td>}
                        {visibleColumns.employeeId && <Td><Text fontSize="sm" fontWeight="semibold">{user.employeeId || "-"}</Text></Td>}
                        {visibleColumns.jobTitle && (
                          <Td>
                            <Text fontSize="sm" color={mutedText}>
                              {user.jobTitle || "-"}
                            </Text>
                          </Td>
                        )}
                        {visibleColumns.department && <Td><Text fontSize="sm">{user.department || "-"}</Text></Td>}
                        {visibleColumns.position && <Td><Text fontSize="sm">{user.position || "-"}</Text></Td>}
                        {visibleColumns.workLocation && <Td><Text fontSize="sm">{user.workLocation || "-"}</Text></Td>}
                        {visibleColumns.reportingManager && <Td><Text fontSize="sm">{user.reportingManager || "-"}</Text></Td>}
                        {visibleColumns.employmentType && (
                          <Td>
                            <Badge colorScheme="blue" fontSize="xs">
                              {user.employmentType || "-"}
                            </Badge>
                          </Td>
                        )}
                        {visibleColumns.employmentStatus && <Td><Text fontSize="sm">{user.employmentStatus || "-"}</Text></Td>}
                        {visibleColumns.role && (
                          <Td>
                            <Badge colorScheme="purple" fontSize="xs">
                              {user.role || "-"}
                            </Badge>
                          </Td>
                        )}
                        {visibleColumns.status && (
                          <Td>
                            <Badge colorScheme={user.status === "active" ? "green" : "red"}>
                              {user.status || "unknown"}
                            </Badge>
                          </Td>
                        )}
                        {visibleColumns.gender && (
                          <Td>
                            <Badge colorScheme="teal" fontSize="xs">
                              {user.gender || "-"}
                            </Badge>
                          </Td>
                        )}
                        {visibleColumns.dateOfBirth && <Td><Text fontSize="sm">{formatDate(user.dateOfBirth)}</Text></Td>}
                        {visibleColumns.nationality && <Td><Text fontSize="sm">{user.nationality || "-"}</Text></Td>}
                        {visibleColumns.maritalStatus && <Td><Text fontSize="sm">{user.maritalStatus || "-"}</Text></Td>}
                        {visibleColumns.nationalIdOrPassportNumber && <Td><Text fontSize="sm">{user.nationalIdOrPassportNumber || "-"}</Text></Td>}
                        {visibleColumns.currentAddress && <Td><Text fontSize="sm" noOfLines={1}>{user.currentAddress || "-"}</Text></Td>}
                        {visibleColumns.city && <Td><Text fontSize="sm">{user.city || "-"}</Text></Td>}
                        {visibleColumns.country && <Td><Text fontSize="sm">{user.country || "-"}</Text></Td>}
                        {visibleColumns.location && <Td><Text fontSize="sm">{user.location || "-"}</Text></Td>}
                        {visibleColumns.currentLocation && <Td><Text fontSize="sm">{user.currentLocation || "-"}</Text></Td>}
                        {visibleColumns.emergencyContactName && <Td><Text fontSize="sm">{user.emergencyContactName || "-"}</Text></Td>}
                        {visibleColumns.emergencyContactPhone && <Td><Text fontSize="sm">{user.emergencyContactPhone || "-"}</Text></Td>}
                        {visibleColumns.education && <Td><Text fontSize="sm">{user.education || "-"}</Text></Td>}
                        {visibleColumns.educationLevel && <Td><Text fontSize="sm">{user.educationLevel || "-"}</Text></Td>}
                        {visibleColumns.primarySkill && <Td><Text fontSize="sm">{user.primarySkill || "-"}</Text></Td>}
                        {visibleColumns.yearsOfExperience && <Td><Text fontSize="sm">{user.yearsOfExperience || "-"}</Text></Td>}
                        {visibleColumns.desiredJobTitle && <Td><Text fontSize="sm">{user.desiredJobTitle || "-"}</Text></Td>}
                        {visibleColumns.salary && (
                          <Td>
                            <Text fontSize="sm" fontWeight="semibold">
                              {user.salary ? `$${user.salary.toLocaleString()}` : "-"}
                            </Text>
                          </Td>
                        )}
                        {visibleColumns.salaryDetails && (
                          <Td>
                            <Tooltip label={formatSalaryDetails(user.salaryDetails)}>
                              <Text fontSize="sm" noOfLines={1}>
                                {formatSalaryDetails(user.salaryDetails)}
                              </Text>
                            </Tooltip>
                          </Td>
                        )}
                        {visibleColumns.points && (
                          <Td>
                            <Badge colorScheme="yellow">{user.points || 0}</Badge>
                          </Td>
                        )}
                        {visibleColumns.rating && (
                          <Td>
                            <Badge colorScheme="orange">{user.rating || 0}</Badge>
                          </Td>
                        )}
                        {visibleColumns.requiresApproval && (
                          <Td>
                            <Badge colorScheme={user.requiresApproval ? "orange" : "gray"}>
                              {user.requiresApproval ? "Yes" : "No"}
                            </Badge>
                          </Td>
                        )}
                        {visibleColumns.notes && (
                          <Td>
                            <Tooltip label={user.notes || "-"}>
                              <Text fontSize="sm" noOfLines={1} maxW="200px">
                                {user.notes || "-"}
                              </Text>
                            </Tooltip>
                          </Td>
                        )}
                        {visibleColumns.createdAt && <Td><Text fontSize="sm">{formatDate(user.createdAt)}</Text></Td>}
                        {visibleColumns.updatedAt && <Td><Text fontSize="sm">{formatDate(user.updatedAt)}</Text></Td>}
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

      <Modal isOpen={isEditJobOpen} onClose={closeEditJobModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit job post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Job title</FormLabel>
                  <Input
                    value={editJobForm.title}
                    onChange={handleEditJobChange("title")}
                    placeholder="Job title"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Input
                    value={editJobForm.department}
                    onChange={handleEditJobChange("department")}
                    placeholder="Department"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Contact email</FormLabel>
                  <Input
                    type="email"
                    value={editJobForm.contactEmail}
                    onChange={handleEditJobChange("contactEmail")}
                    placeholder="contact@company.com"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Input
                    value={editJobForm.category}
                    onChange={handleEditJobChange("category")}
                    placeholder="Category"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Location</FormLabel>
                  <Input
                    value={editJobForm.location}
                    onChange={handleEditJobChange("location")}
                    placeholder="City, Remote"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Input
                    value={editJobForm.address}
                    onChange={handleEditJobChange("address")}
                    placeholder="Office address"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Job type</FormLabel>
                  <Select value={editJobForm.type} onChange={handleEditJobChange("type")} placeholder="Select type">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Temporary">Temporary</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Salary range</FormLabel>
                  <Input
                    value={editJobForm.salary}
                    onChange={handleEditJobChange("salary")}
                    placeholder="ETB 15,000 - 20,000"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Application deadline</FormLabel>
                  <Input
                    type="date"
                    value={editJobForm.deadline}
                    onChange={handleEditJobChange("deadline")}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Post expiration date</FormLabel>
                  <Input
                    type="date"
                    value={editJobForm.expirationDate}
                    onChange={handleEditJobChange("expirationDate")}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Hiring flow</FormLabel>
                  <Select
                    value={editJobForm.flow}
                    onChange={handleEditJobChange("flow")}
                    placeholder="Select flow"
                  >
                    <option value="Interview only">Interview only</option>
                    <option value="Exam + Interview">Exam + Interview</option>
                    <option value="Multi-stage">Multi-stage</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Job description</FormLabel>
                <Textarea
                  value={editJobForm.description}
                  onChange={handleEditJobChange("description")}
                  placeholder="Describe responsibilities, qualifications, and benefits."
                  minH="120px"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeEditJobModal}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleEditJob} isLoading={editJobSubmitting}>
              Save changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
