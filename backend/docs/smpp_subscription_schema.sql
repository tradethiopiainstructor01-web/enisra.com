-- SQL reference schema for SMS subscription system (short code 9295)
-- This is a relational reference model. Runtime in this project uses MongoDB models.

CREATE TABLE subscribers (
  id BIGSERIAL PRIMARY KEY,
  msisdn VARCHAR(20) NOT NULL UNIQUE,
  pin_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  last_subscribed_at TIMESTAMP NULL,
  last_unsubscribed_at TIMESTAMP NULL,
  failed_login_count INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_subscriber_status CHECK (status IN ('ACTIVE', 'UNSUBSCRIBED', 'SUSPENDED'))
);

CREATE TABLE subscription_events (
  id BIGSERIAL PRIMARY KEY,
  subscriber_id BIGINT NULL REFERENCES subscribers(id),
  msisdn VARCHAR(20) NOT NULL,
  event_type VARCHAR(40) NOT NULL,
  source VARCHAR(20) NOT NULL DEFAULT 'SYSTEM',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_event_type CHECK (
    event_type IN (
      'SUBSCRIBE',
      'RESUBSCRIBE',
      'UNSUBSCRIBE',
      'INVALID_KEYWORD',
      'LOGIN_SUCCESS',
      'LOGIN_FAIL',
      'PIN_ROTATE'
    )
  )
);

CREATE TABLE sms_transactions (
  id BIGSERIAL PRIMARY KEY,
  direction VARCHAR(10) NOT NULL,
  message_id VARCHAR(100) NULL,
  related_message_id VARCHAR(100) NULL,
  msisdn VARCHAR(20) NOT NULL,
  short_code VARCHAR(10) NOT NULL DEFAULT '9295',
  keyword VARCHAR(30) NULL,
  text TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
  error_code VARCHAR(30) NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_sms_direction CHECK (direction IN ('MO', 'MT', 'DLR')),
  CONSTRAINT chk_sms_status CHECK (status IN ('RECEIVED', 'SENT', 'DELIVERED', 'FAILED', 'UNKNOWN'))
);

CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_locked_until ON subscribers(locked_until);
CREATE INDEX idx_events_msisdn_created ON subscription_events(msisdn, created_at DESC);
CREATE INDEX idx_sms_msisdn_created ON sms_transactions(msisdn, created_at DESC);
CREATE INDEX idx_sms_message_id ON sms_transactions(message_id);
CREATE INDEX idx_sms_related_message_id ON sms_transactions(related_message_id);
