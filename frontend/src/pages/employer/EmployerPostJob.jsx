import { useState } from "react";
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

const EmployerPostJob = () => {
  const toast = useToast();
  const { jobs, setJobs, applicants } = useEmployerData();
  const [selectedJobId, setSelectedJobId] = useState("");
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

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const activeJobBg = useColorModeValue("green.50", "green.900");

  const handleFormChange = (field) => (event) => {
    setJobForm((prev) => ({ ...prev, [field]: event.target.value }));
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
    </Box>
  );
};

export default EmployerPostJob;
