import { useEffect, useMemo, useState } from "react";
import { Alert, AlertIcon, Badge, Box, Button, Container, Heading, SimpleGrid, Spinner, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { getScholarshipDashboard } from "../services/scholarshipAuthService";

const ScholarshipPostsPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const token = useMemo(() => localStorage.getItem("scholarshipToken") || "", []);

  useEffect(() => {
    if (!token) {
      navigate("/scholarship-login", { replace: true });
      return;
    }

    const loadPosts = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await getScholarshipDashboard(token);
        setPosts(Array.isArray(response.scholarshipPosts) ? response.scholarshipPosts : []);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load scholarship posts.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [navigate, token]);

  return (
    <Container maxW="4xl" py={10}>
      <Stack spacing={6}>
        <Box>
          <Heading size="lg">Scholarship Posts</Heading>
          <Text color="gray.600" mt={2}>
            Open posted scholarships and review full details.
          </Text>
        </Box>

        {errorMessage ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>{errorMessage}</Text>
          </Alert>
        ) : null}

        {isLoading ? (
          <Stack align="center" py={12}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.500">Loading scholarship posts...</Text>
          </Stack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            {posts.map((post) => (
              <Box key={post._id} borderWidth="1px" borderRadius="lg" p={5} bg="white">
                <Heading size="md" mb={2}>
                  {post.title || "Scholarship Post"}
                </Heading>
                <Badge colorScheme="blue" mb={4}>
                  Scholarship
                </Badge>
                <Text color="gray.600" noOfLines={4}>
                  {post.description || "Scholarship details are available in this post."}
                </Text>
                <Button
                  mt={4}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => navigate(`/scholarship-posts/${post._id}`)}
                  isDisabled={!post?._id}
                >
                  Open
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        )}

        {!isLoading && posts.length === 0 ? (
          <Text color="gray.500">No scholarship posts yet.</Text>
        ) : null}

        <Button as={RouterLink} to="/scholarship-portal" variant="outline" colorScheme="blue" w="fit-content">
          Back to Dashboard
        </Button>
      </Stack>
    </Container>
  );
};

export default ScholarshipPostsPage;
