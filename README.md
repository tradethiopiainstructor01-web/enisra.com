# tradethiopia
it team workspace

## Deployment

- Run `npm run build` (the script installs the frontend dependencies and runs `npm run build --prefix frontend`) before creating a release or preview deployment.
- Configure the usual backend environment variables for your hosting platform so the API can start:
  - `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`
  - For same-host AWS deployments, leave frontend `VITE_API_URL` empty so the app uses same-origin `/api`
  - For local Vite development, leave `VITE_API_URL` empty unless you intentionally want direct cross-port requests; the frontend dev server proxies `/api`, `/telegram`, and `/uploads` to `http://localhost:5000` by default
  - Telegram job posting: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`, and one public HTTPS URL source for job links: `JOB_PUBLIC_BASE_URL` or `TELEGRAM_JOB_URL_TEMPLATE` or `TELEGRAM_APPLY_URL`
  * When an approved job is edited to enable `postToTelegram`, the server will post it automatically (duplicates are prevented by an internal record).
  - Optional Telegram webhook settings if you use the webhook routes: `TELEGRAM_WEBHOOK_URL`, `TELEGRAM_WEBHOOK_SECRET`
  - Appwrite credentials: `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`, `APPWRITE_BUCKET_ID`
  - Any SMTP or custom secrets that appear in `backend/.env` (e.g., `SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT`).
- API health-checks live under `/api/health` and `/api/test`, and static assets live at the root URL once the frontend build completes.
