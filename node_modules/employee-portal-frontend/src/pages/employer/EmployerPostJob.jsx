import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { formatDate } from "./employerData";
import apiClient from "../../utils/apiClient";

const EmployerPostJob = () => {
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showJobForm, setShowJobForm] = useState(true);
  const [jobForm, setJobForm] = useState({
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

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const activeJobBg = useColorModeValue("green.50", "green.900");

  const loadMyJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const response = await apiClient.get("/jobs/mine");
      const payload = response?.data?.data ?? response?.data ?? [];
      setJobs(Array.isArray(payload) ? payload : []);
    } catch (error) {
      toast({
        title: "Failed to load jobs",
        description: error?.message || "Unable to load your jobs.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMyJobs();
  }, [loadMyJobs]);

  const pendingJobs = useMemo(
    () => jobs.filter((job) => job?.active !== false && job?.approved !== true),
    [jobs]
  );

  const postedJobs = useMemo(
    () => jobs.filter((job) => job?.active !== false && job?.approved === true),
    [jobs]
  );

  const rejectedJobs = useMemo(
    () => jobs.filter((job) => job?.active === false && job?.approved !== true),
    [jobs]
  );

  const handleFormChange = (field) => (event) => {
    setJobForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleAddJob = async (event) => {
    event.preventDefault();
    if (
      !jobForm.title.trim() ||
      !jobForm.category.trim() ||
      !jobForm.location.trim() ||
      !jobForm.type.trim() ||
      !jobForm.contactEmail.trim()
    ) {
      toast({
        title: "Missing details",
        description: "Please add a job title, category, location, job type, and contact email.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      title: jobForm.title.trim(),
      department: jobForm.department.trim(),
      contactEmail: jobForm.contactEmail.trim(),
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
      await apiClient.post("/jobs", payload);
      setJobForm({
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

      toast({
        title: "Job submitted",
        description: "Your job is pending admin approval. Once approved, it will move to Posted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setShowJobForm(false);
      await loadMyJobs();
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

  return (
    <Box maxW="7xl" mx="auto">
      <Heading size="lg" mb={6}>
        Post
      </Heading>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Flex justify="space-between" align="center" gap={3} wrap="wrap">
              <Box>
                <Heading size="md">Job posting</Heading>
                <Text color={mutedText} mt={1}>
                  Share a new opening to start receiving applicants.
                </Text>
              </Box>
              {!showJobForm ? (
                <Button size="sm" colorScheme="green" onClick={() => setShowJobForm(true)}>
                  Post a job
                </Button>
              ) : null}
            </Flex>
          </CardHeader>
          <CardBody>
            {showJobForm ? (
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
                <FormControl isRequired>
                  <FormLabel>Contact Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="hr@example.com"
                    value={jobForm.contactEmail}
                    onChange={handleFormChange("contactEmail")}
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
                    value={jobForm.flow}
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
            ) : (
              <Text color={mutedText}>Job form hidden after submit. Click “Post a job” to open it again.</Text>
            )}
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md">Your job posts</Heading>
            <Text color={mutedText} mt={1}>
              Jobs start in Pending. After admin approval, they appear in Posted.
            </Text>
          </CardHeader>
          <CardBody>
            <Tabs variant="enclosed" colorScheme="green" isFitted>
              <TabList>
                <Tab>Pending ({pendingJobs.length})</Tab>
                <Tab>Posted ({postedJobs.length})</Tab>
                <Tab>Rejected ({rejectedJobs.length})</Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0} pt={4}>
                  {jobsLoading ? (
                    <Text color={mutedText}>Loading jobs...</Text>
                  ) : pendingJobs.length ? (
                    <Stack spacing={3}>
                      {pendingJobs.map((job) => (
                        <Card
                          key={job._id}
                          variant="outline"
                          borderColor={borderColor}
                          bg={activeJobBg}
                        >
                          <CardBody>
                            <Stack spacing={2}>
                              <Flex justify="space-between" align="center" gap={3} wrap="wrap">
                                <Heading size="sm">{job.title}</Heading>
                                <Badge colorScheme="orange">Pending</Badge>
                              </Flex>
                              <Text fontSize="sm" color={mutedText}>
                                {job.category || job.department || "General"} - {job.location}
                                {job.address ? `, ${job.address}` : ""} - {job.type}
                              </Text>
                              <Text fontSize="xs" color={mutedText}>
                                Submitted {formatDate(job.postedAt || job.createdAt)}
                              </Text>
                            </Stack>
                          </CardBody>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Text color={mutedText}>No pending jobs.</Text>
                  )}
                </TabPanel>

                <TabPanel px={0} pt={4}>
                  {jobsLoading ? (
                    <Text color={mutedText}>Loading jobs...</Text>
                  ) : postedJobs.length ? (
                    <Stack spacing={3}>
                      {postedJobs.map((job) => (
                        <Card key={job._id} variant="outline" borderColor={borderColor}>
                          <CardBody>
                            <Stack spacing={2}>
                              <Flex justify="space-between" align="center" gap={3} wrap="wrap">
                                <Heading size="sm">{job.title}</Heading>
                                <Badge colorScheme="green">Posted</Badge>
                              </Flex>
                              <Text fontSize="sm" color={mutedText}>
                                {job.category || job.department || "General"} - {job.location}
                                {job.address ? `, ${job.address}` : ""} - {job.type}
                              </Text>
                              <Text fontSize="xs" color={mutedText}>
                                Approved {formatDate(job.approvedAt || job.updatedAt || job.postedAt)}
                              </Text>
                            </Stack>
                          </CardBody>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Text color={mutedText}>No posted jobs yet.</Text>
                  )}
                </TabPanel>

                <TabPanel px={0} pt={4}>
                  {jobsLoading ? (
                    <Text color={mutedText}>Loading jobs...</Text>
                  ) : rejectedJobs.length ? (
                    <Stack spacing={3}>
                      {rejectedJobs.map((job) => (
                        <Card key={job._id} variant="outline" borderColor={borderColor}>
                          <CardBody>
                            <Stack spacing={2}>
                              <Flex justify="space-between" align="center" gap={3} wrap="wrap">
                                <Heading size="sm">{job.title}</Heading>
                                <Badge colorScheme="red">Rejected</Badge>
                              </Flex>
                              <Text fontSize="sm" color={mutedText}>
                                {job.category || job.department || "General"} - {job.location}
                                {job.address ? `, ${job.address}` : ""} - {job.type}
                              </Text>
                              <Text fontSize="xs" color={mutedText}>
                                Rejected {formatDate(job.updatedAt || job.postedAt || job.createdAt)}
                              </Text>
                            </Stack>
                          </CardBody>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Text color={mutedText}>No rejected jobs.</Text>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </SimpleGrid>

    </Box>
  );
};

export default EmployerPostJob;
