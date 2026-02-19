import { useEffect, useRef, useState } from "react";
import {
  Avatar,
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
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { FiBriefcase, FiCamera, FiMail, FiShield } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { useUserStore } from "../../store/user";
import apiClient from "../../utils/apiClient";

const isDetailsComplete = (details) =>
  Object.values(details || {}).every((value) => String(value ?? "").trim().length > 0);

const EmployerProfile = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const toast = useToast();
  const avatarInputRef = useRef(null);
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
  const [showForm, setShowForm] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const pageBg = useColorModeValue("gray.50", "gray.950");
  const panelBg = useColorModeValue("white", "gray.900");
  const heroBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const subtleText = useColorModeValue("gray.500", "gray.400");
  const accent = useColorModeValue("green.500", "green.300");

  const displayName = currentUser?.fullName || currentUser?.username || "Employer";
  const displayEmail = currentUser?.email || "employer@gmail.com";
  const displayRole = currentUser?.displayRole || currentUser?.role || "employer";
  const displayDepartment = currentUser?.department || "Not set";
  const displayStatus = currentUser?.status || "Active";
  const normalizedStatus = displayStatus.toString().toLowerCase();
  const statusScheme = normalizedStatus.includes("pending")
    ? "orange"
    : normalizedStatus.includes("inactive")
    ? "red"
    : "green";

  useEffect(() => {
    if (currentUser?.photoUrl) {
      setAvatarUrl(currentUser.photoUrl);
    } else {
      setAvatarUrl("");
    }
  }, [currentUser]);

  const triggerAvatarPicker = () => {
    if (avatarUploading) return;
    if (avatarInputRef.current) avatarInputRef.current.click();
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser?._id) return;

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("userId", currentUser._id);
      formData.append("photo", file);

      const response = await apiClient.post("/upload-info", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = response?.data?.user || {};
      const newPhotoUrl = updatedUser.photoUrl || avatarUrl;
      setAvatarUrl(newPhotoUrl);

      setCurrentUser({
        ...currentUser,
        photo: updatedUser.photo ?? currentUser.photo,
        photoUrl: newPhotoUrl || currentUser.photoUrl,
        token: currentUser.token,
      });

      toast({
        title: "Avatar updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error?.response?.data?.message || error?.message || "Could not update avatar.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

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
          if (isDetailsComplete(payload)) {
            setShowForm(false);
          }
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

  const handleEmployerDetailsChange = (field) => (event) => {
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
      window.dispatchEvent(new Event("employer-details-updated"));
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

  return (
    <Box bg={pageBg} minH="100vh">
      <Container maxW="7xl">
        <Stack spacing={{ base: 6, md: 8 }}>
          <Box
            bg={heroBg}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="lg"
            px={{ base: 4, md: 6 }}
            py={{ base: 4, md: 5 }}
            position={{ base: "relative", lg: "sticky" }}
            top={{ lg: 6 }}
            overflow="hidden"
            zIndex="1"
            sx={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(34, 197, 94, 0.12), transparent 55%), radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.18), transparent 45%)",
            }}
          >
            <Flex
              direction={{ base: "column", lg: "row" }}
              align={{ base: "flex-start", lg: "center" }}
              justify="space-between"
              gap={{ base: 4, md: 6 }}
            >
              <Stack spacing={3} maxW="2xl">
                <HStack spacing={2} flexWrap="wrap">
                  <Badge colorScheme="green" variant="subtle">
                    Employer
                  </Badge>
                  <Badge colorScheme={statusScheme} variant="outline">
                    {displayStatus}
                  </Badge>
                </HStack>
                <Heading size="lg">Welcome back, {displayName}</Heading>
                <Text color={mutedText} fontSize="sm">
                  Manage your company profile, keep listings up to date, and stay aligned with your team.
                </Text>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  spacing={2}
                  align={{ base: "stretch", sm: "center" }}
                >
                  <Button
                    as={RouterLink}
                    to="/employer/post"
                    colorScheme="green"
                    size="sm"
                    width={{ base: "100%", sm: "auto" }}
                  >
                    Post a job
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/employer/employees"
                    variant="outline"
                    borderColor={borderColor}
                    size="sm"
                    width={{ base: "100%", sm: "auto" }}
                  >
                    View employees
                  </Button>
                </Stack>
              </Stack>

              <Card
                bg={panelBg}
                borderWidth="1px"
                borderColor={borderColor}
                minW={{ base: "100%", lg: "280px" }}
                boxShadow="lg"
              >
                <CardBody>
                  <HStack spacing={4} align="center">
                    <Box position="relative">
                      <Box
                        role="button"
                        tabIndex={0}
                        onClick={triggerAvatarPicker}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            triggerAvatarPicker();
                          }
                        }}
                        cursor={avatarUploading ? "not-allowed" : "pointer"}
                        aria-label="Change profile image"
                        opacity={avatarUploading ? 0.7 : 1}
                      >
                        <Avatar size="md" name={displayName} src={avatarUrl || undefined} bg={accent} />
                      </Box>
                      <Box
                        position="absolute"
                        right="-1"
                        bottom="-1"
                        bg="white"
                        color="green.500"
                        borderRadius="full"
                        borderWidth="1px"
                        borderColor="green.100"
                        p={1}
                        boxShadow="sm"
                      >
                        <Icon as={FiCamera} boxSize={3} />
                      </Box>
                      <Input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        display="none"
                      />
                    </Box>
                    <Box>
                      <Heading size="sm">{displayName}</Heading>
                      <Text fontSize="xs" color={subtleText}>
                        {displayRole}
                      </Text>
                    </Box>
                  </HStack>
                  <Divider my={3} borderColor={borderColor} />
                  <Stack spacing={2}>
                    <HStack spacing={3}>
                      <Icon as={FiMail} color={accent} />
                      <Text fontSize="xs">{displayEmail}</Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={FiBriefcase} color={accent} />
                      <Text fontSize="xs">{displayDepartment}</Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={FiShield} color={accent} />
                      <Text fontSize="xs">Account ID: {currentUser?._id || "Not assigned"}</Text>
                    </HStack>
                  </Stack>
                </CardBody>
              </Card>
            </Flex>
          </Box>

          <Card bg={panelBg} borderWidth="1px" borderColor={borderColor} boxShadow="md">
            <CardHeader>
              <Flex justify="space-between" align="center" gap={3} wrap="wrap">
                <Box>
                  <Heading size="sm">Employer Form</Heading>
                  <Text color={subtleText} fontSize="sm" mt={1}>
                    Provide your company details to continue.
                  </Text>
                </Box>
                {!showForm ? (
                  <Button size="sm" onClick={() => setShowForm(true)}>
                    Edit details
                  </Button>
                ) : null}
              </Flex>
            </CardHeader>
            <CardBody>
              {showForm ? (
              <Stack spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Employer ID</FormLabel>
                    <Input
                      placeholder="EMP-0001"
                      value={employerDetails.employerId}
                      onChange={handleEmployerDetailsChange("employerId")}
                      isDisabled={detailsLoading}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Company Name</FormLabel>
                    <Input
                      placeholder="Enisra"
                      value={employerDetails.companyName}
                      onChange={handleEmployerDetailsChange("companyName")}
                      isDisabled={detailsLoading}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Industry</FormLabel>
                    <Input
                      placeholder="Talent & Placement"
                      value={employerDetails.industry}
                      onChange={handleEmployerDetailsChange("industry")}
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
                      onChange={handleEmployerDetailsChange("category")}
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
                      onChange={handleEmployerDetailsChange("companyLocation")}
                      isDisabled={detailsLoading}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Contact Person</FormLabel>
                    <Input
                      placeholder="Full name"
                      value={employerDetails.contactPerson}
                      onChange={handleEmployerDetailsChange("contactPerson")}
                      isDisabled={detailsLoading}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Contact Email</FormLabel>
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      value={employerDetails.contactEmail}
                      onChange={handleEmployerDetailsChange("contactEmail")}
                      isDisabled={detailsLoading}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Contact Phone</FormLabel>
                    <Input
                      type="tel"
                      placeholder="+251 9xx xxx xxx"
                      value={employerDetails.contactPhone}
                      onChange={handleEmployerDetailsChange("contactPhone")}
                      isDisabled={detailsLoading}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Package Type (Number)</FormLabel>
                    <Input
                      placeholder="e.g. 1"
                      value={employerDetails.packageType}
                      onChange={handleEmployerDetailsChange("packageType")}
                      isDisabled={detailsLoading}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Job Posting Credits</FormLabel>
                    <Input
                      type="number"
                      placeholder="0"
                      value={employerDetails.jobPostingCredits}
                      onChange={handleEmployerDetailsChange("jobPostingCredits")}
                      isDisabled={detailsLoading}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Contract End Date</FormLabel>
                    <Input
                      type="date"
                      value={employerDetails.contractEndDate}
                      onChange={handleEmployerDetailsChange("contractEndDate")}
                      isDisabled={detailsLoading}
                    />
                  </FormControl>
                </SimpleGrid>
                <Button
                  colorScheme="green"
                  onClick={handleEmployerDetailsSave}
                  isLoading={detailsSaving}
                  isDisabled={detailsLoading}
                  width={{ base: "100%", sm: "auto" }}
                  alignSelf={{ base: "stretch", sm: "flex-start" }}
                >
                  Save Employer Details
                </Button>
              </Stack>
              ) : (
                <Text color={mutedText}>
                  Profile saved. Click “Edit details” to make changes.
                </Text>
              )}
            </CardBody>
          </Card>

        </Stack>
      </Container>
    </Box>
  );
};

export default EmployerProfile;
