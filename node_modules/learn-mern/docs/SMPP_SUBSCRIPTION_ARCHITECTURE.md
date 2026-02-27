# SMPP Subscription Architecture (9295)

## Flow

1. User sends `START` or `STOP` to short code `9295`.
2. SMSC forwards MO message to SMPP gateway.
3. Backend SMPP transceiver receives `deliver_sm`.
4. `subscriptionService` processes keyword and updates subscriber state.
5. Backend sends MT confirmation via `submit_sm`.
6. Delivery receipt (DLR) is received via `deliver_sm` and matched to MT.
7. Website login validates `msisdn + pin + ACTIVE status`.

## Key Components

- `services/smppGatewayService.js`
  - SMPP bind/connect/reconnect
  - MO parsing
  - MT sending
  - DLR capture
- `services/subscriptionService.js`
  - START/STOP logic
  - Duplicate subscription handling
  - Bcrypt PIN hashing
  - Login lockout and validation
  - Compliance event logs
- `models/Subscriber.js`
- `models/SubscriptionEvent.js`
- `models/SmsTransaction.js`
- `routes/scholarshipAuthRoutes.js`

## API Surface

- `POST /api/scholarship-auth/login`
- `GET /api/scholarship-auth/dashboard`
- `POST /api/scholarship-auth/unsubscribe`
- `GET /api/scholarship-auth/status/:msisdn`
- `POST /api/scholarship-auth/simulate-mo` (non-SMPP test helper)

## Security Notes

- PIN stored only as bcrypt hash.
- Status gate enforced at login (`ACTIVE` only).
- Brute-force protection via failed attempt counter + temporary lock.
- Opt-out persists as `UNSUBSCRIBED`; record retained for compliance.
- All MO/MT/DLR activity is logged.
