import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  Tooltip,
  useColorModeValue,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import {
  FiBriefcase,
  FiClipboard,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiSearch,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { useUserStore } from "../../store/user";
import apiClient from "../../utils/apiClient";

const STORAGE_KEY = "employerDashboard.v1";

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied", color: "blue" },
  { value: "interviewed", label: "Interviewed", color: "orange" },
  { value: "exam", label: "Exam", color: "purple" },
  { value: "started", label: "Started Job", color: "teal" },
  { value: "agreed", label: "Agreed", color: "green" },
  { value: "not_agreed", label: "Not agreed", color: "red" },
];

const NAV_ITEMS = [
  { id: "employer-profile", label: "Profile", icon: FiUser },
  { id: "job-posting", label: "Post", icon: FiClipboard },
  { id: "employee-pipeline", label: "Employee", icon: FiUsers },
];

const DEFAULT_DATA = {
  jobs: [
    {
      id: "job-101",
      title: "Customer Support Specialist",
      department: "Customer Success",
      category: "Customer Support",
      location: "Addis Ababa",
      type: "Full-time",
      salary: "ETB 12,000 - 16,000",
      deadline: "2026-02-15",
      description: "Handle inbound support tickets and support onboarding sessions.",
      postedAt: "2026-01-20T09:30:00.000Z",
    },
    {
      id: "job-102",
      title: "Sales Coordinator",
      department: "Sales",
      category: "Sales",
      location: "Remote",
      type: "Contract",
      salary: "ETB 15,000 - 20,000",
      deadline: "2026-02-05",
      description: "Coordinate lead follow-ups and track pipeline updates.",
      postedAt: "2026-01-22T11:15:00.000Z",
    },
  ],
  applicants: [
    {
      id: "app-201",
      jobId: "job-101",
      name: "Liya Mulu",
      email: "liya.mulu@example.com",
      phone: "+251 911 234 567",
      status: "applied",
      updatedAt: "2026-01-23T13:00:00.000Z",
    },
    {
      id: "app-202",
      jobId: "job-101",
      name: "Dawit Bekele",
      email: "dawit.bekele@example.com",
      phone: "+251 920 882 444",
      status: "interviewed",
      updatedAt: "2026-01-24T16:10:00.000Z",
    },
    {
      id: "app-203",
      jobId: "job-102",
      name: "Selam Alemu",
      email: "selam.alemu@example.com",
      phone: "+251 901 456 789",
      status: "exam",
      updatedAt: "2026-01-25T10:45:00.000Z",
    },
    {
      id: "app-204",
      jobId: "job-102",
      name: "Samuel Tadesse",
      email: "samuel.tadesse@example.com",
      phone: "+251 911 772 334",
      status: "agreed",
      updatedAt: "2026-01-26T09:05:00.000Z",
    },
  ],
};

const getInitialData = () => {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_DATA;
    const parsed = JSON.parse(stored);
    return {
      jobs: Array.isArray(parsed.jobs) && parsed.jobs.length ? parsed.jobs : DEFAULT_DATA.jobs,
      applicants:
        Array.isArray(parsed.applicants) && parsed.applicants.length
          ? parsed.applicants
          : DEFAULT_DATA.applicants,
    };
  } catch (error) {
    console.warn("Failed to read employer dashboard data", error);
    return DEFAULT_DATA;
  }
};

