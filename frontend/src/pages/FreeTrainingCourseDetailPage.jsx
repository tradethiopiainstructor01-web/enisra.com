import { useEffect, useMemo, useState } from "react";
import { Alert, AlertIcon, Badge, Box, Button, Container, Flex, Heading, Spinner, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { getScholarshipDashboard } from "../services/scholarshipAuthService";

const normalizeUrlArray = (value) => {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split(/\r?\n|,/);
  return list.map((item) => String(item || "").trim()).filter(Boolean);
};

const toYoutubeEmbedUrl = (rawUrl) => {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
  } catch {
    return "";
  }
  return "";
};

const buildCourseLessons = (course) => {
  const videos = normalizeUrlArray(course?.videoUrls).map((url, index) => ({
    id: `video-${index}`,
    type: "video",
    title: `Video ${index + 1}`,
    url,
  }));
  const slides = normalizeUrlArray(course?.slideUrls).map((url, index) => ({
    id: `slide-${index}`,
    type: "slide",
    title: `Slide ${index + 1}`,
    url,
  }));
  return [...videos, ...slides];
};

const FreeTrainingCourseDetailPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const token = useMemo(() => localStorage.getItem("scholarshipToken") || "", []);

  useEffect(() => {
    if (!token) {
      navigate("/scholarship-login", { replace: true });
      return;
    }

    const loadCourse = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await getScholarshipDashboard(token);
        const list = Array.isArray(response.freeTrainingPosts) ? response.freeTrainingPosts : [];
        const found = list.find((item) => String(item?._id) === String(courseId));
        if (!found) {
          setErrorMessage("Course not found.");
          setCourse(null);
          return;
        }
        setCourse(found);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to load the course.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [courseId, navigate, token]);

  const lessons = course ? buildCourseLessons(course) : [];
  const activeLesson = lessons[activeLessonIndex] || null;

  return (
    <Container maxW="6xl" py={8}>
      <Stack spacing={5}>
        <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap={3}>
          <Box>
            <Heading size="lg">{course?.title || "Course Player"}</Heading>
            <Text color="gray.600" mt={1}>
              {course?.description || "Watch videos and view slides in sequence."}
            </Text>
          </Box>
          <Button as={RouterLink} to="/free-training-courses" variant="outline" colorScheme="blue">
            Back to Courses
          </Button>
        </Flex>

        {errorMessage ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>{errorMessage}</Text>
          </Alert>
        ) : null}

        {isLoading ? (
          <Stack align="center" py={12}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.500">Loading course...</Text>
          </Stack>
        ) : null}

        {!isLoading && course ? (
          <Flex direction={{ base: "column", lg: "row" }} gap={4}>
            <Box flex="1" borderWidth="1px" borderRadius="xl" p={4} bg="white">
              {activeLesson ? (
                <Stack spacing={3}>
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="semibold">
                      Lesson {activeLessonIndex + 1} of {lessons.length}: {activeLesson.title}
                    </Text>
                    <Badge colorScheme={activeLesson.type === "video" ? "blue" : "teal"}>
                      {activeLesson.type === "video" ? "Video" : "Slide"}
                    </Badge>
                  </Flex>

                  {activeLesson.type === "video" ? (
                    toYoutubeEmbedUrl(activeLesson.url) ? (
                      <Box
                        as="iframe"
                        src={toYoutubeEmbedUrl(activeLesson.url)}
                        title={activeLesson.title}
                        width="100%"
                        minH={{ base: "240px", md: "420px" }}
                        border="0"
                        borderRadius="md"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={activeLesson.url} controls style={{ width: "100%", maxHeight: "540px" }} />
                    )
                  ) : (
                    <Box
                      as="iframe"
                      src={activeLesson.url}
                      title={activeLesson.title}
                      width="100%"
                      minH={{ base: "300px", md: "520px" }}
                      border="1px solid #e2e8f0"
                      borderRadius="md"
                    />
                  )}

                  <Flex justify="space-between">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveLessonIndex((prev) => Math.max(0, prev - 1))}
                      isDisabled={activeLessonIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => setActiveLessonIndex((prev) => Math.min(lessons.length - 1, prev + 1))}
                      isDisabled={activeLessonIndex >= lessons.length - 1}
                    >
                      Next
                    </Button>
                  </Flex>
                </Stack>
              ) : (
                <Text color="gray.500">No videos or slides uploaded yet.</Text>
              )}
            </Box>

            <Box w={{ base: "100%", lg: "320px" }} borderWidth="1px" borderRadius="xl" p={4} bg="white">
              <Heading size="sm" mb={3}>
                Course Content
              </Heading>
              {lessons.length ? (
                <Stack spacing={2}>
                  {lessons.map((lesson, index) => (
                    <Button
                      key={lesson.id}
                      size="sm"
                      justifyContent="flex-start"
                      variant={index === activeLessonIndex ? "solid" : "outline"}
                      colorScheme={lesson.type === "video" ? "blue" : "teal"}
                      onClick={() => setActiveLessonIndex(index)}
                    >
                      {index + 1}. {lesson.title}
                    </Button>
                  ))}
                </Stack>
              ) : (
                <Text color="gray.500">No lessons available.</Text>
              )}
            </Box>
          </Flex>
        ) : null}
      </Stack>
    </Container>
  );
};

export default FreeTrainingCourseDetailPage;
