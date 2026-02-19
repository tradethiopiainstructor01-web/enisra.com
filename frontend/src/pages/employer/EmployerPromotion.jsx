import { useCallback, useEffect, useMemo, useState } from "react";
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
  Icon,
  Image,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { FiArrowUpRight, FiPlus } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import apiClient from "../../utils/apiClient";

const EMPTY_FORM = {
  name: "",
  logoUrl: "",
  website: "",
};

const sortByNewest = (items = []) =>
  items
    .slice()
    .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());

const EmployerPromotion = () => {
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");

  const [carouselForm, setCarouselForm] = useState(EMPTY_FORM);
  const [carouselLogoUploading, setCarouselLogoUploading] = useState(false);
  const [carouselLogoFileName, setCarouselLogoFileName] = useState("");
  const [carouselSubmitting, setCarouselSubmitting] = useState(false);
  const [mySubmissionsLoading, setMySubmissionsLoading] = useState(false);
  const [mySubmissions, setMySubmissions] = useState([]);

  const sortedMySubmissions = useMemo(() => sortByNewest(mySubmissions), [mySubmissions]);

  const loadMySubmissions = useCallback(async () => {
    setMySubmissionsLoading(true);
    try {
      const response = await apiClient.get("/partners/mine");
      const payload = response?.data?.data ?? response?.data ?? [];
      setMySubmissions(Array.isArray(payload) ? payload : []);
    } catch (error) {
      toast({
        title: "Failed to load your submissions",
        description: error?.response?.data?.message || error?.message || "Unable to load your submitted partners.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setMySubmissionsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMySubmissions();
  }, [loadMySubmissions]);

  const handleCarouselFormChange = (field) => (event) => {
    setCarouselForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCarouselLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type || !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setCarouselLogoUploading(true);
    try {
      const response = await apiClient.post("/partners/upload-logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const logoUrl = response?.data?.data?.logoUrl || response?.data?.logoUrl || "";
      if (!logoUrl) {
        throw new Error("Upload succeeded but no logo URL was returned.");
      }

      setCarouselForm((prev) => ({ ...prev, logoUrl }));
      setCarouselLogoFileName(file.name || "");
      toast({
        title: "Logo uploaded",
        description: "Logo URL was added to the form.",
        status: "success",
        duration: 2200,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to upload logo",
        description: error?.response?.data?.message || error?.message || "Unable to upload logo image.",
        status: "error",
        duration: 3200,
        isClosable: true,
      });
    } finally {
      setCarouselLogoUploading(false);
      event.target.value = "";
    }
  };

  const handleAddCarouselItem = async () => {
    const name = (carouselForm.name || "").trim();
    const logoUrl = (carouselForm.logoUrl || "").trim();
    const website = (carouselForm.website || "").trim();

    if (!name || !logoUrl) {
      toast({
        title: "Missing fields",
        description: "Company name and logo URL are required.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setCarouselSubmitting(true);
    try {
      const response = await apiClient.post("/partners", { name, logoUrl, website });
      const isApproved = Boolean(response?.data?.data?.approved);
      setCarouselLogoFileName("");
      setCarouselForm(EMPTY_FORM);
      await loadMySubmissions();
      toast({
        title: isApproved ? "Carousel item added" : "Submission sent",
        description: isApproved
          ? "The company now appears in the public carousel."
          : "Your company was submitted and is waiting for admin approval.",
        status: "success",
        duration: 2400,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to add carousel item",
        description: error?.response?.data?.message || error?.message || "Unable to submit partner company.",
        status: "error",
        duration: 3200,
        isClosable: true,
      });
    } finally {
      setCarouselSubmitting(false);
    }
  };

  return (
    <Box maxW="7xl" mx="auto">
      <Stack spacing={5}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg">Promotion</Heading>
            <Text color={mutedText} mt={1}>
              Use the same carousel promotion workflow as admin to submit partner companies.
            </Text>
          </Box>
          <Button as={RouterLink} to="/employer/post" colorScheme="green" rightIcon={<FiArrowUpRight />}>
            Post a new job
          </Button>
        </Flex>

        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="sm">Add Carousel Item</Heading>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Company name</FormLabel>
                  <Input
                    placeholder="e.g. Trade Ethiopia"
                    value={carouselForm.name}
                    onChange={handleCarouselFormChange("name")}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Logo URL</FormLabel>
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={carouselForm.logoUrl}
                    onChange={handleCarouselFormChange("logoUrl")}
                  />
                  <Stack spacing={2} mt={2}>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleCarouselLogoUpload}
                      isDisabled={carouselLogoUploading}
                      p={1}
                    />
                    <Text fontSize="xs" color={mutedText}>
                      {carouselLogoUploading
                        ? "Uploading logo..."
                        : carouselLogoFileName
                          ? `Uploaded: ${carouselLogoFileName}`
                          : "Upload a logo image to auto-fill the URL."}
                    </Text>
                  </Stack>
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Website (optional)</FormLabel>
                <Input
                  placeholder="https://company.com"
                  value={carouselForm.website}
                  onChange={handleCarouselFormChange("website")}
                />
              </FormControl>
              <Flex gap={2} wrap="wrap">
                <Button
                  colorScheme="purple"
                  leftIcon={<Icon as={FiPlus} />}
                  onClick={handleAddCarouselItem}
                  isLoading={carouselSubmitting}
                >
                  Submit to carousel
                </Button>
                <Button variant="outline" onClick={loadMySubmissions} isLoading={mySubmissionsLoading}>
                  Refresh my submissions
                </Button>
              </Flex>
            </Stack>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="sm">My Carousel Submissions</Heading>
          </CardHeader>
          <CardBody>
            {mySubmissionsLoading ? (
              <Flex align="center" gap={2}>
                <Spinner size="sm" />
                <Text color={mutedText}>Loading your submissions...</Text>
              </Flex>
            ) : sortedMySubmissions.length ? (
              <Stack spacing={3}>
                {sortedMySubmissions.map((partner) => (
                  <Flex
                    key={partner._id || `${partner.name}-${partner.logoUrl}`}
                    align="center"
                    justify="space-between"
                    gap={3}
                    p={3}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    direction={{ base: "column", sm: "row" }}
                  >
                    <Flex align="center" gap={3} minW={0}>
                      <Image
                        src={partner.logoUrl}
                        alt={partner.name || "Partner"}
                        boxSize={12}
                        borderRadius="full"
                        objectFit="cover"
                      />
                      <Box minW={0}>
                        <Text fontWeight="semibold" noOfLines={1}>
                          {partner.name || "Partner"}
                        </Text>
                        <Text fontSize="xs" color={mutedText} noOfLines={1}>
                          {partner.website || "No website"}
                        </Text>
                      </Box>
                    </Flex>
                    <Badge colorScheme={partner.approved ? "green" : "orange"} variant="subtle">
                      {partner.approved ? "Approved" : "Pending approval"}
                    </Badge>
                  </Flex>
                ))}
              </Stack>
            ) : (
              <Text color={mutedText}>You have not submitted any carousel items yet.</Text>
            )}
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
};

export default EmployerPromotion;
