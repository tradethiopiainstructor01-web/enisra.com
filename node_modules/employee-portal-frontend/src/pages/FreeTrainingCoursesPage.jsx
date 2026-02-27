import { useEffect, useMemo, useState } from "react";
import { Alert, AlertIcon, Badge, Box, Button, Container, Heading, SimpleGrid, Spinner, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { getScholarshipDashboard } from "../services/scholarshipAuthService";

const normalizeUrlArray = (value) => {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split(/\r?\n|,/);
  return list.map((item) => String(item || "").trim()).filter(Boolean);
};

const getCourseLevel = (index) => (index % 3 === 1 ? "Intermediate" : "Beginner");

const FreeTrainingCoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const token = useMemo(() => localStorage.getItem("scholarshipToken") || "", []);

  useEffect(() => {
    if (!token) {
      navigate("/scholarship-login", { replace: true });
      return;
    }

    const loadCourses = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await getScholarshipDashboard(token);
        setCourses(Array.isArray(response.freeTrainingPosts) ? response.freeTrainingPosts : []);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load free training courses.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [navigate, token]);

  return (
    <Container maxW="4xl" py={10}>
      <Stack spacing={6}>
        <Box>
          <Heading size="lg">Free Training Courses</Heading>
          <Text color="gray.600" mt={2}>
            Join available free training tracks and build practical skills.
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
            <Text color="gray.500">Loading free training courses...</Text>
          </Stack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            {courses.map((course, index) => {
              const videoUrls = normalizeUrlArray(course.videoUrls);
              const slideUrls = normalizeUrlArray(course.slideUrls);
              const hasResources = videoUrls.length > 0 || slideUrls.length > 0;

              return (
                <Box key={course._id || `course-${index}`} borderWidth="1px" borderRadius="lg" p={5} bg="white">
                  <Heading size="md" mb={2}>
                    {course.title || "Free Training Course"}
                  </Heading>
                  <Badge colorScheme="green" mb={4}>
                    {getCourseLevel(index)}
                  </Badge>
                  <Text color="gray.600">{course.description || "Enrollment is open for this course."}</Text>

                  <Button
                    mt={4}
                    colorScheme="blue"
                    size="sm"
                    onClick={() => navigate(`/free-training-courses/${course._id}`)}
                    isDisabled={!course?._id}
                  >
                    Open Course
                  </Button>
                  {!hasResources ? (
                    <Text color="gray.500" fontSize="sm" mt={3}>
                      No videos or slides uploaded yet.
                    </Text>
                  ) : null}

                </Box>
              );
            })}
          </SimpleGrid>
        )}

        {!isLoading && courses.length === 0 ? (
          <Text color="gray.500">No free training courses posted yet.</Text>
        ) : null}

        <Button as={RouterLink} to="/scholarship-portal" variant="outline" colorScheme="blue" w="fit-content">
          Back to Dashboard
        </Button>
      </Stack>
    </Container>
  );
};

export default FreeTrainingCoursesPage;
