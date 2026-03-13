const isHttpsReq = (req) => {
  if (process.env.NODE_ENV !== 'production') return true;
  const fp = req.headers['x-forwarded-proto'];
  return fp ? fp === 'https' : req.secure === true;
};

const shortErr = (e) => e?.response?.data?.description || e?.message || 'Unknown error';
let telegramServiceLoadWarningShown = false;
let jobTelegramServiceLoadWarningShown = false;

const loadTelegramService = () => {
  try {
    return require('../telegram/telegramService');
  } catch (error) {
    if (!telegramServiceLoadWarningShown) {
      telegramServiceLoadWarningShown = true;
      console.error('Telegram service unavailable; Telegram admin routes will degrade gracefully.', error);
    }
    return null;
  }
};

const loadJobTelegramService = () => {
  try {
    return require('../services/jobTelegramService');
  } catch (error) {
    if (!jobTelegramServiceLoadWarningShown) {
      jobTelegramServiceLoadWarningShown = true;
      console.error('Job Telegram service unavailable; Telegram debug route will degrade gracefully.', error);
    }
    return null;
  }
};

const maskSecret = (value = '', visibleStart = 6, visibleEnd = 0) => {
  const raw = (value || '').toString().trim();
  if (!raw) return '';
  if (raw.length <= visibleStart + visibleEnd) {
    return `${raw.slice(0, 2)}***`;
  }
  const start = raw.slice(0, visibleStart);
  const end = visibleEnd > 0 ? raw.slice(-visibleEnd) : '';
  return `${start}***${end}`;
};

exports.webhook = async (req, res) => {
  try {
    if (!isHttpsReq(req)) return res.status(400).json({ success: false, message: 'HTTPS required' });

    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret) {
      const got = req.headers['x-telegram-bot-api-secret-token'];
      if (!got || got !== secret) return res.status(401).json({ success: false, message: 'Invalid secret' });
    }

    console.log('Telegram webhook update', { updateId: req.body?.update_id, at: new Date().toISOString() });
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Webhook error', e.message);
    return res.status(200).json({ success: true });
  }
};

exports.setWebhook = async (req, res) => {
  try {
    const telegramService = loadTelegramService();
    if (!telegramService) {
      return res.status(503).json({
        success: false,
        message: 'Telegram service unavailable',
      });
    }

    const url = req.body?.url || process.env.TELEGRAM_WEBHOOK_URL;
    const out = await telegramService.setWebhook(url);
    return res.json({ success: true, data: out });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to set webhook', error: e.message });
  }
};

exports.debugStatus = async (req, res) => {
  const sampleJobId = (req.query?.jobId || 'debug-job-id').toString().trim() || 'debug-job-id';
  const telegramService = loadTelegramService();
  const jobTelegramService = loadJobTelegramService();
  const botToken = telegramService ? telegramService.getBotToken() : '';
  const channelId = telegramService ? telegramService.getChannelId() : '';
  const envSnapshot = {
    nodeEnv: process.env.NODE_ENV || 'development',
    cwd: process.cwd(),
    botTokenConfigured: Boolean(botToken),
    botTokenPreview: maskSecret(botToken),
    botTokenLength: botToken.length,
    channelConfigured: Boolean(channelId),
    channelIdValue: channelId,
    jobPublicBaseUrl: (process.env.JOB_PUBLIC_BASE_URL || '').trim(),
    telegramJobUrlTemplate: (process.env.TELEGRAM_JOB_URL_TEMPLATE || '').trim(),
    telegramApplyUrl: (process.env.TELEGRAM_APPLY_URL || '').trim(),
    frontendUrl: (process.env.FRONTEND_URL || '').trim(),
    webhookUrl: (process.env.TELEGRAM_WEBHOOK_URL || '').trim(),
  };
  let sampleJobUrl = '';
  let sampleJobUrlError = '';
  let botProfile = null;
  let botProfileError = '';
  let channelInfo = null;
  let channelInfoError = '';
  let telegramServiceLoadError = '';
  let jobTelegramServiceLoadError = '';

  try {
    if (jobTelegramService?.buildApplyUrl) {
      sampleJobUrl = jobTelegramService.buildApplyUrl(sampleJobId);
    } else {
      jobTelegramServiceLoadError = 'Job Telegram service unavailable';
      sampleJobUrlError = 'Job Telegram service unavailable';
    }
  } catch (e) {
    sampleJobUrlError = shortErr(e);
  }

  if (!telegramService) {
    telegramServiceLoadError = 'Telegram service unavailable';
  } else if (telegramService.isEnabled()) {
    try {
      const result = await telegramService.getBotProfile();
      if (result) {
        botProfile = {
          id: result.id,
          username: result.username || '',
          firstName: result.first_name || '',
          canJoinGroups: Boolean(result.can_join_groups),
          canReadAllGroupMessages: Boolean(result.can_read_all_group_messages),
          supportsInlineQueries: Boolean(result.supports_inline_queries),
        };
      }
    } catch (e) {
      botProfileError = shortErr(e);
    }

    try {
      const result = await telegramService.getChannelInfo();
      if (result) {
        channelInfo = {
          id: result.id,
          title: result.title || '',
          username: result.username || '',
          type: result.type || '',
        };
      }
    } catch (e) {
      channelInfoError = shortErr(e);
    }
  }

  console.log('Telegram debug env snapshot', envSnapshot);

  return res.json({
    success: true,
    data: {
      environment: process.env.NODE_ENV || 'development',
      telegramEnabled: telegramService ? telegramService.isEnabled() : false,
      missingConfigKeys: telegramService ? telegramService.getMissingConfigKeys() : ['TELEGRAM_SERVICE_UNAVAILABLE'],
      parseMode: telegramService ? telegramService.getParseMode() : '',
      useSystemProxy: telegramService ? telegramService.getUseSystemProxy() : false,
      botTokenConfigured: Boolean(botToken),
      channelConfigured: Boolean(channelId),
      urlConfig: {
        jobPublicBaseUrl: (process.env.JOB_PUBLIC_BASE_URL || '').trim(),
        telegramJobUrlTemplate: (process.env.TELEGRAM_JOB_URL_TEMPLATE || '').trim(),
        telegramApplyUrl: (process.env.TELEGRAM_APPLY_URL || '').trim(),
        frontendUrl: (process.env.FRONTEND_URL || '').trim(),
      },
      webhookConfigured: Boolean((process.env.TELEGRAM_WEBHOOK_URL || '').trim()),
      webhookUrl: (process.env.TELEGRAM_WEBHOOK_URL || '').trim(),
      envSnapshot,
      sampleJobId,
      sampleJobUrl,
      sampleJobUrlError,
      telegramServiceLoadError,
      jobTelegramServiceLoadError,
      botProfile,
      botProfileError,
      channelInfo,
      channelInfoError,
    },
  });
};
