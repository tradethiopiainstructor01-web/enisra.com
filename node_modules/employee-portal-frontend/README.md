# Employee Portal Frontend

This is the frontend application for the Employee Portal built with React and Vite.

## Deployment Instructions

### Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```
VITE_API_URL=https://your-backend-url.com
```

For same-origin deployments such as an AWS-hosted site serving the API under `/api`, leave `VITE_API_URL` empty or omit it.

### Local Development

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`

## Backend Deployment

The backend can be deployed on any Node.js-capable host. If your frontend and backend share the same public domain, the frontend will use `/api` automatically when `VITE_API_URL` is empty.
