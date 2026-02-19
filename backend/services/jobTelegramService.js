const TelegramJobPost = require('../models/TelegramJobPost');
const telegramService = require('../telegram/telegramService');

const shortErr = (e) => e?.response?.data?.description || e?.message || 'Unknown error';

const buildApplyUrl = (jobId) => {
  if (process.env.TELEGRAM_APPLY_URL) return process.env.TELEGRAM_APPLY_URL;
  if (process.env.TELEGRAM_JOB_URL_TEMPLATE?.includes('{jobId}')) {
    return process.env.TELEGRAM_JOB_URL_TEMPLATE.replace('{jobId}', String(jobId));
  }
  const base = process.env.JOB_PUBLIC_BASE_URL || process.env.FRONTEND_URL;
  if (!base) throw new Error('Set TELEGRAM_APPLY_URL or JOB_PUBLIC_BASE_URL');
  return `${base.replace(/\/$/, '')}/jobs/${jobId}`;
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
