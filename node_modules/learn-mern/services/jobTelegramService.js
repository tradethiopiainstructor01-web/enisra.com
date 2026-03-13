// ─── Top-level imports (Lambda-safe: no lazy require) ───────────────────────
const TelegramJobPost = require('../models/TelegramJobPost');
const telegramService = (() => {
  try {
    return require('../telegram/telegramService');
  } catch (error) {
    console.error('Telegram service unavailable; skipping Telegram publishing.', error);
    return null;
  }
})();

// ─── DB connection management (Lambda/Mongoose safe) ─────────────────────────
let dbConnectionPromise = null;

const ensureDbConnected = async () => {
  const mongoose = require('mongoose');

  // Reuse existing connection across warm Lambda invocations
  if (mongoose.connection.readyState === 1) return;

  if (!dbConnectionPromise) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI environment variable is not set');

    dbConnectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    }).catch((err) => {
      dbConnectionPromise = null; // Allow retry on next invocation
      throw err;
    });
  }

  await dbConnectionPromise;
};

// ─── URL helpers ──────────────────────────────────────────────────────────────
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

/**
 * Builds the apply URL for a job.
 * Returns { url } on success or { error } on failure — never throws.
 */
const buildApplyUrl = (jobId) => {
  try {
    const jobIdText = String(jobId);
    const jobTemplate = (process.env.TELEGRAM_JOB_URL_TEMPLATE || '').trim();
    if (jobTemplate.includes('{jobId}')) {
      return { url: normalizePublicUrl(jobTemplate.replace('{jobId}', jobIdText)) };
    }

    const applyTemplate = (process.env.TELEGRAM_APPLY_URL || '').trim();
    if (applyTemplate.includes('{jobId}')) {
      return { url: normalizePublicUrl(applyTemplate.replace('{jobId}', jobIdText)) };
    }

    const baseCandidates = [
      process.env.JOB_PUBLIC_BASE_URL || '',
      process.env.TELEGRAM_JOB_URL_TEMPLATE || '',
      process.env.TELEGRAM_APPLY_URL || '',
      process.env.FRONTEND_URL || '',
    ];

    const base = baseCandidates.find((candidate) => isHttpsUrl(candidate));
    if (!base) {
      return { error: 'Set JOB_PUBLIC_BASE_URL or TELEGRAM_* to an HTTPS public URL' };
    }

    const jobPageUrl = buildJobPageUrl(base, jobIdText);
    if (!jobPageUrl) {
      return { error: 'Invalid HTTPS public job URL configuration' };
    }

    return { url: jobPageUrl };
  } catch (e) {
    return { error: shortErr(e) };
  }
};

// ─── Main export ──────────────────────────────────────────────────────────────
const SEND_TIMEOUT_MS = 10_000; // 10 s — tune to your Lambda timeout

/**
 * Wraps a promise with a timeout. Rejects if it takes too long.
 */
const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);

exports.publishNewJob = async (job) => {
  // ── Validate input ──────────────────────────────────────────────────────────
  if (!job?._id) return { skipped: true, reason: 'Invalid job' };

  // ── Check Telegram availability ─────────────────────────────────────────────
  if (!telegramService) {
    return { skipped: true, reason: 'Telegram service unavailable' };
  }
  if (!telegramService.isEnabled()) {
    const missingKeys = telegramService.getMissingConfigKeys();
    const suffix = missingKeys.length ? `: ${missingKeys.join(', ')}` : '';
    return { skipped: true, reason: `Telegram config missing${suffix}` };
  }

  // ── Build URL before touching the DB ───────────────────────────────────────
  const { url: jobUrl, error: urlError } = buildApplyUrl(job._id);
  if (urlError) {
    console.error('Telegram URL build failed', { jobId: String(job._id), error: urlError });
    return { success: false, error: urlError };
  }

  // ── Ensure DB connection (Lambda-safe) ──────────────────────────────────────
  try {
    await ensureDbConnected();
  } catch (e) {
    const msg = shortErr(e);
    console.error('DB connection failed', { error: msg });
    return { success: false, error: `DB connection failed: ${msg}` };
  }

  // ── Deduplicate ─────────────────────────────────────────────────────────────
  try {
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
  } catch (e) {
    const msg = shortErr(e);
    console.error('Telegram dedup check failed', { jobId: String(job._id), error: msg });
    return { success: false, error: `DB error during dedup: ${msg}` };
  }

  // ── Send to Telegram (with timeout) ────────────────────────────────────────
  try {
    const res = await withTimeout(
      telegramService.sendJobPost({ job, jobUrl }),
      SEND_TIMEOUT_MS,
      'telegramService.sendJobPost'
    );

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
      { $set: { status: 'failed', attempts: 3, lastError: msg } }
    ).catch((dbErr) =>
      console.error('Failed to record Telegram error in DB', { error: shortErr(dbErr) })
    );

    console.error('Telegram failed', { jobId: String(job._id), error: msg });
    return { success: false, error: msg };
  }
};

exports.buildApplyUrl = buildApplyUrl;