# Backend API for Portal

## Overview
Node.js/Express API for the Portal application, backed by MongoDB (Mongoose).

This backend powers:
- Authentication/users
- Notifications, messages, and notes
- Resources, documents, assets
- B2B marketplace (buyers, sellers, matching, saved matches)
- Followups (Training, ENISRA, TradexTV)
- Packages (CRUD + analytics)
- Requests and action items
- Awards, jobs, employers, partners, registration analytics

## Major Route Groups (mounted under `/api`)
- `/users`
- `/notifications`
- `/messages`
- `/notes`
- `/resources`
- `/documents`
- `/assets`, `/assetcategories`
- `/categories`
- `/buyers`, `/sellers`, `/b2b`, `/saved-matches`
- `/training-followups`, `/ensra-followups`, `/tradex-followups`
- `/packages`
- `/requests`, `/action-items`
- `/awards`
- `/jobs`, `/employer-profile`, `/employer-details`
- `/partners`
- `/analytics/registrations`

## Remote Job Posting
- `POST /api/jobs/remote`
- Auth: send `x-api-key: <REMOTE_JOB_POST_API_KEY>` or `Authorization: Bearer <REMOTE_JOB_POST_API_KEY>`
- Required fields: `title`, `company` or `companyName`, `category`, `location`, `type`, `contactEmail`
- Optional env: `REMOTE_JOB_POST_AUTO_APPROVE=true` to publish immediately instead of leaving the job pending admin approval

## Notes
- Requests are department-scoped for most roles; `admin`, `finance`, and `coo` can view across departments.
- Historical modules for Sales, Customer Success, and HR are no longer mounted as runtime APIs.

## Production Startup
- The checked-in server entrypoints now default to `PORT=5000` and bind to `0.0.0.0` so nginx or a load balancer can reach the process.
- A systemd template is available at `backend/deploy/enisra-backend.service.example`.

## Deploy / Restart
```bash
sudo cp backend/deploy/enisra-backend.service.example /etc/systemd/system/your-app.service
sudo systemctl daemon-reload
sudo systemctl restart your-app.service
sudo systemctl status your-app.service
```
