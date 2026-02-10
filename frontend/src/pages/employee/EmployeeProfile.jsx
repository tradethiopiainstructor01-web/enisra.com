import { Card, CardBody, Heading, useColorModeValue } from '@chakra-ui/react';
import EmployeeInfoForm from '../EmployeeInfoForm';

const EmployeeProfile = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="2xl" boxShadow="lg">
      <CardBody>
        <Heading size="md" mb={6}>
          Profile
        </Heading>
        <EmployeeInfoForm />
      </CardBody>
    </Card>
  );
};

export default EmployeeProfile;

