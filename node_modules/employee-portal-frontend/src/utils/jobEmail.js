const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const normalizeRole = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const normalizeEmailCandidate = (value) => {
  const rawValue = (value || '').toString().trim();
  if (!rawValue) return '';
  return rawValue.replace(/^mailto:/i, '').split('?')[0].trim();
};

const extractEmail = (value) => {
  const candidate = normalizeEmailCandidate(value);
  if (!candidate) return '';
  const match = candidate.match(EMAIL_REGEX);
  return match ? match[0].toLowerCase() : '';
};

const extractEmails = (value) => {
  const candidate = normalizeEmailCandidate(value);
  if (!candidate) return [];
  const matches = candidate.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
  if (!matches) return [];

  const unique = new Set();
  for (const item of matches) {
    const email = item.toLowerCase().trim();
    if (email) unique.add(email);
  }

  return Array.from(unique);
};

export const resolveJobContactEmails = (job) => {
  if (!job) return [];

  const candidates = [
    job.contactEmail,
    job.contact_email,
    job.postedByEmail,
    job.posted_by_email,
    job.email,
    job.contact,
    job.postedByName,
  ];

  const unique = new Set();
  for (const value of candidates) {
    const emails = extractEmails(value);
    for (const email of emails) {
      if (email) unique.add(email);
    }
  }

  return Array.from(unique);
};

export const resolveJobContactEmail = (job) => {
  if (!job) return '';

  const candidates = [
    job.contactEmail,
    job.contact_email,
    job.postedByEmail,
    job.posted_by_email,
    job.email,
    job.contact,
    job.postedByName,
  ];

  for (const value of candidates) {
    const email = extractEmail(value);
    if (email) return email;
  }

  return '';
};

const resolveCurrentUserEmail = () => {
  if (typeof window === 'undefined') return '';

  const localStorageCandidates = [
    localStorage.getItem('userEmail'),
    localStorage.getItem('userName'),
  ];

  for (const value of localStorageCandidates) {
    const email = extractEmail(value);
    if (email) return email;
  }

  return '';
};

export const getJobApplyAccess = () => {
  if (typeof window === 'undefined') {
    return { allowed: false, reason: 'not_authenticated' };
  }

  const token = localStorage.getItem('userToken');
  if (!token) {
    return { allowed: false, reason: 'not_authenticated' };
  }

  const storedRole = localStorage.getItem('userRole') || localStorage.getItem('userRoleRaw') || '';
  const role = normalizeRole(storedRole);
  if (role !== 'employee') {
    return { allowed: false, reason: 'not_employee' };
  }

  return { allowed: true, reason: 'ok' };
};

export const getJobApplyAccessMessage = (reason) => {
  if (reason === 'not_employee') {
    return 'Only registered employee accounts can apply for jobs.';
  }
  return 'Please login with a registered employee account to apply for jobs.';
};

export const buildJobApplicationMailto = (job, bodyText = '') => {
  const recipients = resolveJobContactEmails(job);
  if (!recipients.length) return '';

  const [primaryRecipient, ...additionalRecipients] = recipients;
  const ccRecipients = [...additionalRecipients];

  const currentUserEmail = resolveCurrentUserEmail();
  if (currentUserEmail && !recipients.includes(currentUserEmail)) {
    ccRecipients.push(currentUserEmail);
  }

  const params = new URLSearchParams();
  params.set('subject', `Application for ${job?.title || 'job'}`);
  if (bodyText) {
    params.set('body', bodyText);
  }
  if (ccRecipients.length) {
    params.set('cc', ccRecipients.join(','));
  }

  return `mailto:${primaryRecipient}?${params.toString()}`;
};

export const openJobApplicationEmail = (job, bodyText = '') => {
  const mailtoUrl = buildJobApplicationMailto(job, bodyText);
  if (!mailtoUrl) return false;

  window.location.assign(mailtoUrl);
  return true;
};