const getStatusMeta = (status) =>
  STATUS_OPTIONS.find((option) => option.value === status) || {
    label: status,
    color: "gray",
  };

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const EmployerDashboard = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const toast = useToast();
  const [jobs, setJobs] = useState(() => getInitialData().jobs);
  const [applicants, setApplicants] = useState(() => getInitialData().applicants);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("employer-profile");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [employerDetails, setEmployerDetails] = useState({
    employerId: "",
    companyName: "",
    industry: "",
    category: "",
    companyLocation: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    packageType: "",
    jobPostingCredits: "",
    contractEndDate: "",
  });
  const [employerCategories, setEmployerCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    department: "",
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

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const sidebarBg = useColorModeValue("white", "gray.800");
  const sidebarBorder = useColorModeValue("gray.200", "gray.700");
  const sidebarHover = useColorModeValue("gray.100", "gray.700");
  const sidebarActiveBg = useColorModeValue("green.50", "green.900");
  const sidebarActiveColor = useColorModeValue("green.700", "green.200");
  const sidebarIconColor = useColorModeValue("gray.600", "gray.300");
  const activeJobBg = useColorModeValue("green.50", "green.900");
  const isMobile = useBreakpointValue({ base: true, md: false });
  const showSidebarLabels = isMobile || !isSidebarCollapsed;
  const sidebarWidth = isSidebarCollapsed ? "72px" : "240px";

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        jobs,
        applicants,
      })
    );
  }, [jobs, applicants]);

  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      if (!currentUser?.token) {
        setDetailsLoading(false);
        return;
      }
      try {
        setDetailsLoading(true);
        const response = await apiClient.get("/employer-details/me");
        const payload = response?.data?.data;
        if (!isMounted) return;
        if (payload) {
          setEmployerDetails({
            employerId: payload.employerId || "",
            companyName: payload.companyName || "",
            industry: payload.industry || "",
            category: payload.category || "",
            companyLocation: payload.companyLocation || "",
            contactPerson: payload.contactPerson || "",
            contactEmail: payload.contactEmail || "",
            contactPhone: payload.contactPhone || "",
            packageType: payload.packageType || "",
            jobPostingCredits: payload.jobPostingCredits ?? "",
            contractEndDate: payload.contractEndDate
              ? payload.contractEndDate.toString().split("T")[0]
              : "",
          });
        }
      } catch (error) {
        if (!isMounted) return;
        if (error?.response?.status !== 404) {
          toast({
            title: "Failed to load employer details",
            description: error?.message || "Please try again later.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } finally {
        if (isMounted) setDetailsLoading(false);
      }
    };

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.token, toast]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");
      try {
        const response = await apiClient.get("/employer-categories");
        const payload = response?.data?.data ?? response?.data ?? [];
        if (!isMounted) return;
        setEmployerCategories(Array.isArray(payload) ? payload : []);
      } catch (error) {
        if (!isMounted) return;
        setEmployerCategories([]);
        const message = error?.message || "Failed to load categories.";
        setCategoriesError(message);
        toast({
          title: "Failed to load categories",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const applicantsForJob = useMemo(() => {
    if (!selectedJobId) return applicants;
    return applicants.filter((applicant) => applicant.jobId === selectedJobId);
  }, [applicants, selectedJobId]);

  const filteredApplicants = useMemo(() => {
    return applicantsForJob.filter((applicant) => {
      const matchesStatus = statusFilter ? applicant.status === statusFilter : true;
      const matchesSearch = searchTerm
        ? [applicant.name, applicant.email, applicant.phone]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [applicantsForJob, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => {
    return STATUS_OPTIONS.reduce((acc, option) => {
      acc[option.value] = applicantsForJob.filter(
        (applicant) => applicant.status === option.value
      ).length;
      return acc;
    }, {});
  }, [applicantsForJob]);

  const jobStats = useMemo(() => {
    const totalJobs = jobs.length;
    const totalApplicants = applicants.length;
    const interviewed = applicants.filter((applicant) => applicant.status === "interviewed").length;
    const started = applicants.filter((applicant) => applicant.status === "started").length;
    return { totalJobs, totalApplicants, interviewed, started };
  }, [jobs, applicants]);

  const handleFormChange = (field) => (event) => {
    setJobForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleEmployerFormChange = (field) => (event) => {
    setEmployerDetails((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleEmployerDetailsSave = async () => {
    const missing = Object.entries(employerDetails).filter(
      ([, value]) => !String(value ?? "").trim()
    );
    if (missing.length) {
      toast({
        title: "Complete employer details",
        description: "Please fill all fields before saving.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setDetailsSaving(true);
      await apiClient.put("/employer-details/me", {
        ...employerDetails,
        jobPostingCredits: Number(employerDetails.jobPostingCredits),
      });
      toast({
        title: "Employer details saved",
        description: "Your company details have been updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to save employer details",
        description: error?.response?.data?.message || error?.message || "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setDetailsSaving(false);
    }
  };

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAddJob = async (event) => {
    event.preventDefault();
    if (
      !jobForm.title.trim() ||
      !jobForm.category.trim() ||
      !jobForm.location.trim() ||
      !jobForm.type.trim()
    ) {
      toast({
        title: "Missing details",
        description: "Please add a job title, category, location, and job type.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      title: jobForm.title.trim(),
      department: jobForm.department.trim(),
      category: jobForm.category.trim(),
      location: jobForm.location.trim(),
      address: jobForm.address.trim(),
      type: jobForm.type.trim(),
      salary: jobForm.salary.trim(),
      deadline: jobForm.deadline || undefined,
      expirationDate: jobForm.expirationDate || undefined,
      description: jobForm.description.trim(),
      flow: jobForm.flow.trim(),
    };

    try {
      setIsPosting(true);
      const response = await apiClient.post('/jobs', payload);
      const savedJob = response?.data?.data ?? response?.data ?? payload;
      const normalizedJob = {
        ...payload,
        ...savedJob,
        id: savedJob.id || savedJob._id || `job-${Date.now()}`,
        postedAt: savedJob.postedAt || savedJob.createdAt || new Date().toISOString(),
      };
      setJobs((prev) => [normalizedJob, ...prev]);
      setSelectedJobId(normalizedJob.id);
      setJobForm({
        title: "",
        department: "",
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

      toast({
        title: "Job posted",
        description: "Your job posting is now visible in the pipeline.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to post job",
        description: error?.message || "Unable to save job to the database.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleStatusUpdate = (applicantId, nextStatus) => {
    setApplicants((prev) =>
      prev.map((applicant) =>
        applicant.id === applicantId
          ? { ...applicant, status: nextStatus, updatedAt: new Date().toISOString() }
          : applicant
      )
    );
  };

  const clearFilters = () => {
    setStatusFilter("");
    setSearchTerm("");
  };

  const activeJobLabel = useMemo(() => {
    if (!selectedJobId) return "All jobs";
    const job = jobs.find((item) => item.id === selectedJobId);
    return job ? job.title : "Selected job";
  }, [jobs, selectedJobId]);

  return (
    <Box bg={bg} minH="100vh">
      <Flex direction={{ base: "column", md: "row" }} align="stretch">
        <Box
          as="aside"
          bg={sidebarBg}
          borderRight={{ base: "none", md: "1px solid" }}
          borderBottom={{ base: "1px solid", md: "none" }}
          borderColor={sidebarBorder}
          width={{ base: "100%", md: sidebarWidth }}
          transition="width 0.2s ease"
          position={{ base: "static", md: "sticky" }}
          top="0"
          minH={{ base: "auto", md: "100vh" }}
          zIndex="1"
        >
          <Flex align="center" justify={showSidebarLabels ? "space-between" : "center"} p={4}>
            {showSidebarLabels && (
              <Text fontWeight="bold" fontSize="sm" color={mutedText}>
                Employer
              </Text>
            )}
            <IconButton
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              icon={isSidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
              size="sm"
              variant="ghost"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              display={{ base: "none", md: "inline-flex" }}
            />
          </Flex>
          <Stack
            spacing={{ base: 2, md: 1 }}
            direction={{ base: "row", md: "column" }}
            px={2}
            pb={4}
            overflowX={{ base: "auto", md: "visible" }}
            flexWrap={{ base: "nowrap", md: "wrap" }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <Tooltip
                  key={item.id}
                  label={item.label}
                  placement="right"
                  isDisabled={showSidebarLabels}
                >
                  <Button
                    variant="ghost"
                    justifyContent={showSidebarLabels ? "flex-start" : "center"}
                    leftIcon={<Icon as={item.icon} boxSize={5} />}
                    iconSpacing={showSidebarLabels ? 3 : 0}
                    color={isActive ? sidebarActiveColor : sidebarIconColor}
                    bg={isActive ? sidebarActiveBg : "transparent"}
                    _hover={{ bg: isActive ? sidebarActiveBg : sidebarHover }}
                    _active={{ bg: sidebarActiveBg }}
                    onClick={() => handleSectionClick(item.id)}
                    width={{ base: "auto", md: "100%" }}
                    minW={{ base: "140px", md: "auto" }}
                    size="sm"
                  >
                    {showSidebarLabels && item.label}
                  </Button>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>
        <Box flex="1" py={{ base: 8, lg: 12 }} px={{ base: 4, md: 6 }}>
          <Container maxW="7xl">
            <Stack spacing={{ base: 8, lg: 10 }}>
              <Box id="employer-profile">
                <Flex
                  direction={{ base: "column", md: "row" }}
                  justify="space-between"
                  align={{ base: "flex-start", md: "center" }}
                  gap={4}
                >
                  <Box>
                    <Heading size="xl" mb={2}>
                      Employer Dashboard
                    </Heading>
                    <Text color={mutedText}>
                      Welcome{currentUser?.fullName ? `, ${currentUser.fullName}` : ""}. Post jobs
                      and monitor applicants in one place.
                    </Text>
                  </Box>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="green"
                    onClick={() => handleSectionClick("job-posting")}
                    width={{ base: "100%", sm: "auto" }}
                  >
                    Post a job
                  </Button>
                </Flex>

                <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" mt={6}>
                  <CardHeader>
                    <Heading size="md">Profile</Heading>
                    <Text color={mutedText} mt={1}>
                      Employer account overview.
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <Box>
                        <Text fontSize="sm" color={mutedText}>
                          Company / Name
                        </Text>
                        <Text fontWeight="semibold">
                          {currentUser?.fullName || currentUser?.username || "Employer"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={mutedText}>
                          Email
                        </Text>
                        <Text fontWeight="semibold">
                          {currentUser?.email || "employer@gmail.com"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={mutedText}>
                          Role
                        </Text>
                        <Text fontWeight="semibold">
                          {currentUser?.displayRole || currentUser?.role || "employer"}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" mt={6}>
                  <CardHeader>
                    <Heading size="md">Employer Form</Heading>
                    <Text color={mutedText} mt={1}>
                      Provide your company details to continue.
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <Stack spacing={4}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Employer ID</FormLabel>
                          <Input
                            placeholder="EMP-0001"
                            value={employerDetails.employerId}
                            onChange={handleEmployerFormChange("employerId")}
                            isDisabled={detailsLoading}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Company Name</FormLabel>
                          <Input
                            placeholder="Enisra"
                            value={employerDetails.companyName}
                            onChange={handleEmployerFormChange("companyName")}
                            isDisabled={detailsLoading}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Industry</FormLabel>
                          <Input
                            placeholder="Talent & Placement"
                            value={employerDetails.industry}
                            onChange={handleEmployerFormChange("industry")}
                            isDisabled={detailsLoading}
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Category</FormLabel>
                          <Select
                            placeholder={
                              categoriesLoading
                                ? "Loading categories..."
                                : employerCategories.length
                                ? "Select category"
                                : "No categories available"
                            }
                            value={employerDetails.category}
                            onChange={handleEmployerFormChange("category")}
                            isDisabled={detailsLoading || categoriesLoading}
                          >
                            {employerDetails.category &&
                            !employerCategories.some(
                              (item) =>
                                (item?.name || "").toString().toLowerCase() ===
                                employerDetails.category.toString().toLowerCase()
                            ) ? (
                              <option value={employerDetails.category}>
                                {employerDetails.category} (inactive)
                              </option>
                            ) : null}
                            {employerCategories.map((item) => (
                              <option key={item._id || item.name} value={item.name}>
                                {item.name}
                              </option>
                            ))}
                          </Select>
                          {categoriesError ? (
                            <Text fontSize="xs" color="red.500" mt={2}>
                              {categoriesError}
                            </Text>
                          ) : !categoriesLoading && employerCategories.length === 0 ? (
                            <Text fontSize="xs" color={mutedText} mt={2}>
                              No categories configured yet. Ask an admin to add categories in the Admin Dashboard.
                            </Text>
                          ) : null}
                        </FormControl>
                        <FormControl>
                          <FormLabel>Company Location</FormLabel>
                          <Input
                            placeholder="Addis Ababa"
                            value={employerDetails.companyLocation}
                            onChange={handleEmployerFormChange("companyLocation")}
                            isDisabled={detailsLoading}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Contact Person</FormLabel>
                          <Input
                            placeholder="Full name"
                            value={employerDetails.contactPerson}
                            onChange={handleEmployerFormChange("contactPerson")}
                            isDisabled={detailsLoading}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Contact Email</FormLabel>
                          <Input
                            type="email"
                            placeholder="name@company.com"
                            value={employerDetails.contactEmail}
                            onChange={handleEmployerFormChange("contactEmail")}
                            isDisabled={detailsLoading}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Contact Phone</FormLabel>
                          <Input
                            type="tel"
                            placeholder="+251 9xx xxx xxx"
                            value={employerDetails.contactPhone}
                            onChange={handleEmployerFormChange("contactPhone")}
                            isDisabled={detailsLoading}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Package Type</FormLabel>
                          <Input
                            placeholder="Premium"
                            value={employerDetails.packageType}
                            onChange={handleEmployerFormChange("packageType")}
                            isDisabled={detailsLoading}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Job Posting Credits</FormLabel>
                          <Input
                            type="number"
                            placeholder="0"
                            value={employerDetails.jobPostingCredits}
                            onChange={handleEmployerFormChange("jobPostingCredits")}
                            isDisabled={detailsLoading}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Contract End Date</FormLabel>
                          <Input
                            type="date"
                            value={employerDetails.contractEndDate}
                            onChange={handleEmployerFormChange("contractEndDate")}
                            isDisabled={detailsLoading}
                          />
                        </FormControl>
                      </SimpleGrid>
                      <Button
                        colorScheme="green"
                        onClick={handleEmployerDetailsSave}
                        isLoading={detailsSaving}
                        isDisabled={detailsLoading}
                        alignSelf="flex-start"
                      >
                        Save Employer Details
                      </Button>
                    </Stack>
                  </CardBody>
                </Card>
              </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <HStack spacing={3} align="center">
                  <Box color="green.500">
                    <FiBriefcase />
                  </Box>
                  <Box>
                    <Text fontSize="sm" color={mutedText}>
                      Active jobs
                    </Text>
                    <Heading size="md">{jobStats.totalJobs}</Heading>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <HStack spacing={3} align="center">
                  <Box color="blue.500">
                    <FiUsers />
                  </Box>
                  <Box>
                    <Text fontSize="sm" color={mutedText}>
                      Total applicants
                    </Text>
                    <Heading size="md">{jobStats.totalApplicants}</Heading>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <HStack spacing={3} align="center">
                  <Box color="orange.500">
                    <FiClipboard />
                  </Box>
                  <Box>
                    <Text fontSize="sm" color={mutedText}>
                      Interviewed
                    </Text>
                    <Heading size="md">{jobStats.interviewed}</Heading>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <HStack spacing={3} align="center">
                  <Box color="teal.500">
                    <FiFilter />
                  </Box>
                  <Box>
                    <Text fontSize="sm" color={mutedText}>
                      Started job
                    </Text>
                    <Heading size="md">{jobStats.started}</Heading>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            <Card id="job-posting" bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <Heading size="md">Job posting</Heading>
                <Text color={mutedText} mt={1}>
                  Share a new opening to start receiving applicants.
                </Text>
              </CardHeader>
              <CardBody>
                <Stack spacing={4} as="form" onSubmit={handleAddJob}>
                  <FormControl isRequired>
                    <FormLabel>Job title</FormLabel>
                    <Input
                      placeholder="Customer Success Specialist"
                      value={jobForm.title}
                      onChange={handleFormChange("title")}
                    />
                  </FormControl>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Department</FormLabel>
                      <Input
                        placeholder="Customer Success"
                        value={jobForm.department}
                        onChange={handleFormChange("department")}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Category</FormLabel>
                      <Input
                        placeholder="Customer Support"
                        value={jobForm.category}
                        onChange={handleFormChange("category")}
                      />
                    </FormControl>
                  </SimpleGrid>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Location</FormLabel>
                      <Input
                        placeholder="Addis Ababa"
                        value={jobForm.location}
                        onChange={handleFormChange("location")}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Address</FormLabel>
                      <Input
                        placeholder="Street / office address"
                        value={jobForm.address}
                        onChange={handleFormChange("address")}
                      />
                    </FormControl>
                  </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Job type</FormLabel>
                    <Select
                      placeholder="Select type"
                      value={jobForm.type}
                      onChange={handleFormChange("type")}
                    >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Remote">Remote</option>
                        <option value="Internship">Internship</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Salary range</FormLabel>
                      <Input
                        placeholder="ETB 15,000 - 20,000"
                        value={jobForm.salary}
                        onChange={handleFormChange("salary")}
                      />
                    </FormControl>
                  </SimpleGrid>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Application deadline</FormLabel>
                      <Input
                        type="date"
                        value={jobForm.deadline}
                        onChange={handleFormChange("deadline")}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Job post expiration date</FormLabel>
                      <Input
                        type="date"
                        value={jobForm.expirationDate}
                        onChange={handleFormChange("expirationDate")}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Hiring flow</FormLabel>
                      <Select
                        placeholder="Select flow"
                        value={jobForm.flow || ""}
                        onChange={handleFormChange("flow")}
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
                      value={jobForm.description}
                      onChange={handleFormChange("description")}
                      minH="120px"
                    />
                  </FormControl>
                  <Button leftIcon={<FiPlus />} colorScheme="green" type="submit" isLoading={isPosting}>
                    Post job
                  </Button>
                </Stack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <Heading size="md">Open roles</Heading>
                <Text color={mutedText} mt={1}>
                  Select a job to see the applicants in its pipeline.
                </Text>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Filter by job</FormLabel>
                    <Select
                      placeholder="All jobs"
                      value={selectedJobId}
                      onChange={(event) => setSelectedJobId(event.target.value)}
                    >
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <Divider />

                  <Stack spacing={3}>
                    {jobs.map((job) => {
                      const applicantCount = applicants.filter(
                        (applicant) => applicant.jobId === job.id
                      ).length;
                      const isActive = selectedJobId === job.id;
                      return (
                        <Card
                          key={job.id}
                          variant="outline"
                          borderColor={isActive ? "green.400" : borderColor}
                          bg={isActive ? activeJobBg : "transparent"}
                          cursor="pointer"
                          onClick={() => setSelectedJobId(job.id)}
                        >
                          <CardBody>
                            <Stack spacing={2}>
                              <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                                <Heading size="sm">{job.title}</Heading>
                                <Badge colorScheme="green">{applicantCount} applicants</Badge>
                              </Flex>
                              <Text fontSize="sm" color={mutedText}>
                                {job.category || job.department || "General"} -{' '}
                                {job.location}
                                {job.address ? `, ${job.address}` : ''} - {job.type}
                              </Text>
                              <Text fontSize="xs" color={mutedText}>
                                Posted {formatDate(job.postedAt)}
                              </Text>
                            </Stack>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Card id="employee-pipeline" bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} gap={4}>
                <Box>
                  <Heading size="md">Applicant progress checker</Heading>
                  <Text color={mutedText} mt={1}>
                    Showing {activeJobLabel}. Filter by stage or search by name.
                  </Text>
                </Box>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              <Stack spacing={6}>
                <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
                  {STATUS_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={statusFilter === option.value ? "solid" : "outline"}
                      colorScheme={option.color}
                      onClick={() =>
                        setStatusFilter((prev) => (prev === option.value ? "" : option.value))
                      }
                    >
                      {option.label} ({statusCounts[option.value] || 0})
                    </Button>
                  ))}
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Search applicants</FormLabel>
                    <Input
                      placeholder="Name, email, or phone"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Stage filter</FormLabel>
                    <Select
                      placeholder="All stages"
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Job filter</FormLabel>
                    <Select
                      placeholder="All jobs"
                      value={selectedJobId}
                      onChange={(event) => setSelectedJobId(event.target.value)}
                    >
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {isMobile ? (
                  <Stack spacing={4}>
                    {filteredApplicants.map((applicant) => {
                      const statusMeta = getStatusMeta(applicant.status);
                      const jobTitle =
                        jobs.find((job) => job.id === applicant.jobId)?.title || "Unknown";
                      return (
                        <Card key={applicant.id} variant="outline" borderColor={borderColor}>
                          <CardBody>
                            <Stack spacing={3}>
                              <Flex justify="space-between" align="flex-start" gap={3}>
                                <Box>
                                  <Text fontWeight="semibold">{applicant.name}</Text>
                                  <Text fontSize="sm" color={mutedText}>
                                    {jobTitle}
                                  </Text>
                                </Box>
                                <Badge colorScheme={statusMeta.color}>{statusMeta.label}</Badge>
                              </Flex>
                              <Box>
                                <Text fontSize="sm">{applicant.email}</Text>
                                <Text fontSize="xs" color={mutedText}>
                                  {applicant.phone}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontSize="xs" color={mutedText} mb={1}>
                                  Stage
                                </Text>
                                <Select
                                  size="sm"
                                  value={applicant.status}
                                  onChange={(event) =>
                                    handleStatusUpdate(applicant.id, event.target.value)
                                  }
                                >
                                  {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </Select>
                              </Box>
                              <Text fontSize="xs" color={mutedText}>
                                Last update: {formatDate(applicant.updatedAt)}
                              </Text>
                            </Stack>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </Stack>
                ) : (
                  <TableContainer overflowX="auto">
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Applicant</Th>
                          <Th>Contact</Th>
                          <Th>Job</Th>
                          <Th>Stage</Th>
                          <Th>Last update</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredApplicants.map((applicant) => {
                          const statusMeta = getStatusMeta(applicant.status);
                          const jobTitle =
                            jobs.find((job) => job.id === applicant.jobId)?.title || "Unknown";
                          return (
                            <Tr key={applicant.id}>
                              <Td>
                                <Text fontWeight="semibold">{applicant.name}</Text>
                              </Td>
                              <Td>
                                <Text fontSize="sm">{applicant.email}</Text>
                                <Text fontSize="xs" color={mutedText}>
                                  {applicant.phone}
                                </Text>
                              </Td>
                              <Td>
                                <Text fontSize="sm">{jobTitle}</Text>
                              </Td>
                              <Td>
                                <Select
                                  size="sm"
                                  value={applicant.status}
                                  onChange={(event) =>
                                    handleStatusUpdate(applicant.id, event.target.value)
                                  }
                                >
                                  {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </Select>
                                <Badge mt={2} colorScheme={statusMeta.color}>
                                  {statusMeta.label}
                                </Badge>
                              </Td>
                              <Td>{formatDate(applicant.updatedAt)}</Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}

                {!filteredApplicants.length && (
                  <Box textAlign="center" py={10} color={mutedText}>
                    <Box fontSize="2xl">
                      <FiSearch />
                    </Box>
                    <Text mt={2}>No applicants found for this filter.</Text>
                  </Box>
                )}
              </Stack>
            </CardBody>
          </Card>
            </Stack>
          </Container>
        </Box>
      </Flex>
    </Box>
  );
};

export default EmployerDashboard;
