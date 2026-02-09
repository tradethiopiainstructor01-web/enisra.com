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

## Notes
- Requests are department-scoped for most roles; `admin`, `finance`, and `coo` can view across departments.
- Historical modules for Sales, Customer Success, and HR are no longer mounted as runtime APIs.
