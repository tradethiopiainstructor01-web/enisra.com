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
  const [jobForm, setJobForm] = useState({
    title: "",
    department: "",
    location: "",
    type: "",
    salary: "",
    deadline: "",
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

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAddJob = (event) => {
    event.preventDefault();
    if (!jobForm.title.trim() || !jobForm.location.trim() || !jobForm.type.trim()) {
      toast({
        title: "Missing details",
        description: "Please add a job title, location, and employment type.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newJob = {
      id: `job-${Date.now()}`,
      title: jobForm.title.trim(),
      department: jobForm.department.trim(),
      location: jobForm.location.trim(),
      type: jobForm.type.trim(),
      salary: jobForm.salary.trim(),
      deadline: jobForm.deadline,
      description: jobForm.description.trim(),
      flow: jobForm.flow.trim(),
      postedAt: new Date().toISOString(),
    };

    setJobs((prev) => [newJob, ...prev]);
    setSelectedJobId(newJob.id);
    setJobForm({
      title: "",
      department: "",
      location: "",
      type: "",
      salary: "",
      deadline: "",
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
            />
          </Flex>
          <Stack spacing={1} px={2} pb={4}>
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
                    width="100%"
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
                      <FormLabel>Location</FormLabel>
                      <Input
                        placeholder="Addis Ababa"
                        value={jobForm.location}
                        onChange={handleFormChange("location")}
                      />
                    </FormControl>
                  </SimpleGrid>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Employment type</FormLabel>
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
                  <Button leftIcon={<FiPlus />} colorScheme="green" type="submit">
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
                              <Flex justify="space-between" align="center">
                                <Heading size="sm">{job.title}</Heading>
                                <Badge colorScheme="green">{applicantCount} applicants</Badge>
                              </Flex>
                              <Text fontSize="sm" color={mutedText}>
                                {job.department || "General"} - {job.location} - {job.type}
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

                <TableContainer>
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
