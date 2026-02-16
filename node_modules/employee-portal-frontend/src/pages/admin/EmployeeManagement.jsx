import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Flex,
  Button,
} from '@chakra-ui/react';
import { FiSearch, FiPlus, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { useUserStore } from '../../store/user';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import EmployeeProfileListView from '../../components/admin/EmployeeProfileListView';

const EmployeeManagement = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedText = useColorModeValue('gray.600', 'gray.300');
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeActionLoading, setEmployeeActionLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);

  // Normalize role value for comparison
  const normalizeRoleValue = (value = "") =>
    value?.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  // Employee role set
  const EMPLOYEE_ROLE_SET = new Set(["employee"]);
  
  // Function to get employee phone
  const getEmployeePhone = (user) => user?.phone || user?.username || "";

  // Load employees function
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

  // Handle export employees
  const handleExportEmployees = (rows) => {
    // This would implement Excel export functionality
    // For now, just showing a toast
    toast({
      title: "Export initiated",
      description: `Exporting ${rows.length} employees.`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // Handle edit employee
  const openEditEmployeeModal = (employee) => {
    setSelectedEmployee(employee);
    // In a real implementation, this would open a modal
    console.log('Edit employee:', employee);
  };

  // Handle hold employee
  const openHoldEmployeeModal = (employee) => {
    setSelectedEmployee(employee);
    // In a real implementation, this would open a modal
    console.log('Hold employee:', employee);
  };

  // Handle delete employee
  const openDeleteEmployeeModal = (employee) => {
    setSelectedEmployee(employee);
    // In a real implementation, this would open a modal
    console.log('Delete employee:', employee);
  };

  // Load employees on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  // Filter employees based on search
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

  return (
    <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="lg" p={6}>
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

        <EmployeeProfileListView
          employees={filteredEmployees}
          loading={employeesLoading}
          onEdit={openEditEmployeeModal}
          onHold={openHoldEmployeeModal}
          onDelete={openDeleteEmployeeModal}
          searchText={employeeSearch}
          onSearchChange={setEmployeeSearch}
        />
      </Stack>
    </Box>
  );
};

export default EmployeeManagement;