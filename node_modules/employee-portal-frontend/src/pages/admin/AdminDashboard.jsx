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
  SimpleGrid,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import apiClient from "../../utils/apiClient";

const AdminDashboard = () => {
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");

  const [pendingJobs, setPendingJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [employersLoading, setEmployersLoading] = useState(false);

  const [partnerCompanies, setPartnerCompanies] = useState([]);
  const [pendingPartners, setPendingPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(false);

  const [partnerForm, setPartnerForm] = useState({
    name: "",
    logoUrl: "",
    website: "",
  });

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

  const loadPartners = async () => {
    setPartnersLoading(true);
    try {
      const [approvedRes, pendingRes] = await Promise.all([
        apiClient.get("/partners"),
        apiClient.get("/partners/pending"),
      ]);
      const approved = approvedRes?.data?.data ?? approvedRes?.data ?? [];
      const pending = pendingRes?.data?.data ?? pendingRes?.data ?? [];
      setPartnerCompanies(Array.isArray(approved) ? approved : []);
      setPendingPartners(Array.isArray(pending) ? pending : []);
    } catch (error) {
      toast({
        title: "Failed to load partner companies",
        description: error?.message || "Unable to load partner companies.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPartnersLoading(false);
    }
  };

  useEffect(() => {
    loadPendingJobs();
    loadEmployers();
    loadPartners();
  }, []);

  const handlePartnerChange = (field) => (event) => {
    setPartnerForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreatePartner = async () => {
    if (!partnerForm.name.trim() || !partnerForm.logoUrl.trim()) {
      toast({
        title: "Missing details",
        description: "Company name and logo URL are required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await apiClient.post("/partners", {
        name: partnerForm.name.trim(),
        logoUrl: partnerForm.logoUrl.trim(),
        website: partnerForm.website.trim(),
        approved: true,
      });
      setPartnerForm({ name: "", logoUrl: "", website: "" });
      loadPartners();
      toast({
        title: "Company added",
        description: "Partner company posted successfully.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to add company",
        description: error?.message || "Unable to save company.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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

  const handleApprovePartner = async (companyId) => {
    try {
      await apiClient.patch(`/partners/${companyId}/approve`);
      setPendingPartners((prev) => prev.filter((company) => company._id !== companyId));
      loadPartners();
      toast({
        title: "Company approved",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to approve company",
        description: error?.message || "Unable to approve company.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemovePartner = async (companyId) => {
    try {
      await apiClient.delete(`/partners/${companyId}`);
      setPartnerCompanies((prev) => prev.filter((company) => company._id !== companyId));
      toast({
        title: "Company removed",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to remove company",
        description: error?.message || "Unable to remove company.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="7xl" mx="auto">
      <Heading size="lg" mb={6}>
        Admin Dashboard
      </Heading>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md">Job Approvals</Heading>
            <Text color={mutedText} mt={1}>
              Review and approve job posts submitted by employers.
            </Text>
          </CardHeader>
          <CardBody>
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
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md">Employer Approvals</Heading>
            <Text color={mutedText} mt={1}>
              Activate employer accounts waiting for approval.
            </Text>
          </CardHeader>
          <CardBody>
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
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" mb={6}>
        <CardHeader>
          <Heading size="md">Companies Worked With Us</Heading>
          <Text color={mutedText} mt={1}>
            Add new partner companies and manage approvals.
          </Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Company name</FormLabel>
              <Input
                placeholder="Company name"
                value={partnerForm.name}
                onChange={handlePartnerChange("name")}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Logo URL</FormLabel>
              <Input
                placeholder="https://..."
                value={partnerForm.logoUrl}
                onChange={handlePartnerChange("logoUrl")}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Website (optional)</FormLabel>
              <Input
                placeholder="https://..."
                value={partnerForm.website}
                onChange={handlePartnerChange("website")}
              />
            </FormControl>
          </SimpleGrid>
          <Button colorScheme="green" onClick={handleCreatePartner}>
            Add Company
          </Button>

          <Divider my={6} />

          <Heading size="sm" mb={3}>
            Approved Companies
          </Heading>
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Website</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {partnersLoading ? (
                  <Tr>
                    <Td colSpan={3} color={mutedText}>
                      Loading companies...
                    </Td>
                  </Tr>
                ) : partnerCompanies.length ? (
                  partnerCompanies.map((company) => (
                    <Tr key={company._id}>
                      <Td>{company.name}</Td>
                      <Td>{company.website || "-"}</Td>
                      <Td textAlign="right">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleRemovePartner(company._id)}
                        >
                          Remove
                        </Button>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={3} color={mutedText}>
                      No approved companies.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>

          <Divider my={6} />

          <Heading size="sm" mb={3}>
            Pending Companies
          </Heading>
          <Stack spacing={3}>
            {pendingPartners.length ? (
              pendingPartners.map((company) => (
                <Flex
                  key={company._id}
                  justify="space-between"
                  align="center"
                  p={3}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  <Text>{company.name}</Text>
                  <Button
                    size="xs"
                    colorScheme="green"
                    onClick={() => handleApprovePartner(company._id)}
                  >
                    Approve
                  </Button>
                </Flex>
              ))
            ) : (
              <Text color={mutedText}>No pending companies.</Text>
            )}
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
