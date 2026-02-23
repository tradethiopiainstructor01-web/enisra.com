const axios = require('axios');
const TELEGRAM_API_BASE = 'https://api.telegram.org';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ensureHttpsUrl = (v) => /^https:\/\//i.test(v || '');

const escapeHtml = (v = '') =>
  v.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

class TelegramService {
  constructor() {
    this.maxRetries = 3;
  }

  getBotToken() {
    return (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  }

  getChannelId() {
    return (process.env.TELEGRAM_CHANNEL_ID || '').trim();
  }

  getParseMode() {
    return (process.env.TELEGRAM_PARSE_MODE || 'HTML').toUpperCase();
  }

  getUseSystemProxy() {
    return (process.env.TELEGRAM_USE_SYSTEM_PROXY || 'false').toLowerCase() === 'true';
  }

  isEnabled() {
    return Boolean(this.getBotToken() && this.getChannelId());
  }

  apiUrl(method) {
    return `${TELEGRAM_API_BASE}/bot${this.getBotToken()}/${method}`;
  }

  formatJobMessage(job) {
    const company = job.company || job.companyName || process.env.EMPLOYER_NAME || 'N/A';
    const title = job.title || 'N/A';
    const type = job.type || 'N/A';
    const location = job.location || 'N/A';
    const requiredExperience = (job.description || 'No description provided.').slice(0, 2500);
    const yearsOfExperience = job.yearsOfExperience || 'N/A';

    return [
      `<b>Company:</b> ${escapeHtml(company)}`,
      '',
      `<b>Job Position:</b> ${escapeHtml(title)}`,
      '',
      `<b>Job Type:</b>${escapeHtml(type)}`,
      '',
      `<b>place of work:</b> ${escapeHtml(location)}`,
      '',
      '<b>Required  experience:</b>',
      escapeHtml(requiredExperience),
      '',
      `<b>Year of Experience:</b> ${escapeHtml(yearsOfExperience)}`,
    ].join('\n');
  }

  async sendJobPost({ job, jobUrl }) {
    if (!this.isEnabled()) return { skipped: true, reason: 'Telegram not configured' };
    if (!ensureHttpsUrl(jobUrl)) throw new Error('Job URL must be HTTPS');

    const payload = {
      chat_id: this.getChannelId(),
      text: this.formatJobMessage(job),
      parse_mode: this.getParseMode(),
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: 'Apply Now', url: jobUrl }]],
      },
    };

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt += 1) {
      try {
        const res = await axios.post(this.apiUrl('sendMessage'), payload, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
          ...(this.getUseSystemProxy() ? {} : { proxy: false }),
        });

        return {
          success: true,
          attempt,
          telegramMessageId: res?.data?.result?.message_id,
        };
      } catch (err) {
        lastError = err;
        console.error(`Telegram send failed (${attempt}/${this.maxRetries})`, err.response?.data || err.message);
        if (attempt < this.maxRetries) await sleep(attempt * 1000);
      }
    }
    throw lastError || new Error('Telegram send failed');
  }

  async setWebhook(webhookUrl) {
    if (!this.isEnabled()) throw new Error('Telegram not configured');
    if (!ensureHttpsUrl(webhookUrl)) throw new Error('Webhook URL must be HTTPS');

    const res = await axios.post(
      this.apiUrl('setWebhook'),
      {
        url: webhookUrl,
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET || undefined,
        drop_pending_updates: false,
      },
      {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
        ...(this.getUseSystemProxy() ? {} : { proxy: false }),
      }
    );

    return res.data;
  }
}

module.exports = new TelegramService();
