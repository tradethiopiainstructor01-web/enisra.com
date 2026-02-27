import { useEffect, useMemo, useState } from "react";
import { Alert, AlertIcon, Box, Button, Container, Heading, Spinner, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { getScholarshipDashboard } from "../services/scholarshipAuthService";

const ScholarshipPostDetailPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const token = useMemo(() => localStorage.getItem("scholarshipToken") || "", []);

  useEffect(() => {
    if (!token) {
      navigate("/scholarship-login", { replace: true });
      return;
    }

    const loadPost = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await getScholarshipDashboard(token);
        const posts = Array.isArray(response.scholarshipPosts) ? response.scholarshipPosts : [];
        const found = posts.find((item) => String(item?._id) === String(postId));
        if (!found) {
          setErrorMessage("Scholarship post not found.");
          setPost(null);
          return;
        }
        setPost(found);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load scholarship post.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [navigate, postId, token]);

  return (
    <Container maxW="4xl" py={10}>
      <Stack spacing={6}>
        <Heading size="lg">Scholarship Post</Heading>

        {errorMessage ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>{errorMessage}</Text>
          </Alert>
        ) : null}

        {isLoading ? (
          <Stack align="center" py={10}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.500">Loading scholarship post...</Text>
          </Stack>
        ) : null}

        {!isLoading && post ? (
          <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
            <Stack spacing={4}>
              <Heading size="md">{post.title}</Heading>
              <Text color="gray.700" whiteSpace="pre-line">
                {post.description}
              </Text>
              {String(post.actionUrl || "").trim() ? (
                <Button
                  colorScheme="blue"
                  w="fit-content"
                  onClick={() => {
                    const url = String(post.actionUrl || "").trim();
                    if (/^https?:\/\//i.test(url)) {
                      window.open(url, "_blank", "noopener,noreferrer");
                    } else {
                      navigate(url);
                    }
                  }}
                >
                  {post.actionLabel || "Apply"}
                </Button>
              ) : (
                <Text fontSize="sm" color="gray.500">
                  Read the full scholarship details above. No external link was added.
                </Text>
              )}
            </Stack>
          </Box>
        ) : null}

        <Button as={RouterLink} to="/scholarship-posts" variant="outline" colorScheme="blue" w="fit-content">
          Back to Scholarship Posts
        </Button>
      </Stack>
    </Container>
  );
};

export default ScholarshipPostDetailPage;
