# Employee Portal Frontend

This is the frontend application for the Employee Portal built with React and Vite.

## Deployment Instructions

### Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```
VITE_API_URL=https://your-backend-url.com
```

For same-origin deployments such as an AWS-hosted site serving the API under `/api`, leave `VITE_API_URL` empty or omit it.

For local development, you can also leave `VITE_API_URL` empty. The Vite dev server proxies `/api`, `/telegram`, and `/uploads` to `http://localhost:5000` by default. Override that backend target with `VITE_DEV_PROXY_TARGET` only if your local API is running elsewhere.

### Local Development

1. Install dependencies: `npm install`
2. Start the backend on `http://localhost:5000`
3. Start the frontend development server: `npm run dev`

## Backend Deployment

The backend can be deployed on any Node.js-capable host. If your frontend and backend share the same public domain, the frontend will use `/api` automatically when `VITE_API_URL` is empty.
