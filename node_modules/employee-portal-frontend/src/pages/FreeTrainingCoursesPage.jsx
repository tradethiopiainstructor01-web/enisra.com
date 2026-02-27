import { Badge, Box, Button, Container, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const courses = [
  { id: "digital-skills", title: "Digital Skills Foundation", level: "Beginner" },
  { id: "english-communication", title: "English Communication", level: "Intermediate" },
  { id: "career-prep", title: "Career Preparation", level: "Beginner" },
  { id: "software-basics", title: "Software Basics", level: "Beginner" },
];

const FreeTrainingCoursesPage = () => {
  return (
    <Container maxW="4xl" py={10}>
      <Stack spacing={6}>
        <Box>
          <Heading size="lg">Free Training Courses</Heading>
          <Text color="gray.600" mt={2}>
            Join available free training tracks and build practical skills.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          {courses.map((course) => (
            <Box key={course.id} borderWidth="1px" borderRadius="lg" p={5} bg="white">
              <Heading size="md" mb={2}>
                {course.title}
              </Heading>
              <Badge colorScheme="green" mb={4}>
                {course.level}
              </Badge>
              <Text color="gray.600">Enrollment is open for this course.</Text>
              <Button mt={4} colorScheme="blue" size="sm">
                Join Course
              </Button>
            </Box>
          ))}
        </SimpleGrid>

        <Button as={RouterLink} to="/scholarship-portal" variant="outline" colorScheme="blue" w="fit-content">
          Back to Dashboard
        </Button>
      </Stack>
    </Container>
  );
};

export default FreeTrainingCoursesPage;
