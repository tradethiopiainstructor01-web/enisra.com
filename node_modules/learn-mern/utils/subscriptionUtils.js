const SHORT_CODE = '9295';

const normalizeMsisdn = (raw = '') => {
  const digits = raw.toString().replace(/\D/g, '');
  if (!digits) return '';
  if (/^09\d{8}$/.test(digits)) return `251${digits.slice(1)}`;
  if (/^9\d{8}$/.test(digits)) return `251${digits}`;
  if (/^251\d{9}$/.test(digits)) return digits;
  return digits;
};

const isValidMsisdn = (msisdn = '') => /^251\d{9}$/.test(msisdn);

const normalizeKeyword = (text = '') =>
  text.toString().trim().toUpperCase();

const generatePin4 = () => String(Math.floor(1000 + Math.random() * 9000));

module.exports = {
  SHORT_CODE,
  normalizeMsisdn,
  isValidMsisdn,
  normalizeKeyword,
  generatePin4
};
