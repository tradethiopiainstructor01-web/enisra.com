import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { formatDate, useEmployerData } from "./employerData";
import apiClient from "../../utils/apiClient";

const EmployerPostJob = () => {
  const toast = useToast();
  const { jobs, setJobs, applicants } = useEmployerData();
  const [selectedJobId, setSelectedJobId] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);
  const [partnerSubmissions, setPartnerSubmissions] = useState([]);
  const [partnerForm, setPartnerForm] = useState({
    name: "",
    logoUrl: "",
    website: "",
  });
  const [jobForm, setJobForm] = useState({
    title: "",
    department: "",
    category: "",
    location: "",
    type: "",
    salary: "",
    deadline: "",
    description: "",
    flow: "",
  });

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const activeJobBg = useColorModeValue("green.50", "green.900");

  const loadPartnerSubmissions = async () => {
    setPartnersLoading(true);
    try {
      const response = await apiClient.get("/partners/mine");
      const payload = response?.data?.data ?? response?.data ?? [];
      setPartnerSubmissions(Array.isArray(payload) ? payload : []);
    } catch (error) {
      toast({
        title: "Failed to load company submissions",
        description: error?.message || "Unable to load your company submissions.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPartnersLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerSubmissions();
  }, []);

  const handleFormChange = (field) => (event) => {
    setJobForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePartnerChange = (field) => (event) => {
    setPartnerForm((prev) => ({ ...prev, [field]: event.target.value }));
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
      type: jobForm.type.trim(),
      salary: jobForm.salary.trim(),
      deadline: jobForm.deadline || undefined,
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

  const handleSubmitPartner = async (event) => {
    event.preventDefault();
    if (!partnerForm.name.trim() || !partnerForm.logoUrl.trim()) {
      toast({
        title: "Missing details",
        description: "Please add a company name and logo URL.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmittingPartner(true);
      await apiClient.post("/partners", {
        name: partnerForm.name.trim(),
        logoUrl: partnerForm.logoUrl.trim(),
        website: partnerForm.website.trim(),
      });
      setPartnerForm({ name: "", logoUrl: "", website: "" });
      await loadPartnerSubmissions();
      toast({
        title: "Company submitted",
        description: "Your company is now waiting for admin approval.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to submit company",
        description: error?.message || "Unable to send company for approval.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingPartner(false);
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
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
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
                              {job.category || job.department || "General"} - {job.location} - {job.type}
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

      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" mt={8}>
        <CardHeader>
          <Heading size="md">Companies worked with us</Heading>
          <Text color={mutedText} mt={1}>
            Submit a partner company for approval. Approved companies appear on the home page.
          </Text>
        </CardHeader>
        <CardBody>
          <Stack spacing={6}>
            <Stack spacing={4} as="form" onSubmit={handleSubmitPartner}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Company name</FormLabel>
                  <Input
                    placeholder="Company name"
                    value={partnerForm.name}
                    onChange={handlePartnerChange("name")}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Logo URL</FormLabel>
                  <Input
                    placeholder="https://..."
                    value={partnerForm.logoUrl}
                    onChange={handlePartnerChange("logoUrl")}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Website</FormLabel>
                  <Input
                    placeholder="https://..."
                    value={partnerForm.website}
                    onChange={handlePartnerChange("website")}
                  />
                </FormControl>
              </SimpleGrid>
              <Button colorScheme="green" type="submit" isLoading={isSubmittingPartner}>
                Submit company
              </Button>
            </Stack>

            <Divider />

            <Box>
              <Heading size="sm" mb={3}>
                Your submissions
              </Heading>
              <Stack spacing={3}>
                {partnersLoading ? (
                  <Text color={mutedText}>Loading submissions...</Text>
                ) : partnerSubmissions.length ? (
                  partnerSubmissions.map((company) => (
                    <Flex
                      key={company._id}
                      align="center"
                      justify="space-between"
                      p={3}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="md"
                    >
                      <Box>
                        <Text fontWeight="semibold">{company.name}</Text>
                        <Text fontSize="sm" color={mutedText}>
                          {company.website || "Website not provided"}
                        </Text>
                      </Box>
                      <Badge colorScheme={company.approved ? "green" : "orange"}>
                        {company.approved ? "Approved" : "Pending"}
                      </Badge>
                    </Flex>
                  ))
                ) : (
                  <Text color={mutedText}>No company submissions yet.</Text>
                )}
              </Stack>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default EmployerPostJob;
