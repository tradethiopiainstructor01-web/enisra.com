import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
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
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { STATUS_OPTIONS, formatDate, getStatusMeta, useEmployerData } from "./employerData";

const EmployerEmployees = () => {
  const { jobs, applicants, setApplicants } = useEmployerData();
  const [selectedJobId, setSelectedJobId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");

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
    <Box maxW="7xl" mx="auto">
      <Heading size="lg" mb={6}>
        Employee
      </Heading>
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
        <CardHeader>
          <Stack spacing={2}>
            <Heading size="md">Applicant progress checker</Heading>
            <Text color={mutedText}>
              Showing {activeJobLabel}. Filter by stage or search by name.
            </Text>
          </Stack>
          <Button variant="outline" size="sm" onClick={clearFilters} mt={4}>
            Clear filters
          </Button>
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
    </Box>
  );
};

export default EmployerEmployees;
