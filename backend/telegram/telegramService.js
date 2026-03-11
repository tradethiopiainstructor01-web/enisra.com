const TELEGRAM_API_BASE = 'https://api.telegram.org';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ensureHttpsUrl = (v) => /^https:\/\//i.test(v || '');
const TELEGRAM_TIMEOUT_MS = 10000;

const resolveFetchRuntime = () => {
  if (typeof globalThis.fetch === 'function') {
    return {
      fetchImpl: globalThis.fetch.bind(globalThis),
      AbortControllerImpl: globalThis.AbortController,
    };
  }

  try {
    const fetchModule = require('node-fetch-native-with-agent');
    return {
      fetchImpl: fetchModule.fetch,
      AbortControllerImpl: fetchModule.AbortController || globalThis.AbortController,
    };
  } catch (error) {
    throw new Error('Fetch API is unavailable in this runtime');
  }
};

const buildTelegramError = (message, data = null, status = null) => {
  const error = new Error(message);
  if (data || status) {
    error.response = {
      data,
      status,
    };
  }
  return error;
};

const escapeHtml = (v = '') =>
  v.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

class TelegramService {
  constructor() {
    this.maxRetries = 3;
    const runtime = resolveFetchRuntime();
    this.fetchImpl = runtime.fetchImpl;
    this.AbortControllerImpl = runtime.AbortControllerImpl;
  }

  getBotToken() {
    return (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  }

  getChannelId() {
    return (process.env.TELEGRAM_CHANNEL_ID || '').trim();
  }

  getParseMode() {
    const raw = (process.env.TELEGRAM_PARSE_MODE || 'HTML').trim().toLowerCase();
    if (raw === 'markdownv2') return 'MarkdownV2';
    if (raw === 'markdown') return 'Markdown';
    return 'HTML';
  }

  getUseSystemProxy() {
    return (process.env.TELEGRAM_USE_SYSTEM_PROXY || 'false').toLowerCase() === 'true';
  }

  getMissingConfigKeys() {
    const missing = [];

    if (!this.getBotToken()) {
      missing.push('TELEGRAM_BOT_TOKEN');
    }

    if (!this.getChannelId()) {
      missing.push('TELEGRAM_CHANNEL_ID');
    }

    return missing;
  }

  isEnabled() {
    return this.getMissingConfigKeys().length === 0;
  }

  apiUrl(method) {
    return `${TELEGRAM_API_BASE}/bot${this.getBotToken()}/${method}`;
  }

  async request(method, apiMethod, payload = undefined) {
    const controller = this.AbortControllerImpl ? new this.AbortControllerImpl() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS) : null;

    try {
      const response = await this.fetchImpl(this.apiUrl(apiMethod), {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
        ...(controller ? { signal: controller.signal } : {}),
      });

      const rawText = await response.text();
      let data = null;

      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch (_error) {
          data = { ok: false, description: rawText };
        }
      }

      if (!response.ok || data?.ok === false) {
        const description = data?.description || `HTTP ${response.status}`;
        throw buildTelegramError(`Telegram error: ${description}`, data, response.status);
      }

      return data;
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw buildTelegramError('Telegram request timed out', { description: 'Request timed out' }, 408);
      }
      throw error;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  // optionally include the jobUrl so recipients can see it even if the
  // inline button is stripped or they forward the message.  `jobUrl` is not
  // validated here (sendJobPost already throws if it's missing/invalid).
  formatJobMessage(job, jobUrl) {
    const company = job.company || job.companyName || process.env.EMPLOYER_NAME || 'N/A';
    const title = job.title || 'N/A';
    const type = job.type || 'N/A';
    const location = job.location || 'N/A';
    const requiredExperience = (job.description || 'No description provided.').slice(0, 2500);
    const yearsOfExperience = job.yearsOfExperience || 'N/A';

    const lines = [
      `<b>Company:</b> ${escapeHtml(company)}`,
      '',
      `<b>Job Position:</b> ${escapeHtml(title)}`,
      '',
      `<b>Job Type:</b> ${escapeHtml(type)}`,
      '',
      `<b>Place of Work:</b> ${escapeHtml(location)}`,
      '',
      '<b>Required Experience:</b>',
      escapeHtml(requiredExperience),
      '',
      `<b>Years of Experience:</b> ${escapeHtml(yearsOfExperience)}`,
    ];

    if (jobUrl) {
      lines.push('', `<a href="${escapeHtml(jobUrl)}">Apply now</a>`);
    }

    return lines.join('\n');
  }

  async sendJobPost({ job, jobUrl }) {
    if (!this.isEnabled()) return { skipped: true, reason: 'Telegram not configured' };
    if (!ensureHttpsUrl(jobUrl)) throw new Error('Job URL must be HTTPS');

    const payload = {
      chat_id: this.getChannelId(),
      text: this.formatJobMessage(job, jobUrl),
      parse_mode: this.getParseMode(),
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[{ text: 'Apply Now', url: jobUrl }]],
      },
    };

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt += 1) {
      try {
        const res = await this.request('POST', 'sendMessage', payload);

        return {
          success: true,
          attempt,
          telegramMessageId: res?.result?.message_id,
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

    return this.request('POST', 'setWebhook', {
      url: webhookUrl,
      secret_token: process.env.TELEGRAM_WEBHOOK_SECRET || undefined,
      drop_pending_updates: false,
    });
  }

  async getBotProfile() {
    if (!this.isEnabled()) throw new Error('Telegram not configured');
    const res = await this.request('GET', 'getMe');
    return res?.result || null;
  }

  async getChannelInfo() {
    if (!this.isEnabled()) throw new Error('Telegram not configured');
    const res = await this.request('POST', 'getChat', { chat_id: this.getChannelId() });
    return res?.result || null;
  }
}

module.exports = new TelegramService();
