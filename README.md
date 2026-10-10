# Ping Log

Ping Log is a full-stack TypeScript app that helps you monitor Render services and keep them from sleeping by sending periodic health checks.

The project is split into two main parts:

- `client/` — Next.js app for authentication, dashboard, service management, and ping orchestration
- `worker/` — Cloudflare Worker that triggers the ping cycle on a schedule

## What it does

- Lets users sign up and log in
- Add Render service URLs to monitor
- Periodically checks each active service
- Tracks status, failures, and response times
- Sends email alerts only when a service first fails
- Keeps the monitoring job alive with a Cloudflare Worker cron trigger

## Architecture

- Frontend: Next.js 16 + React 19 + Tailwind CSS
- Backend/API: Next.js server routes
- Database: MongoDB via Mongoose
- Authentication: JWT + bcrypt
- Email alerts: Resend
- Scheduled monitoring: Cloudflare Worker + Wrangler

## Repository structure

```text
ping-log/
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── ...
├── worker/
│   ├── src/
│   ├── package.json
│   ├── wrangler.toml
│   └── tsconfig.json
├── README.md
└── .gitignore
```

## Tech stack

### Client

- Next.js
- React
- TypeScript
- Tailwind CSS
- MongoDB + Mongoose
- JWT authentication
- Resend email integration

### Worker

- Cloudflare Worker
- TypeScript
- Wrangler

## Prerequisites

Before running the app, make sure you have:

- Node.js 18+
- npm
- MongoDB instance
- Cloudflare account with Wrangler configured (for the worker)
- Resend API key for email notifications

## Environment variables

### Client (`client/.env.local`)

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CRON_SECRET=shared_secret_between_client_and_worker
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Worker (`worker/.env` or `wrangler.toml` secrets)

```env
PING_ENDPOINT_URL=https://your-app-url/api/ping
CRON_SECRET=shared_secret_between_client_and_worker
VERCEL_AUTOMATION_BYPASS_SECRET=your_bypass_secret
```

## Local development

### 1) Install dependencies

```bash
cd client && npm install
cd ../worker && npm install
```

### 2) Run the frontend

```bash
cd client
npm run dev
```

The app should be available at:

```text
http://localhost:3000
```

### 3) Run the worker locally

```bash
cd worker
npm run dev
```

## Production deployment

### Deploy the frontend

This project is built for a Next.js deployment environment such as Vercel.

```bash
cd client
npm run build
```

### Deploy the worker

```bash
cd worker
npm run deploy
```

Make sure the worker cron schedule is configured in `worker/wrangler.toml` and the `PING_ENDPOINT_URL` environment variables are set correctly.

## How the ping flow works

1. The Cloudflare Worker runs on a schedule.
2. It triggers the `/api/ping` endpoint in the Next.js app.
3. The API loads active services from MongoDB.
4. Each service URL is checked with a timeout.
5. Results are stored in the database.
6. The app sends a one-time email alert when a service transitions from healthy to unhealthy.

## Notes

- The service ping interval is configured around a 14-minute cadence.
- The worker acts as a lightweight heartbeat and does not manage service-specific logic itself.
- The backend handles the actual service pings and email notification rules.

## License

This project does not currently include a license file. If you plan to open-source it, consider adding one before publishing.

## Author

Built by Umang Khemka.
