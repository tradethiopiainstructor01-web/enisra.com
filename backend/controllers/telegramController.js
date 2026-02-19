const telegramService = require('../telegram/telegramService');

const isHttpsReq = (req) => {
  if (process.env.NODE_ENV !== 'production') return true;
  const fp = req.headers['x-forwarded-proto'];
  return fp ? fp === 'https' : req.secure === true;
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
    const url = req.body?.url || process.env.TELEGRAM_WEBHOOK_URL;
    const out = await telegramService.setWebhook(url);
    return res.json({ success: true, data: out });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to set webhook', error: e.message });
  }
};
