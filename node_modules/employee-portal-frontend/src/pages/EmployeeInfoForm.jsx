import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useUserStore } from '../store/user';
import { resolveApiBase } from '../utils/apiBase';
import apiClient from '../utils/apiClient';
import { MIN_CV_PROFILE_COMPLETION, getEmployeeProfileCompletion } from '../utils/employeeProfileCompletion';

const blankEducation = () => ({
  highestEducationLevel: '',
  fieldOfStudy: '',
  institutionName: '',
  graduationYear: '',
  certifications: '',
});

const blankExperience = () => ({
  previousCompanyName: '',
  jobTitle: '',
  startDate: '',
  endDate: '',
  keyResponsibilities: '',
});

const blankLanguage = () => ({
  language: '',
  proficiencyLevel: '',
});

const parseFullName = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', middleName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], middleName: '', lastName: '' };
  if (parts.length === 2) return { firstName: parts[0], middleName: '', lastName: parts[1] };
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
};

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const splitCsv = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const EmployeeInfoForm = () => {
  const toast = useToast();
  const cardBg = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const progressTrackBg = useColorModeValue('gray.100', 'gray.700');
  const completionCardBg = useColorModeValue('white', 'gray.900');
  const progressThresholdColor = useColorModeValue('red.400', 'red.300');

  const currentUser = useUserStore((state) => state.currentUser);
  const updateUserInfo = useUserStore((state) => state.updateUserInfo);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const isHrOrAdmin = useMemo(() => {
    const role = (currentUser?.role || '').toString().trim().toLowerCase();
    return role === 'admin' || role === 'hr';
  }, [currentUser?.role]);

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

  const [profile, setProfile] = useState({
    // 1. Personal information
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    maritalStatus: '',
    nationalIdOrPassportNumber: '',

    // 2. Contact information
    personalEmail: '',
    phoneNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    currentAddress: '',
    city: '',
    country: '',

    // 3. Employment details
    employeeId: '',
    jobTitle: '',
    department: '',
    position: '',
    employmentType: '',
    dateOfJoining: '',
    workLocation: '',
    reportingManager: '',
    employmentStatus: '',

    // 4-6. Education / experience / skills
    educationBackground: [blankEducation()],
    workExperience: [blankExperience()],
    technicalSkills: '',
    softSkills: '',
    languagesSpoken: [blankLanguage()],

    // 7. Salary details (HR only)
    salaryDetails: {
      salaryType: '',
      basicSalary: '',
      allowances: '',
      paymentMethod: '',
      bankName: '',
      bankAccountNumber: '',
      contractStartDate: '',
      contractEndDate: '',
    },
  });

  const [existingFiles, setExistingFiles] = useState({
    photoUrl: '',
    guarantorFileUrl: '',
    cvResumeUrl: '',
    educationCertificateUrls: [],
    idPassportUrl: '',
    contractDocumentUrl: '',
    otherSupportingFileUrls: [],
  });

  const [uploads, setUploads] = useState({
    photo: null,
    guarantorFile: null,
    cvResume: null,
    educationCertificates: [],
    idPassport: null,
    contractDocument: null,
    otherSupportingFiles: [],
  });

  const completionSource = useMemo(
    () => ({
      ...profile,
      // Map form fields into the completion helper's expected keys
      email: profile.personalEmail,
      phone: profile.phoneNumber,
      altPhone: profile.emergencyContactPhone,
      hireDate: profile.dateOfJoining,
      photoUrl: existingFiles.photoUrl,
    }),
    [profile, existingFiles.photoUrl]
  );

  const profileCompletion = useMemo(
    () => getEmployeeProfileCompletion(completionSource),
    [completionSource]
  );
  const canCreateCv = profileCompletion.meetsCvRequirement;

  useEffect(() => {
    if (!currentUser?.token) return;

    const hydrateFromUser = (user) => {
      if (!user) return;

      const derivedName =
        user.firstName || user.lastName ?
          { firstName: user.firstName || '', middleName: user.middleName || '', lastName: user.lastName || '' } :
          parseFullName(user.fullName || '');

      setProfile((prev) => ({
        ...prev,
        ...derivedName,
        gender: user.gender || '',
        dateOfBirth: toDateInputValue(user.dateOfBirth),
        nationality: user.nationality || '',
        maritalStatus: user.maritalStatus || '',
        nationalIdOrPassportNumber: user.nationalIdOrPassportNumber || '',

        personalEmail: user.altEmail || '',
        phoneNumber: user.phone || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.altPhone || '',
        currentAddress: user.currentAddress || user.location || '',
        city: user.city || '',
        country: user.country || '',

        employeeId: user.employeeId || '',
        jobTitle: user.jobTitle || '',
        department: user.department || '',
        position: user.position || '',
        employmentType: user.employmentType || '',
        dateOfJoining: toDateInputValue(user.hireDate),
        workLocation: user.workLocation || '',
        reportingManager: user.reportingManager || '',
        employmentStatus: user.employmentStatus || '',

        educationBackground:
          Array.isArray(user.educationBackground) && user.educationBackground.length ?
            user.educationBackground.map((item) => ({
              highestEducationLevel: item?.highestEducationLevel || '',
              fieldOfStudy: item?.fieldOfStudy || '',
              institutionName: item?.institutionName || '',
              graduationYear:
                item?.graduationYear !== undefined && item?.graduationYear !== null ? String(item.graduationYear) : '',
              certifications: item?.certifications || '',
            })) :
            [blankEducation()],

        workExperience:
          Array.isArray(user.workExperience) && user.workExperience.length ?
            user.workExperience.map((item) => ({
              previousCompanyName: item?.previousCompanyName || '',
              jobTitle: item?.jobTitle || '',
              startDate: toDateInputValue(item?.startDate),
              endDate: toDateInputValue(item?.endDate),
              keyResponsibilities: item?.keyResponsibilities || '',
            })) :
            [blankExperience()],

        technicalSkills: Array.isArray(user.technicalSkills) ? user.technicalSkills.join(', ') : '',
        softSkills: Array.isArray(user.softSkills) ? user.softSkills.join(', ') : '',

        languagesSpoken:
          Array.isArray(user.languagesSpoken) && user.languagesSpoken.length ?
            user.languagesSpoken.map((item) => ({
              language: item?.language || '',
              proficiencyLevel: item?.proficiencyLevel || '',
            })) :
            [blankLanguage()],

        salaryDetails: {
          salaryType: user.salaryDetails?.salaryType || '',
          basicSalary:
            user.salaryDetails?.basicSalary !== undefined && user.salaryDetails?.basicSalary !== null ?
              String(user.salaryDetails.basicSalary) :
              '',
          allowances:
            user.salaryDetails?.allowances !== undefined && user.salaryDetails?.allowances !== null ?
              String(user.salaryDetails.allowances) :
              '',
          paymentMethod: user.salaryDetails?.paymentMethod || '',
          bankName: user.salaryDetails?.bankName || '',
          bankAccountNumber: user.salaryDetails?.bankAccountNumber || '',
          contractStartDate: toDateInputValue(user.salaryDetails?.contractStartDate),
          contractEndDate: toDateInputValue(user.salaryDetails?.contractEndDate),
        },
      }));

      setExistingFiles({
        photoUrl: user.photoUrl || '',
        guarantorFileUrl: user.guarantorFileUrl || '',
        cvResumeUrl: user.cvResumeUrl || '',
        educationCertificateUrls: Array.isArray(user.educationCertificateUrls) ? user.educationCertificateUrls : [],
        idPassportUrl: user.idPassportUrl || '',
        contractDocumentUrl: user.contractDocumentUrl || '',
        otherSupportingFileUrls: Array.isArray(user.otherSupportingFileUrls) ? user.otherSupportingFileUrls : [],
      });
    };

    // Quick hydrate from what we already have in memory/localStorage
    hydrateFromUser(currentUser);

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const res = await apiClient.get('/users/me');
        const payload = res?.data;
        if (!payload?.success || !payload?.data) {
          throw new Error(payload?.message || 'Unable to load profile.');
        }
        hydrateFromUser(payload.data);
      } catch (error) {
        toast({
          title: 'Failed to load profile',
          description: error.message || 'Unable to load employee profile.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [currentUser, toast]);

  const setField = (field) => (event) => {
    setProfile((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleNationalIdChange = (event) => {
    const digitsOnly = (event.target.value || '').replace(/\D/g, '').slice(0, 16);
    setProfile((prev) => ({ ...prev, nationalIdOrPassportNumber: digitsOnly }));
  };

  const setSalaryField = (field) => (event) => {
    setProfile((prev) => ({
      ...prev,
      salaryDetails: { ...prev.salaryDetails, [field]: event.target.value },
    }));
  };

  const updateArrayField = (listName, index, field) => (event) => {
    const value = event.target.value;
    setProfile((prev) => {
      const next = [...prev[listName]];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, [listName]: next };
    });
  };

  const addArrayItem = (listName, factory) => {
    setProfile((prev) => ({ ...prev, [listName]: [...prev[listName], factory()] }));
  };

  const removeArrayItem = (listName, index, factory) => {
    setProfile((prev) => {
      const next = prev[listName].filter((_, idx) => idx !== index);
      return { ...prev, [listName]: next.length ? next : [factory()] };
    });
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    if (!currentUser?._id) return;

    const firstName = profile.firstName.trim();
    const middleName = profile.middleName.trim();
    const lastName = profile.lastName.trim();
    const phoneNumber = profile.phoneNumber.trim();
    const gender = profile.gender.trim();
    const dateOfBirth = profile.dateOfBirth;
    const nationality = profile.nationality.trim();

    if (!firstName || !lastName || !phoneNumber || !gender || !dateOfBirth || !nationality) {
      toast({
        title: 'Missing required fields',
        description: 'First name, last name, phone number, gender, date of birth, and nationality are required.',
        status: 'warning',
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();

    const payload = {
      _id: currentUser._id,
      fullName,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      nationality,
      maritalStatus: profile.maritalStatus || '',
      nationalIdOrPassportNumber: profile.nationalIdOrPassportNumber.trim(),

      altEmail: profile.personalEmail.trim(),
      phone: phoneNumber,
      emergencyContactName: profile.emergencyContactName.trim(),
      altPhone: profile.emergencyContactPhone.trim(),
      currentAddress: profile.currentAddress.trim(),
      city: profile.city.trim(),
      country: profile.country.trim(),
      location: profile.currentAddress.trim(),

      employeeId: profile.employeeId.trim(),
      jobTitle: profile.jobTitle.trim(),
      department: profile.department.trim(),
      position: profile.position.trim(),
      employmentType: profile.employmentType || '',
      hireDate: profile.dateOfJoining || undefined,
      workLocation: profile.workLocation || '',
      reportingManager: profile.reportingManager.trim(),
      employmentStatus: profile.employmentStatus || '',

      educationBackground: profile.educationBackground.map((item) => ({
        highestEducationLevel: item.highestEducationLevel?.trim?.() || '',
        fieldOfStudy: item.fieldOfStudy?.trim?.() || '',
        institutionName: item.institutionName?.trim?.() || '',
        graduationYear: item.graduationYear ? Number(item.graduationYear) : undefined,
        certifications: item.certifications?.trim?.() || '',
      })),
      workExperience: profile.workExperience.map((item) => ({
        previousCompanyName: item.previousCompanyName?.trim?.() || '',
        jobTitle: item.jobTitle?.trim?.() || '',
        startDate: item.startDate || undefined,
        endDate: item.endDate || undefined,
        keyResponsibilities: item.keyResponsibilities?.trim?.() || '',
      })),
      technicalSkills: splitCsv(profile.technicalSkills),
      softSkills: splitCsv(profile.softSkills),
      languagesSpoken: profile.languagesSpoken
        .filter((item) => item.language?.trim?.() || item.proficiencyLevel?.trim?.())
        .map((item) => ({
          language: item.language?.trim?.() || '',
          proficiencyLevel: item.proficiencyLevel || '',
        })),
    };

    if (isHrOrAdmin) {
      payload.salaryDetails = {
        salaryType: profile.salaryDetails.salaryType || '',
        basicSalary: profile.salaryDetails.basicSalary ? Number(profile.salaryDetails.basicSalary) : undefined,
        allowances: profile.salaryDetails.allowances ? Number(profile.salaryDetails.allowances) : undefined,
        paymentMethod: profile.salaryDetails.paymentMethod || '',
        bankName: profile.salaryDetails.bankName.trim(),
        bankAccountNumber: profile.salaryDetails.bankAccountNumber.trim(),
        contractStartDate: profile.salaryDetails.contractStartDate || undefined,
        contractEndDate: profile.salaryDetails.contractEndDate || undefined,
      };
    }

    setIsSavingProfile(true);
    try {
      const response = await updateUserInfo(payload);
      if (!response?.success) {
        throw new Error(response?.message || 'Profile update failed.');
      }
      toast({
        title: 'Profile saved',
        description: 'Your employee profile has been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      window.dispatchEvent(new Event('employee-profile-updated'));
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error.message || 'Unable to save your profile right now.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleFileChange = (field, isMultiple = false) => (event) => {
    const fileList = Array.from(event.target.files || []);
    setUploads((prev) => ({
      ...prev,
      [field]: isMultiple ? fileList : fileList[0] || null,
    }));
  };

  const handleUploadDocuments = async () => {
    const userId = currentUser?._id || profile?._id || localStorage.getItem('userId');
    if (!userId) return;

    const hasAnyFile =
      uploads.photo ||
      uploads.guarantorFile ||
      uploads.cvResume ||
      uploads.idPassport ||
      uploads.contractDocument ||
      (uploads.educationCertificates && uploads.educationCertificates.length) ||
      (uploads.otherSupportingFiles && uploads.otherSupportingFiles.length);

    if (!hasAnyFile) {
      toast({
        title: 'No files selected',
        description: 'Select one or more files to upload.',
        status: 'info',
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setIsUploadingDocs(true);
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      if (uploads.photo) formData.append('photo', uploads.photo);
      if (uploads.guarantorFile) formData.append('guarantorFile', uploads.guarantorFile);
      if (uploads.cvResume) formData.append('cvResume', uploads.cvResume);
      if (uploads.idPassport) formData.append('idPassport', uploads.idPassport);
      if (uploads.contractDocument) formData.append('contractDocument', uploads.contractDocument);
      (uploads.educationCertificates || []).forEach((file) => formData.append('educationCertificates', file));
      (uploads.otherSupportingFiles || []).forEach((file) => formData.append('otherSupportingFiles', file));

      const apiBase = resolveApiBase();
      const res = await fetch(`${apiBase}/upload-info`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.user) {
        throw new Error(data?.message || 'Upload failed.');
      }

      setExistingFiles((prev) => ({
        ...prev,
        photoUrl: data.user.photoUrl || prev.photoUrl,
        guarantorFileUrl: data.user.guarantorFileUrl || prev.guarantorFileUrl,
        cvResumeUrl: data.user.cvResumeUrl || prev.cvResumeUrl,
        educationCertificateUrls: Array.isArray(data.user.educationCertificateUrls) ? data.user.educationCertificateUrls : prev.educationCertificateUrls,
        idPassportUrl: data.user.idPassportUrl || prev.idPassportUrl,
        contractDocumentUrl: data.user.contractDocumentUrl || prev.contractDocumentUrl,
        otherSupportingFileUrls: Array.isArray(data.user.otherSupportingFileUrls) ? data.user.otherSupportingFileUrls : prev.otherSupportingFileUrls,
      }));

      const roleValue = currentUser.displayRole || currentUser.role;
      setCurrentUser({ ...currentUser, ...data.user, role: roleValue, token: currentUser.token });

      toast({
        title: 'Upload complete',
        description: 'Your documents were uploaded successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      window.dispatchEvent(new Event('employee-profile-updated'));

      setUploads({
        photo: null,
        guarantorFile: null,
        cvResume: null,
        educationCertificates: [],
        idPassport: null,
        contractDocument: null,
        otherSupportingFiles: [],
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Unable to upload documents right now.',
        status: 'error',
        duration: 4500,
        isClosable: true,
      });
    } finally {
      setIsUploadingDocs(false);
    }
  };

  if (!currentUser?._id) {
    return (
      <Box p={6} borderWidth="1px" borderColor={borderColor} borderRadius="lg" bg={cardBg}>
        <Text>Please log in to fill your employee profile.</Text>
      </Box>
    );
  }

  return (
    <Box p={6} shadow="lg" borderWidth="1px" borderColor={borderColor} borderRadius="lg" bg={cardBg} mt={6}>
      <Stack as="form" spacing={10} onSubmit={handleSaveProfile}>
        <Text color="gray.500" fontSize="sm">
          {isLoadingProfile ? 'Loading your profile...' : 'Fill your employee profile and upload required documents.'}
        </Text>

        <Card bg={completionCardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
          <CardBody>
            <Stack spacing={3}>
              <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap={3} flexWrap="wrap">
                <HStack spacing={2} flexWrap="wrap">
                  <Heading size="sm">Profile completion</Heading>
                  <Badge colorScheme={canCreateCv ? 'green' : 'orange'}>{profileCompletion.percentage}%</Badge>
                  {!canCreateCv ? (
                    <Badge colorScheme="red">CV locked (needs {MIN_CV_PROFILE_COMPLETION}%)</Badge>
                  ) : (
                    <Badge colorScheme="green">CV unlocked</Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  CV generation requires at least {MIN_CV_PROFILE_COMPLETION}% completion
                </Text>
              </Flex>

              <Box position="relative">
                <Progress
                  value={profileCompletion.percentage}
                  colorScheme={canCreateCv ? 'green' : 'orange'}
                  size="lg"
                  borderRadius="md"
                  bg={progressTrackBg}
                />
                <Box
                  position="absolute"
                  left={`${MIN_CV_PROFILE_COMPLETION}%`}
                  top={0}
                  height="100%"
                  width="2px"
                  bg={progressThresholdColor}
                  transform="translateX(-1px)"
                  borderRadius="full"
                />
              </Box>

              {!canCreateCv && profileCompletion.missing.length ? (
                <Text fontSize="sm" color="gray.600">
                  Missing sections: {profileCompletion.missing.slice(0, 5).map((m) => m.label).join(', ')}
                  {profileCompletion.missing.length > 5 ? `, +${profileCompletion.missing.length - 5} more` : ''}
                </Text>
              ) : null}
            </Stack>
          </CardBody>
        </Card>

        <Stack spacing={4}>
          <Heading size="md">1. Personal Information</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel>First Name</FormLabel>
              <Input value={profile.firstName} onChange={setField('firstName')} placeholder="e.g. Sara" />
            </FormControl>
            <FormControl>
              <FormLabel>Middle Name</FormLabel>
              <Input value={profile.middleName} onChange={setField('middleName')} placeholder="e.g. Bekele" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Last Name</FormLabel>
              <Input value={profile.lastName} onChange={setField('lastName')} placeholder="e.g. Tesfaye" />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Gender</FormLabel>
              <Select value={profile.gender} onChange={setField('gender')} placeholder="Select">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Date of Birth</FormLabel>
              <Input type="date" value={profile.dateOfBirth} onChange={setField('dateOfBirth')} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Nationality</FormLabel>
              <Input value={profile.nationality} onChange={setField('nationality')} placeholder="e.g. Ethiopian" />
            </FormControl>

            <FormControl>
              <FormLabel>Marital Status</FormLabel>
              <Select value={profile.maritalStatus} onChange={setField('maritalStatus')} placeholder="Select">
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>National ID/Passport</FormLabel>
              <Input
                type="password"
                value={profile.nationalIdOrPassportNumber}
                onChange={handleNationalIdChange}
                placeholder="16 digit national id"
                inputMode="numeric"
                maxLength={16}
              />
            </FormControl>
          </SimpleGrid>
        </Stack>

        <Stack spacing={4}>
          <Heading size="md">2. Contact Information</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel>Personal Email</FormLabel>
              <Input type="email" value={profile.personalEmail} onChange={setField('personalEmail')} placeholder="e.g. name@example.com" />
            </FormControl>
            <FormControl>
              <FormLabel>Work Email</FormLabel>
              <Input type="email" value={currentUser.email || ''} isReadOnly />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Phone Number</FormLabel>
              <Input type="tel" value={profile.phoneNumber} onChange={setField('phoneNumber')} placeholder="+251 9xx xxx xxx" />
            </FormControl>

            <FormControl>
              <FormLabel>Current Address</FormLabel>
              <Input value={profile.currentAddress} onChange={setField('currentAddress')} placeholder="e.g. Bole, Addis Ababa" />
            </FormControl>
            <FormControl>
              <FormLabel>City</FormLabel>
              <Input value={profile.city} onChange={setField('city')} placeholder="e.g. Addis Ababa" />
            </FormControl>
            <FormControl>
              <FormLabel>Country</FormLabel>
              <Input value={profile.country} onChange={setField('country')} placeholder="e.g. Ethiopia" />
            </FormControl>
          </SimpleGrid>
        </Stack>

        {/* Employment details intentionally hidden for employee self-registration */}

        <Stack spacing={4}>
          <Heading size="md">3. Education Background</Heading>
          <Stack spacing={4}>
            {profile.educationBackground.map((item, index) => (
              <Box key={`edu-${index}`} borderWidth="1px" borderColor={borderColor} borderRadius="md" p={4}>
                <HStack justify="space-between" align="center" mb={3}>
                  <Text fontWeight="semibold">Education #{index + 1}</Text>
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="red"
                    leftIcon={<DeleteIcon />}
                    onClick={() => removeArrayItem('educationBackground', index, blankEducation)}
                    isDisabled={profile.educationBackground.length === 1}
                  >
                    Remove
                  </Button>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Highest Education Level</FormLabel>
                    <Input
                      value={item.highestEducationLevel}
                      onChange={updateArrayField('educationBackground', index, 'highestEducationLevel')}
                      placeholder="e.g. BSc, MSc, PhD"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Field of Study</FormLabel>
                    <Input
                      value={item.fieldOfStudy}
                      onChange={updateArrayField('educationBackground', index, 'fieldOfStudy')}
                      placeholder="e.g. Computer Science"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Institution Name</FormLabel>
                    <Input
                      value={item.institutionName}
                      onChange={updateArrayField('educationBackground', index, 'institutionName')}
                      placeholder="e.g. Addis Ababa University"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Graduation Year</FormLabel>
                    <Input
                      type="number"
                      value={item.graduationYear}
                      onChange={updateArrayField('educationBackground', index, 'graduationYear')}
                      placeholder="e.g. 2024"
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: 'auto', md: '1 / -1' }}>
                    <FormLabel>Certifications (Upload or text)</FormLabel>
                    <Textarea
                      value={item.certifications}
                      onChange={updateArrayField('educationBackground', index, 'certifications')}
                      placeholder="e.g. Cisco CCNA, CompTIA A+, AWS Cloud Practitioner"
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            ))}
            <Button
              size="sm"
              variant="outline"
              leftIcon={<AddIcon />}
              onClick={() => addArrayItem('educationBackground', blankEducation)}
              alignSelf="flex-start"
            >
              Add education
            </Button>
          </Stack>
        </Stack>

        <Stack spacing={4}>
          <Heading size="md">4. Work Experience</Heading>
          <Stack spacing={4}>
            {profile.workExperience.map((item, index) => (
              <Box key={`exp-${index}`} borderWidth="1px" borderColor={borderColor} borderRadius="md" p={4}>
                <HStack justify="space-between" align="center" mb={3}>
                  <Text fontWeight="semibold">Experience #{index + 1}</Text>
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="red"
                    leftIcon={<DeleteIcon />}
                    onClick={() => removeArrayItem('workExperience', index, blankExperience)}
                    isDisabled={profile.workExperience.length === 1}
                  >
                    Remove
                  </Button>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Previous Company Name</FormLabel>
                    <Input
                      value={item.previousCompanyName}
                      onChange={updateArrayField('workExperience', index, 'previousCompanyName')}
                      placeholder="e.g. Ethio Telecom"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Job Title</FormLabel>
                    <Input
                      value={item.jobTitle}
                      onChange={updateArrayField('workExperience', index, 'jobTitle')}
                      placeholder="e.g. IT Support Specialist"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Start Date</FormLabel>
                    <Input type="date" value={item.startDate} onChange={updateArrayField('workExperience', index, 'startDate')} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>End Date</FormLabel>
                    <Input type="date" value={item.endDate} onChange={updateArrayField('workExperience', index, 'endDate')} />
                  </FormControl>
                  <FormControl gridColumn={{ base: 'auto', md: '1 / -1' }}>
                    <FormLabel>Key Responsibilities</FormLabel>
                    <Textarea
                      value={item.keyResponsibilities}
                      onChange={updateArrayField('workExperience', index, 'keyResponsibilities')}
                      placeholder="e.g. Managed helpdesk tickets, configured user accounts, and maintained office network devices."
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            ))}
            <Button
              size="sm"
              variant="outline"
              leftIcon={<AddIcon />}
              onClick={() => addArrayItem('workExperience', blankExperience)}
              alignSelf="flex-start"
            >
              Add experience
            </Button>
          </Stack>
        </Stack>

        <Stack spacing={4}>
          <Heading size="md">5. Skills & Competencies</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Technical Skills (comma separated)</FormLabel>
              <Input value={profile.technicalSkills} onChange={setField('technicalSkills')} placeholder="e.g. Excel, React, SQL" />
            </FormControl>
            <FormControl>
              <FormLabel>Soft Skills (comma separated)</FormLabel>
              <Input value={profile.softSkills} onChange={setField('softSkills')} placeholder="e.g. Communication, Teamwork" />
            </FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel>Additional Details</FormLabel>
            <Textarea
              value={profile.skillsSummary || ''}
              onChange={(e) => setProfile((prev) => ({ ...prev, skillsSummary: e.target.value }))}
              placeholder="Describe your strongest skills, tools, and accomplishments in a few sentences."
              rows={4}
            />
          </FormControl>

          <Stack spacing={3}>
            <HStack justify="space-between" align="center">
              <Text fontWeight="semibold">Languages Spoken</Text>
              <Button size="xs" variant="outline" leftIcon={<AddIcon />} onClick={() => addArrayItem('languagesSpoken', blankLanguage)}>
                Add language
              </Button>
            </HStack>
            {profile.languagesSpoken.map((item, index) => (
              <SimpleGrid key={`lang-${index}`} columns={{ base: 1, md: 3 }} spacing={3}>
                <FormControl>
                  <FormLabel>Language</FormLabel>
                  <Input value={item.language} onChange={updateArrayField('languagesSpoken', index, 'language')} placeholder="e.g. Amharic" />
                </FormControl>
                <FormControl>
                  <FormLabel>Proficiency Level</FormLabel>
                  <Select value={item.proficiencyLevel} onChange={updateArrayField('languagesSpoken', index, 'proficiencyLevel')} placeholder="Select">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>&nbsp;</FormLabel>
                  <Button
                    width="full"
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    leftIcon={<DeleteIcon />}
                    onClick={() => removeArrayItem('languagesSpoken', index, blankLanguage)}
                    isDisabled={profile.languagesSpoken.length === 1}
                  >
                    Remove
                  </Button>
                </FormControl>
              </SimpleGrid>
            ))}
          </Stack>
        </Stack>

        {isHrOrAdmin && (
          <Stack spacing={4}>
            <Heading size="md">6. Salary & Contract Details (HR Only)</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl>
                <FormLabel>Salary Type</FormLabel>
                <Select value={profile.salaryDetails.salaryType} onChange={setSalaryField('salaryType')} placeholder="Select">
                  <option value="monthly">Monthly</option>
                  <option value="hourly">Hourly</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Basic Salary</FormLabel>
                <Input type="number" value={profile.salaryDetails.basicSalary} onChange={setSalaryField('basicSalary')} />
              </FormControl>
              <FormControl>
                <FormLabel>Allowances</FormLabel>
                <Input type="number" value={profile.salaryDetails.allowances} onChange={setSalaryField('allowances')} />
              </FormControl>

              <FormControl>
                <FormLabel>Payment Method</FormLabel>
                <Select value={profile.salaryDetails.paymentMethod} onChange={setSalaryField('paymentMethod')} placeholder="Select">
                  <option value="bank">Bank</option>
                  <option value="mobile">Mobile</option>
                  <option value="cash">Cash</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Bank Name</FormLabel>
                <Input value={profile.salaryDetails.bankName} onChange={setSalaryField('bankName')} />
              </FormControl>
              <FormControl>
                <FormLabel>Bank Account Number</FormLabel>
                <Input value={profile.salaryDetails.bankAccountNumber} onChange={setSalaryField('bankAccountNumber')} />
              </FormControl>

              <FormControl>
                <FormLabel>Contract Start Date</FormLabel>
                <Input type="date" value={profile.salaryDetails.contractStartDate} onChange={setSalaryField('contractStartDate')} />
              </FormControl>
              <FormControl>
                <FormLabel>Contract End Date</FormLabel>
                <Input type="date" value={profile.salaryDetails.contractEndDate} onChange={setSalaryField('contractEndDate')} />
              </FormControl>
            </SimpleGrid>
          </Stack>
        )}

        <Stack spacing={4}>
          <Heading size="md">7. Documents Upload</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Profile Photo (Upload)</FormLabel>
              <Input type="file" accept="image/*" onChange={handleFileChange('photo')} />
              {existingFiles.photoUrl && (
                <Text mt={2} fontSize="sm">
                  Current: <Link href={existingFiles.photoUrl} isExternal color="teal.600">View photo</Link>
                </Text>
              )}
            </FormControl>
            <FormControl>
              <FormLabel>CV / Resume</FormLabel>
              <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange('cvResume')} />
              {existingFiles.cvResumeUrl && (
                <Text mt={2} fontSize="sm">
                  Current: <Link href={existingFiles.cvResumeUrl} isExternal color="teal.600">View CV/Resume</Link>
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Educational Certificates</FormLabel>
              <Input type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleFileChange('educationCertificates', true)} />
              {!!existingFiles.educationCertificateUrls.length && (
                <Text mt={2} fontSize="sm">
                  Current:{' '}
                  {existingFiles.educationCertificateUrls.map((url, idx) => (
                    <Link key={`cert-${idx}`} href={url} isExternal color="teal.600" mr={3}>
                      Certificate {idx + 1}
                    </Link>
                  ))}
                </Text>
              )}
            </FormControl>
            <FormControl>
              <FormLabel>ID / Passport</FormLabel>
              <Input type="file" accept="image/*,.pdf" onChange={handleFileChange('idPassport')} />
              {existingFiles.idPassportUrl && (
                <Text mt={2} fontSize="sm">
                  Current: <Link href={existingFiles.idPassportUrl} isExternal color="teal.600">View ID/Passport</Link>
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Contract Document</FormLabel>
              <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange('contractDocument')} />
              {existingFiles.contractDocumentUrl && (
                <Text mt={2} fontSize="sm">
                  Current: <Link href={existingFiles.contractDocumentUrl} isExternal color="teal.600">View contract</Link>
                </Text>
              )}
            </FormControl>
            <FormControl>
              <FormLabel>Other Supporting Files</FormLabel>
              <Input type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleFileChange('otherSupportingFiles', true)} />
              {!!existingFiles.otherSupportingFileUrls.length && (
                <Text mt={2} fontSize="sm">
                  Current:{' '}
                  {existingFiles.otherSupportingFileUrls.map((url, idx) => (
                    <Link key={`support-${idx}`} href={url} isExternal color="teal.600" mr={3}>
                      File {idx + 1}
                    </Link>
                  ))}
                </Text>
              )}
            </FormControl>
          </SimpleGrid>

          <Button colorScheme="teal" onClick={handleUploadDocuments} isLoading={isUploadingDocs} alignSelf="flex-start">
            Upload selected documents
          </Button>
        </Stack>

        <Divider />

        <HStack justify="flex-end" spacing={3}>
          <Button type="submit" colorScheme="teal" isLoading={isSavingProfile}>
            Save profile
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
};

export default EmployeeInfoForm;
