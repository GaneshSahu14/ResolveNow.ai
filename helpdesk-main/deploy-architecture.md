# Helpdesk Deployment Architecture (Vercel + Railway + Neon + Cloudinary + Resend + AI + CloudMailin)

This document maps the architecture you described to what’s implemented in this repo and what you should deploy where.

## 1) Your architecture (logical)

- **Vercel Frontend**
- **Railway Backend** (Express API + webhook handlers + background workers)
- **Neon DB (Postgres)**
- **CloudMailin → Inbound Webhook**
- **Cloudinary** (store inbound email attachments)
- **Resend** (send outbound emails)
- **AI Provider (Groq/Gemini/OpenAI)** (classify/auto-resolve)

## 2) How your repo implements inbound email

Inbound email handling is implemented here:
- `server/src/routes/webhooks.ts`
- Route: **POST `/api/webhooks/inbound-email`**

Flow inside the route:
1. `requireWebhookSecret` validates a shared secret.
2. `normalizeInboundEmail` converts payloads from supported formats (SendGrid-style vs CloudMailin normalized).
3. Attachments (if any) are uploaded to **Cloudinary** via `server/src/lib/cloudinary.ts`.
4. Ticket/reply records are stored using **Prisma** against **Postgres (Neon)**.
5. Background jobs are enqueued using **pg-boss** (Postgres-backed queue).

## 3) Deploy plan

### A) Vercel (frontend only)
Deploy the **client** app.

- Build output: `client/dist`
- Build command (options):
  - `pnpm --filter client build`
  - or Bun equivalent, depending on how you build locally

Vercel environment variables (typical):
- `VITE_API_BASE_URL=https://<railway-backend-domain>`

Notes:
- Do **not** deploy backend to Vercel.
- Do **not** expose `WEBHOOK_SECRET` on Vercel.

### B) Railway (backend only, recommended: use root Dockerfile)
Deploy the **full repo with Docker**, using the existing root `Dockerfile`.

Why this matches your repo:
- Root Dockerfile builds:
  - `client/dist` (and then copies it into the server image for production)
  - Prisma generated client
  - Runs migrations on startup (`prisma migrate deploy`)
- Server serves:
  - API routes under `/api/*`
  - static client files in production (`app.use(express.static(clientDist))`)

However, if you still want “Vercel serves frontend”, keep in mind your Railway container also contains the built client. That’s fine; the canonical UI can still come from Vercel.

Railway service type:
- A single Docker web service for the backend/API.

Also provision a Postgres service:
- Option 1: Use Neon directly (recommended) and set `DATABASE_URL` on Railway.
- Option 2: Use Railway Postgres.

### C) Neon (Postgres)
Set Railway `DATABASE_URL` to Neon.

Prisma migrations are executed automatically by your Docker command:
- `bunx prisma migrate deploy`

### D) Cloudinary (attachments)
Set one of the supported env var configurations on Railway:
- `CLOUDINARY_URL`
  **or**
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### E) Resend (outbound emails)
Set on Railway:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### F) AI Provider
Your current code appears Groq-based (see repo config), but conceptually you set the provider keys.

Set on Railway:
- `GROQ_API_KEY` and `GROQ_MODEL`

If you later switch to Gemini/OpenAI, update the provider env vars in the backend.

## 4) Required webhook configuration (CloudMailin)

Your backend webhook expects:
- Endpoint: **`POST https://<railway-backend-domain>/api/webhooks/inbound-email`**
- Header: `x-webhook-secret: <WEBHOOK_SECRET>`
  - (middleware also supports `?secret=...` query param)

CloudMailin should be configured to:
- Send inbound emails to the endpoint above
- Use the shared secret

## 5) Environment variable checklist (Railway backend)

Minimum recommended:
- `NODE_ENV=production`
- `PORT=3000` (optional; default exists)
- `DATABASE_URL` (Neon)
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL=https://<railway-backend-domain>`
- `TRUSTED_ORIGINS=https://<vercel-domain>,https://<railway-backend-domain>`
- `WEBHOOK_SECRET` (required for inbound webhook to work)

Integrations:
- `CLOUDINARY_URL` (or Cloudinary credentials)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `GROQ_API_KEY` (or your AI provider keys)
- `GROQ_MODEL` (or provider model)

Optional:
- `SENTRY_DSN`
- `SENTRY_ENVIRONMENT=production`

## 6) Summary mapping to your diagram

- **Vercel Frontend** → `client/` (Vite React)
- **Railway Backend** → `server/` (Express + Prisma + pg-boss workers)
- **Neon DB** → Prisma Postgres
- **CloudMailin → Inbound Webhook** → `POST /api/webhooks/inbound-email`
- **Cloudinary** → attachment uploads in `server/src/routes/webhooks.ts`
- **Resend** → outbound email sending worker
- **AI Provider** → ticket classification + auto-resolve jobs

## 7) Next step (what to do after deploying)

1. Deploy Neon + set `DATABASE_URL` in Railway.
2. Deploy Railway backend with the required env vars.
3. Deploy Vercel frontend with `VITE_API_BASE_URL` pointing to Railway.
4. Configure CloudMailin to send to `/api/webhooks/inbound-email` with `x-webhook-secret`.
5. Send a test email → verify:
   - webhook returns 2xx
   - ticket created
   - attachments appear
   - background jobs run

