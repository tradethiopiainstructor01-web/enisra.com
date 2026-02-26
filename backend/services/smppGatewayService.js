const SmsTransaction = require('../models/SmsTransaction');
const { SHORT_CODE } = require('../utils/subscriptionUtils');

let smppLib = null;
try {
  // Optional dependency. Service still works with simulation endpoints if missing.
  // eslint-disable-next-line global-require
  smppLib = require('smpp');
} catch (error) {
  smppLib = null;
}

const parseDeliveryReceipt = (text = '') => {
  const idMatch = text.match(/\bid:([^\s]+)/i);
  const statMatch = text.match(/\bstat:([^\s]+)/i);
  const errMatch = text.match(/\berr:([^\s]+)/i);
  return {
    messageId: idMatch ? idMatch[1] : null,
    status: statMatch ? statMatch[1] : 'UNKNOWN',
    errorCode: errMatch ? errMatch[1] : null
  };
};

class SmppGatewayService {
  constructor() {
    this.session = null;
    this.isBound = false;
    this.started = false;
    this.handlers = {
      mo: null,
      dlr: null
    };
  }

  onMo(handler) {
    this.handlers.mo = handler;
  }

  onDlr(handler) {
    this.handlers.dlr = handler;
  }

  start() {
    if (this.started) return;
    this.started = true;

    const enabled = process.env.SMPP_ENABLED === 'true';
    if (!enabled) {
      console.log('[SMPP] Disabled via SMPP_ENABLED flag.');
      return;
    }
    if (!smppLib) {
      console.warn('[SMPP] `smpp` package is not installed. SMPP listener not started.');
      return;
    }

    const url = process.env.SMPP_URL;
    if (!url) {
      console.warn('[SMPP] SMPP_URL is missing. SMPP listener not started.');
      return;
    }

    this.connect(url);
  }

  connect(url) {
    this.session = smppLib.connect(url);

    this.session.on('connect', () => {
      this.bind();
    });

    this.session.on('close', () => {
      this.isBound = false;
      console.warn('[SMPP] Connection closed. Reconnecting in 5 seconds.');
      setTimeout(() => this.connect(url), 5000);
    });

    this.session.on('error', (error) => {
      this.isBound = false;
      console.error('[SMPP] Session error:', error.message);
    });

    this.session.on('enquire_link', (pdu) => {
      this.session.send(pdu.response());
    });

    this.session.on('deliver_sm', async (pdu) => {
      this.session.send(pdu.response());
      await this.handleDeliverSm(pdu);
    });
  }

  bind() {
    const systemId = process.env.SMPP_SYSTEM_ID || '';
    const password = process.env.SMPP_PASSWORD || '';
    const systemType = process.env.SMPP_SYSTEM_TYPE || '';

    this.session.bind_transceiver(
      {
        system_id: systemId,
        password,
        system_type: systemType
      },
      (pdu) => {
        if (pdu.command_status === 0) {
          this.isBound = true;
          console.log('[SMPP] Bound as transceiver.');
          return;
        }
        console.error('[SMPP] Bind failed with status:', pdu.command_status);
      }
    );
  }

  async handleDeliverSm(pdu) {
    const sourceAddr = pdu.source_addr ? String(pdu.source_addr) : '';
    const destinationAddr = pdu.destination_addr ? String(pdu.destination_addr) : SHORT_CODE;
    const text = pdu.short_message ? pdu.short_message.toString() : '';
    const isDlr = (pdu.esm_class & 0x04) === 0x04 || /\bid:.*\bstat:/i.test(text);

    if (isDlr) {
      const receipt = parseDeliveryReceipt(text);
      await SmsTransaction.create({
        direction: 'DLR',
        messageId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        relatedMessageId: receipt.messageId,
        msisdn: sourceAddr || 'UNKNOWN',
        shortCode: destinationAddr || SHORT_CODE,
        text,
        status: receipt.status === 'DELIVRD' ? 'DELIVERED' : 'FAILED',
        errorCode: receipt.errorCode,
        metadata: {
          rawPdu: pdu
        },
        deliveredAt: new Date()
      });

      if (this.handlers.dlr) {
        await this.handlers.dlr({
          msisdn: sourceAddr,
          messageId: receipt.messageId,
          status: receipt.status,
          errorCode: receipt.errorCode,
          rawText: text
        });
      }
      return;
    }

    if (this.handlers.mo) {
      await this.handlers.mo({
        msisdn: sourceAddr,
        shortCode: destinationAddr || SHORT_CODE,
        text,
        rawPdu: pdu
      });
    }
  }

  async sendSms({ msisdn, text, shortCode = SHORT_CODE }) {
    if (!msisdn || !text) {
      throw new Error('MSISDN and SMS text are required.');
    }

    const tx = await SmsTransaction.create({
      direction: 'MT',
      msisdn,
      shortCode,
      text,
      status: 'UNKNOWN'
    });

    if (!this.session || !this.isBound) {
      tx.status = 'FAILED';
      tx.errorCode = 'SMPP_NOT_BOUND';
      await tx.save();
      return {
        success: false,
        messageId: null,
        error: 'SMPP session is not bound.'
      };
    }

    return new Promise((resolve) => {
      this.session.submit_sm(
        {
          source_addr: shortCode,
          destination_addr: msisdn,
          short_message: text,
          registered_delivery: 1
        },
        async (pdu) => {
          if (pdu.command_status === 0) {
            tx.status = 'SENT';
            tx.messageId = pdu.message_id ? String(pdu.message_id) : null;
            await tx.save();
            return resolve({
              success: true,
              messageId: tx.messageId
            });
          }
          tx.status = 'FAILED';
          tx.errorCode = String(pdu.command_status);
          await tx.save();
          return resolve({
            success: false,
            messageId: null,
            error: `submit_sm failed: ${pdu.command_status}`
          });
        }
      );
    });
  }
}

const smppGatewayService = new SmppGatewayService();

module.exports = {
  smppGatewayService
};
