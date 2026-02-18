const isTextFilled = (value) => typeof value === 'string' && value.trim().length > 0;

const hasAnyText = (...values) => values.some((value) => isTextFilled(value));

const hasAnyArrayText = (value) => {
  if (Array.isArray(value)) {
    return value.some((item) => isTextFilled(item));
  }
  return isTextFilled(value);
};

const hasAnyFilledEducationEntry = (educationBackground = []) =>
  Array.isArray(educationBackground) &&
  educationBackground.some(
    (entry) =>
      hasAnyText(
        entry?.highestEducationLevel,
        entry?.fieldOfStudy,
        entry?.institutionName,
        entry?.certifications
      ) || Boolean(entry?.graduationYear)
  );

const hasAnyFilledExperienceEntry = (workExperience = []) =>
  Array.isArray(workExperience) &&
  workExperience.some(
    (entry) =>
      hasAnyText(
        entry?.previousCompanyName,
        entry?.jobTitle,
        entry?.keyResponsibilities
      ) || Boolean(entry?.startDate) || Boolean(entry?.endDate)
  );

const hasAnyFilledLanguage = (languagesSpoken = []) =>
  Array.isArray(languagesSpoken) &&
  languagesSpoken.some((entry) => hasAnyText(entry?.language, entry?.proficiencyLevel));

export const MIN_CV_PROFILE_COMPLETION = 70;

export const getEmployeeProfileCompletion = (profile) => {
  const source = profile || {};

  const hasFullName =
    hasAnyText(source.firstName, source.lastName) ||
    hasAnyText(source.fullName);

  const checkpoints = [
    { key: 'name', label: 'Full name', completed: hasFullName },
    {
      key: 'email',
      label: 'Email address',
      completed: hasAnyText(source.email, source.workEmail, source.altEmail, source.personalEmail),
    },
    { key: 'phone', label: 'Phone number', completed: hasAnyText(source.phone, source.altPhone) },
    {
      key: 'address',
      label: 'Address',
      completed: hasAnyText(source.currentAddress, source.city, source.country),
    },
    {
      key: 'personal',
      label: 'Personal details',
      completed: hasAnyText(
        source.gender,
        source.dateOfBirth,
        source.nationality,
        source.maritalStatus,
        source.nationalIdOrPassportNumber
      ),
    },
    {
      key: 'job',
      label: 'Job details',
      completed: hasAnyText(source.jobTitle, source.department, source.position),
    },
    {
      key: 'employment',
      label: 'Employment details',
      completed: hasAnyText(
        source.employeeId,
        source.employmentType,
        source.workLocation,
        source.employmentStatus,
        source.hireDate,
        source.reportingManager
      ),
    },
    {
      key: 'education',
      label: 'Education background',
      completed: hasAnyFilledEducationEntry(source.educationBackground),
    },
    {
      key: 'experience',
      label: 'Work experience',
      completed: hasAnyFilledExperienceEntry(source.workExperience),
    },
    {
      key: 'skills',
      label: 'Technical or soft skills',
      completed: hasAnyArrayText(source.technicalSkills) || hasAnyArrayText(source.softSkills),
    },
    {
      key: 'languages',
      label: 'Languages',
      completed: hasAnyFilledLanguage(source.languagesSpoken),
    },
    {
      key: 'photo',
      label: 'Profile photo',
      completed: hasAnyText(source.photo, source.photoUrl),
    },
  ];

  const total = checkpoints.length;
  const completed = checkpoints.filter((checkpoint) => checkpoint.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const missing = checkpoints.filter((checkpoint) => !checkpoint.completed);

  return {
    completed,
    total,
    percentage,
    checkpoints,
    missing,
    meetsCvRequirement: percentage >= MIN_CV_PROFILE_COMPLETION,
  };
};
