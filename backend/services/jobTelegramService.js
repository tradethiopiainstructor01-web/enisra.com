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

const toNonEmptyString = (value = '') => (value || '').toString().trim();

const deriveRequestOrigin = (requestMeta = {}) => {
  const forwardedProto = toNonEmptyString(requestMeta.forwardedProto).split(',')[0].trim();
  const forwardedHost = toNonEmptyString(requestMeta.forwardedHost).split(',')[0].trim();
  const host = forwardedHost || toNonEmptyString(requestMeta.host);
  const proto = forwardedProto || toNonEmptyString(requestMeta.protocol) || 'https';

  if (!host) return '';
  if (!/^https?$/i.test(proto)) return '';

  return `${proto.toLowerCase()}://${host}`.replace(/\/+$/, '');
};

const buildJobPageUrl = (baseValue, jobId) => {
  const normalizedBase = normalizePublicUrl(baseValue);
  if (!normalizedBase) return '';

  const baseUrl = new URL(normalizedBase);
  const siteOrigin = baseUrl.origin;
  return new URL(`/jobs/${jobId}`, `${siteOrigin}/`).toString();
};

const resolvePublicBaseUrl = (requestMeta = {}) => {
  const candidates = [
    process.env.JOB_PUBLIC_BASE_URL,
    process.env.TELEGRAM_JOB_URL_TEMPLATE,
    process.env.TELEGRAM_APPLY_URL,
    process.env.FRONTEND_URL,
    process.env.APP_URL,
    process.env.PUBLIC_URL,
    deriveRequestOrigin(requestMeta),
  ];

  return candidates
    .map((candidate) => normalizePublicUrl(candidate || ''))
    .find((candidate) => isHttpsUrl(candidate));
};

const buildApplyUrl = (jobId, requestMeta = {}) => {
  const jobIdText = String(jobId);
  const jobTemplate = (process.env.TELEGRAM_JOB_URL_TEMPLATE || '').trim();
  if (jobTemplate.includes('{jobId}')) {
    return normalizePublicUrl(jobTemplate.replace('{jobId}', jobIdText));
  }

  const applyTemplate = (process.env.TELEGRAM_APPLY_URL || '').trim();
  if (applyTemplate.includes('{jobId}')) {
    return normalizePublicUrl(applyTemplate.replace('{jobId}', jobIdText));
  }

  const base = resolvePublicBaseUrl(requestMeta);
  if (!base) {
    throw new Error(
      'Set JOB_PUBLIC_BASE_URL/FRONTEND_URL to a public HTTPS host or ensure AWS forwards x-forwarded-host and x-forwarded-proto'
    );
  }

  const jobPageUrl = buildJobPageUrl(base, jobIdText);
  if (!jobPageUrl) throw new Error('Invalid HTTPS public job URL configuration');

  return jobPageUrl;
};

exports.publishNewJob = async (job, requestMeta = {}) => {
  if (!job?._id) return { skipped: true, reason: 'Invalid job' };
  if (!telegramService.isEnabled()) {
    const missingKeys = telegramService.getMissingConfigKeys();
    const suffix = missingKeys.length ? `: ${missingKeys.join(', ')}` : '';
    return { skipped: true, reason: `Telegram config missing${suffix}` };
  }

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
    let jobUrl = '';
    let jobUrlWarning = '';
    try {
      jobUrl = buildApplyUrl(job._id, requestMeta);
    } catch (urlError) {
      jobUrlWarning = shortErr(urlError);
      console.warn('Telegram job URL unavailable, sending without link', {
        jobId: String(job._id),
        error: jobUrlWarning,
      });
    }

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

    console.log('Telegram posted', {
      jobId: String(job._id),
      telegramMessageId: res.telegramMessageId,
      withoutJobUrl: Boolean(res.withoutJobUrl),
      jobUrlWarning: jobUrlWarning || undefined,
    });
    return {
      success: true,
      jobUrl,
      telegramMessageId: res.telegramMessageId,
      withoutJobUrl: Boolean(res.withoutJobUrl),
      ...(jobUrlWarning ? { warning: jobUrlWarning } : {}),
    };
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

exports.buildApplyUrl = buildApplyUrl;
