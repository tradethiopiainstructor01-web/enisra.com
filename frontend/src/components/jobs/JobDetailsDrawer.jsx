import {
  Badge,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

const JobDetailsDrawer = ({
  applyLabel = 'Apply',
  formatDate,
  isOpen,
  job,
  onApply,
  onClose,
  placement = 'left',
}) => {
  const mutedText = useColorModeValue('gray.600', 'gray.300');

  const formatValue = (value) => {
    if (!value) return '';
    if (typeof formatDate === 'function') {
      return formatDate(value);
    }
    return value;
  };

  return (
    <Drawer isOpen={isOpen} placement={placement} onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent maxW="420px">
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          {job?.title || 'Job details'}
        </DrawerHeader>
        <DrawerBody>
          {job ? (
            <VStack align="stretch" spacing={3}>
              <Text fontWeight="semibold">{job.company || job.postedByName || 'Company not specified'}</Text>

              {job.companyAddress ? (
                <Text fontSize="sm" color={mutedText}>
                  Company address: {job.companyAddress}
                </Text>
              ) : null}

              <HStack spacing={2} flexWrap="wrap">
                {job.category ? <Badge colorScheme="purple">{job.category}</Badge> : null}
                {job.type ? <Badge colorScheme="blue">{job.type}</Badge> : null}
                {job.location ? <Badge colorScheme="green">{job.location}</Badge> : null}
              </HStack>

              {job.department ? (
                <Text fontSize="sm" color={mutedText}>
                  Department: {job.department}
                </Text>
              ) : null}

              {job.deadline ? (
                <Text fontSize="sm" color={mutedText}>
                  Deadline: {formatValue(job.deadline)}
                </Text>
              ) : null}

              {job.salary ? (
                <Text fontSize="sm" color={mutedText}>
                  Salary: {job.salary}
                </Text>
              ) : null}

              {job.contactEmail ? (
                <Text fontSize="sm" color={mutedText}>
                  Contact email: {job.contactEmail}
                </Text>
              ) : null}

              <Divider />

              <Text fontSize="sm" whiteSpace="pre-wrap">
                {job.description || 'No description provided.'}
              </Text>

              {typeof onApply === 'function' ? (
                <Button colorScheme="teal" onClick={() => onApply(job)}>
                  {applyLabel}
                </Button>
              ) : null}
            </VStack>
          ) : (
            <Text color={mutedText}>Select a job to view details.</Text>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default JobDetailsDrawer;
