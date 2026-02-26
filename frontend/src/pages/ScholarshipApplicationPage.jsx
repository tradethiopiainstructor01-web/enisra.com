import { Box, Button, Container, Heading, List, ListItem, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const ScholarshipApplicationPage = () => {
  return (
    <Container maxW="3xl" py={10}>
      <Stack spacing={6}>
        <Box>
          <Heading size="lg">Scholarship Application</Heading>
          <Text color="gray.600" mt={2}>
            Complete these steps to apply for scholarship support.
          </Text>
        </Box>

        <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
          <List spacing={3}>
            <ListItem>1. Fill your personal information.</ListItem>
            <ListItem>2. Upload academic documents.</ListItem>
            <ListItem>3. Submit your motivation statement.</ListItem>
            <ListItem>4. Review and confirm your application.</ListItem>
          </List>
        </Box>

        <Button as={RouterLink} to="/scholarship-portal" variant="outline" colorScheme="blue" w="fit-content">
          Back to Dashboard
        </Button>
      </Stack>
    </Container>
  );
};

export default ScholarshipApplicationPage;
