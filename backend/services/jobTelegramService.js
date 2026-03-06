const TelegramJobPost = require('../models/TelegramJobPost');
const telegramService = require('../telegram/telegramService');

const shortErr = (e) => e?.response?.data?.description || e?.message || 'Unknown error';

const normalizePublicUrl = (value = '') => {
  const raw = (value || '').toString().trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, '');
  return `https://${raw.replace(/^\/+/, '').replace(/\/+$/, '')}`;
};

const isHttpsUrl = (value = '') => /^https:\/\//i.test((value || '').toString().trim());

const buildJobPageUrl = (baseValue, jobId) => {
  const normalizedBase = normalizePublicUrl(baseValue);
  if (!normalizedBase) return '';

  const baseUrl = new URL(normalizedBase);
  const siteOrigin = baseUrl.origin;
  return new URL(`/jobs/${jobId}`, `${siteOrigin}/`).toString();
};

const buildApplyUrl = (jobId) => {
  const jobIdText = String(jobId);
  const jobTemplate = (process.env.TELEGRAM_JOB_URL_TEMPLATE || '').trim();
  if (jobTemplate.includes('{jobId}')) {
    return normalizePublicUrl(jobTemplate.replace('{jobId}', jobIdText));
  }

  const applyTemplate = (process.env.TELEGRAM_APPLY_URL || '').trim();
  if (applyTemplate.includes('{jobId}')) {
    return normalizePublicUrl(applyTemplate.replace('{jobId}', jobIdText));
  }

  const baseCandidates = [
    process.env.JOB_PUBLIC_BASE_URL
    || '',
    process.env.TELEGRAM_JOB_URL_TEMPLATE || '',
    process.env.TELEGRAM_APPLY_URL || '',
    process.env.FRONTEND_URL || '',
  ];

  const base = baseCandidates.find((candidate) => isHttpsUrl(candidate));
  if (!base) throw new Error('Set JOB_PUBLIC_BASE_URL or TELEGRAM_* to an HTTPS public URL');

  const jobPageUrl = buildJobPageUrl(base, jobIdText);
  if (!jobPageUrl) throw new Error('Invalid HTTPS public job URL configuration');

  return jobPageUrl;
};

exports.publishNewJob = async (job) => {
  if (!job?._id) return { skipped: true, reason: 'Invalid job' };
  if (!telegramService.isEnabled()) return { skipped: true, reason: 'Telegram config missing' };

  const old = await TelegramJobPost.findOne({ jobId: job._id }).lean();
  if (old?.status === 'posted') return { skipped: true, reason: 'Already posted' };

  if (!old) {
    try {
      await TelegramJobPost.create({ jobId: job._id, status: 'pending' });
    } catch (e) {
      if (e?.code === 11000) return { skipped: true, reason: 'Duplicate prevented' };
      throw e;
    }
  }

  try {
    const jobUrl = buildApplyUrl(job._id);
    const res = await telegramService.sendJobPost({ job, jobUrl });

    await TelegramJobPost.findOneAndUpdate(
      { jobId: job._id },
      {
        $set: {
          status: 'posted',
          attempts: res.attempt || 1,
          telegramMessageId: res.telegramMessageId,
          postedAt: new Date(),
        },
        $unset: { lastError: 1 },
      }
    );

    console.log('Telegram posted', { jobId: String(job._id), telegramMessageId: res.telegramMessageId });
    return { success: true, jobUrl, telegramMessageId: res.telegramMessageId };
  } catch (e) {
    const msg = shortErr(e);
    await TelegramJobPost.findOneAndUpdate(
      { jobId: job._id },
      { status: 'failed', attempts: 3, lastError: msg }
    );
    console.error('Telegram failed', { jobId: String(job._id), error: msg });
    return { success: false, error: msg };
  }
};
