# Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS (v4)
- shadcn/ui
- React Router v7
- TanStack Query v5
- React Hook Form
- Zod
- Recharts
- Axios

## Backend

- Node.js with Express and TypeScript
- Better Auth (authentication — sessions + RBAC)
- Prisma ORM
- Zod
- Helmet
- CORS
- express-rate-limit
- Pino (logging)
- pg-boss (PostgreSQL-backed background job queue — no Redis required)
- Multer (file upload handling)

## Database

- PostgreSQL (primary datastore)
  - Prisma ORM for migrations and queries
  - pg-boss uses the same PostgreSQL database for job queues

## Authentication

- Better Auth
  - Cookie-based sessions
  - Role-Based Access Control (Admin, Agent)

## AI

- Vercel AI SDK (`ai` package)
- Groq API (Llama 3.3 / Kimi K2 / Qwen models)

## Email

- Inbound:
  - CloudMailin (free tier) for inbound email webhooks
- Outgoing:
  - Resend
- Development:
  - Ethereal Email

## File Storage

- Cloudinary (attachment uploads from inbound email webhooks)

## Deployment

- Frontend: Vercel
- Backend: Render (Docker)
- Database: Neon PostgreSQL
- File Storage: Cloudinary
- ~~Redis: Upstash Redis~~ _(removed — pg-boss replaces Redis-based queues)_

## Development Tools

- Docker + Docker Compose (local PostgreSQL)
- GitHub
- GitHub Actions
- ESLint
- Prettier
- Postman / Bruno
