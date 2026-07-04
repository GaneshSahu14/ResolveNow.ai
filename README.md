# 🚀 ResolveNow AI

**Enterprise AI-Powered Helpdesk & Ticket Management System**

ResolveNow AI is a modern, full-stack helpdesk platform that leverages artificial intelligence to automate customer support workflows. It enables organizations to receive support requests through both a web portal and inbound emails, automatically create tickets, classify and prioritize issues using AI, assist support agents with intelligent suggestions, and provide comprehensive analytics for efficient ticket management.

---

## 🌐 Live Demo

**Application:** [resolvenowai-production.up.railway.app](https://resolvenowai-production.up.railway.app/)

### 👤 Demo Accounts

| Role  | Email               | Password    |
|-------|---------------------|-------------|
| Admin | admin@example.com   | password123 |
| Agent | agent@example.com   | password123 |

---

## ✨ Features

### 🎫 Ticket Management
- Create support tickets
- View all tickets
- Update ticket status
- Assign tickets to agents
- Priority management
- Category management
- Bulk actions
- Ticket filtering
- Advanced search
- Ticket history

### 🤖 AI Features
- AI Ticket Classification
- AI Ticket Prioritization
- AI Response Suggestions
- AI Ticket Summarization
- AI Draft Polishing
- Smart Reply Assistance
- AI Insights Dashboard

### 📧 Email Integration
**Inbound Email**
- CloudMailin Integration
- Automatically converts emails into tickets
- Email threading
- Reply tracking
- Webhook support

**Outbound Email**
- Email notifications
- Agent replies
- Customer communication

### 📚 Knowledge Base
- Article management
- Categories
- Full-text search
- Rich content
- AI-powered recommendations

### 👥 User Management
- Admin Dashboard
- Agent Dashboard
- Role-based permissions
- User CRUD
- Secure Authentication

### 📊 Analytics
- Ticket statistics
- Response time metrics
- Resolution metrics
- Agent performance
- Ticket distribution
- Dashboard widgets

### 🔒 Security
- Authentication
- Authorization
- Protected routes
- Session management
- Password hashing
- API validation
- Secure webhooks

### 🎨 Modern UI
- Responsive Design
- Mobile Friendly
- Dark / Light Theme
- Material Icons
- Premium Dashboard
- Beautiful Animations

---

## 🛠 Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Shadcn/UI

**Backend**
- Node.js
- Bun
- Hono
- Prisma ORM

**Database**
- PostgreSQL
- Neon Database

**AI**
- Claude API
- AI Copilot
- Intelligent Ticket Automation

**Email**
- CloudMailin
- Webhooks
- SMTP / REST Email Support

**Deployment**
- Railway
- Vercel

**Testing**
- Playwright
- E2E Testing
- Cross-browser Testing

---

## 🏗 System Architecture

```
                     Customer
                         │
                         ▼
        ┌───────────────────────────────────┐
        │            ResolveNow AI           │
        └───────────────────────────────────┘
                    │
     ┌──────────────┼───────────────┐
     ▼                              ▼
 Web Portal                   CloudMailin
     │                              │
     └──────────────┬───────────────┘
                    ▼
             Railway Backend
                    │
      ┌─────────────┼──────────────┐
      ▼             ▼              ▼
  AI Engine     PostgreSQL     Email Service
      │             │
      ▼             ▼
 Analytics      Knowledge Base
```

---

## 📁 Project Structure

```
ResolveNow.ai/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── hooks/
│
├── server/
│   ├── src/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── prisma/
│
├── core/
│
├── e2e/
│
└── docs/
```

---

## 🚀 Local Setup

### Clone
```bash
git clone https://github.com/GaneshSahu14/ResolveNow.ai.git
cd ResolveNow.ai
```

### Install
```bash
bun install
```

### Environment Variables
Create a `.env` file with the following:
```env
DATABASE_URL=

BETTER_AUTH_URL=

TRUSTED_ORIGINS=

WEBHOOK_SECRET=

CLAUDE_API_KEY=

CLOUDMAILIN_ADDRESS=
```

### Database
```bash
bunx prisma migrate deploy
bun run seed
```

### Start

**Backend**
```bash
bun run dev
```

**Frontend**
```bash
bun run client
```

---

## 🧪 Testing

> **Note:** the commands below use `pnpm`. If your project's test runner is actually managed with `bun`, replace `pnpm` with `bunx` accordingly — please double-check this against your `package.json` scripts before publishing.

Run all Playwright tests:
```bash
pnpm playwright test
```

Run UI Mode:
```bash
pnpm playwright test --ui
```

Generate Report:
```bash
pnpm playwright show-report
```

---

## 📸 Screenshots

> Add screenshots of the following pages here:
- Login Page
- Dashboard
- Tickets
- Ticket Details
- AI Copilot
- Knowledge Base
- Analytics
- Users
- Settings
- Mobile View

---

## 📈 Roadmap

- [ ] Multi-tenant Workspaces
- [ ] SLA Management
- [ ] Live Chat Integration
- [ ] Voice Support
- [ ] AI Knowledge Generation
- [ ] RAG-powered Search
- [ ] Multi-language Support
- [ ] OAuth Providers
- [ ] Microsoft Teams Integration
- [ ] Slack Integration
- [ ] Docker Compose Deployment

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Ganesh Sahu**

- GitHub: [@GaneshSahu14](https://github.com/GaneshSahu14)
- Project: [ResolveNow.ai](https://github.com/GaneshSahu14/ResolveNow.ai)
- Live Demo: [resolvenowai-production.up.railway.app](https://resolvenowai-production.up.railway.app/)
