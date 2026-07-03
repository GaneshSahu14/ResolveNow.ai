import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Role } from "../src/generated/prisma/client";
import { hashPassword } from "better-auth/crypto";
import { AI_AGENT_ID } from "core/constants/ai-agent.ts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env"
    );
  }

  const now = new Date();

  // Seed admin user
  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log(`Admin user ${email} already exists — skipping.`);
  } else {
    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();

    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId,
          name: "Admin",
          email,
          emailVerified: false,
          role: Role.admin,
          createdAt: now,
          updatedAt: now,
        },
      }),
      prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          accountId: userId,
          providerId: "credential",
          userId,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        },
      }),
    ]);
    console.log(`Admin user ${email} created successfully.`);
  }

  // Seed agent user
  const agentEmail = "agent@example.com";
  const agentPassword = "password123";
  const existingAgent = await prisma.user.findUnique({ where: { email: agentEmail } });
  if (existingAgent) {
    console.log(`Agent user ${agentEmail} already exists — skipping.`);
  } else {
    const hashedPassword = await hashPassword(agentPassword);
    const userId = crypto.randomUUID();

    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId,
          name: "Agent",
          email: agentEmail,
          emailVerified: false,
          role: Role.agent,
          createdAt: now,
          updatedAt: now,
        },
      }),
      prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          accountId: userId,
          providerId: "credential",
          userId,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        },
      }),
    ]);
    console.log(`Agent user ${agentEmail} created successfully.`);
  }

  // Seed AI agent user
  const existingAI = await prisma.user.findUnique({
    where: { id: AI_AGENT_ID },
  });
  if (existingAI) {
    console.log("AI agent user already exists — skipping.");
  } else {
    await prisma.user.create({
      data: {
        id: AI_AGENT_ID,
        name: "AI",
        email: "ai@helpdesk.local",
        emailVerified: false,
        role: Role.agent,
        createdAt: now,
        updatedAt: now,
      },
    });
    console.log("AI agent user created successfully.");
  }

  // --- Seed Mock Tickets for UI Development ---
  console.log("Seeding mock tickets...");

  const existingTicketsCount = await prisma.ticket.count();
  if (existingTicketsCount > 0) {
    console.log(`Found ${existingTicketsCount} existing tickets. Skipping mock ticket creation.`);
  } else {
    // Determine the admin ID to assign tickets to
    const adminUser = await prisma.user.findUnique({ where: { email } });
    const adminId = adminUser?.id;

    // Ticket 1: New
    await prisma.ticket.create({
      data: {
        subject: "Cannot login to my account",
        body: "Hi team, I tried resetting my password but I'm not getting the recovery email. Can you help?",
        senderName: "Alice Smith",
        senderEmail: "alice.smith@example.com",
        status: "open",
        category: "technical_question",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
    });

    // Ticket 2: Open (Assigned to Admin with a reply)
    const ticket2 = await prisma.ticket.create({
      data: {
        subject: "Billing charge incorrect",
        body: "I was charged twice for my subscription this month. Please refund the duplicate charge.",
        senderName: "Bob Johnson",
        senderEmail: "bob.j@example.com",
        status: "open",
        category: "refund_request",
        assignedToId: adminId,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      },
    });

    await prisma.reply.create({
      data: {
        ticketId: ticket2.id,
        senderType: "agent",
        userId: adminId,
        body: "Hi Bob, I apologize for the inconvenience. I'm looking into our payment gateway logs right now and will issue the refund shortly.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23),
      },
    });

    // Ticket 3: Resolved (AI handled)
    const ticket3 = await prisma.ticket.create({
      data: {
        subject: "How do I update my profile picture?",
        body: "I can't find the setting to change my avatar. Where is it?",
        senderName: "Charlie Davis",
        senderEmail: "charlie.d@example.com",
        status: "resolved",
        category: "general_question",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      },
    });

    await prisma.reply.create({
      data: {
        ticketId: ticket3.id,
        senderType: "agent",
        userId: AI_AGENT_ID,
        body: "Hello Charlie! You can update your profile picture by navigating to 'Settings' > 'Account' and clicking on your current avatar. Let us know if you need any more help!",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 5), // 5 mins later
      },
    });

    console.log("Mock tickets created successfully.");
  }

  // --- Seed Knowledge Base Articles ---
  console.log("Clearing existing knowledge base articles...");
  await prisma.knowledgeBaseArticle.deleteMany();

  console.log("Seeding knowledge base articles...");
  
  const categoryConfigs = [
    {
      id: "getting-started",
      name: "Getting Started",
      titles: [
        "Introduction to ResolveNow Workspace",
        "Configuring Your Support Agent Profile",
        "Understanding the ResolveNow Interface",
        "Setting Up Your First Customer Support Queue",
        "Quickstart Guide for Support Managers",
        "Keyboard Shortcuts for Faster Navigation",
        "Customizing Workspace Notification Alerts",
        "Best Practices for New Agents",
        "How to Invite Your Support Team",
        "Understanding the Real-Time Intake Feed"
      ]
    },
    {
      id: "authentication",
      name: "Authentication",
      titles: [
        "Setting up Single Sign-On (SSO)",
        "Enabling Multi-Factor Authentication (MFA)",
        "Configuring Custom Password Policies",
        "Managing Active User Sessions",
        "Troubleshooting Auth Code Verification Issues",
        "SAML 2.0 Integration Walkthrough",
        "Configuring Google Workspace OAuth",
        "Resetting Forgotten Password Safely",
        "Session Timeout and Security Settings",
        "Understanding User Access Tokens"
      ]
    },
    {
      id: "user-management",
      name: "User Management",
      titles: [
        "Creating and Managing User Roles",
        "Custom Permissions for Support Agents",
        "Inviting Team Members to Workspace",
        "Suspending and Offboarding Agents",
        "Organizing Teams by Specialization",
        "Tracking Agent Status and Activity Logs",
        "How to Transfer Workspace Ownership",
        "Configuring Shift Hours and Availability",
        "Auditing Admin Action logs",
        "Managing API Access for Internal Tools"
      ]
    },
    {
      id: "ticket-management",
      name: "Ticket Management",
      titles: [
        "Understanding Ticket Statuses (New, Processing, Open)",
        "Managing Priority Levels (Low, Medium, High, Critical)",
        "Assigning Tickets to Individual Agents",
        "Configuring SLA Target Policies",
        "Creating Custom Ticket Views",
        "Bulk Updating Ticket Attributes",
        "Merging Duplicate Tickets Safely",
        "Linking Related Tickets Together",
        "Tracking Ticket First Response Time",
        "Configuring Auto-Assignment Rules",
        "Reopening Resolved or Closed Tickets",
        "Custom Ticket Fields Configuration",
        "Exporting Ticket History for Audits",
        "How to Handle Critical SLA Breaches",
        "Snoozing Tickets and Setting Follow-ups",
        "Managing Attachments in Tickets",
        "Adding Internal Notes for Collaborators",
        "Configuring Escalate to Tier 2 Rules",
        "Resolving Tickets with Feedback Loops",
        "Tracking SLA Warning Thresholds"
      ]
    },
    {
      id: "ai-copilot",
      name: "AI Copilot",
      titles: [
        "Introduction to AI Smart Replies",
        "Configuring AI Auto-Resolution Engine",
        "Understanding AI Confidence Scores",
        "Drafting Answers using AI Copilot",
        "Adjusting AI Tone and Polishing Style",
        "Training AI with Custom Knowledge Base",
        "How AI Classifies Incoming Tickets",
        "Monitoring AI Auto-Resolution Quality",
        "Setting Up AI Response Rules",
        "Managing AI Suggested Replies List",
        "Customizing AI System Prompts",
        "Disabling AI for Specific Ticket Types",
        "Evaluating AI Impact on SLA Metrics",
        "Fine-tuning AI with Feedback Loops",
        "AI Copilot Security and Privacy Standards"
      ]
    },
    {
      id: "integrations",
      name: "Integrations",
      titles: [
        "Setting Up Slack Notifications",
        "Integrating Jira for Issue Tracking",
        "Connecting Salesforce CRM Data",
        "Integrating GitHub for Code References",
        "Connecting Discord Community Feed",
        "Microsoft Teams Integration Guide",
        "Zendesk to ResolveNow Migration Guide",
        "Intercom Live Chat Integration",
        "HubSpot CRM Synchronization",
        "Integrating Zoom for Video Support",
        "Configuring Custom OAuth Applications",
        "Trello Boards Integration Guide",
        "Asana Task Sync Configuration",
        "Managing Active Workspace Integrations",
        "Integrations Troubleshooting & Logs"
      ]
    },
    {
      id: "email-webhooks",
      name: "Email & Webhooks",
      titles: [
        "Configuring Outbound SMTP Servers",
        "Setting Up CloudMailin Inbound Mail",
        "Creating Custom Webhook Endpoints",
        "Webhook Signature Verification Guides",
        "Understanding Webhook Retry Policies",
        "Debugging Webhook Payload Delivery Failures",
        "Configuring Email Template Layouts",
        "Setting Up Custom Support Email Domain",
        "Handling Spam and Inbound Filters",
        "Managing Email Verification Keys",
        "Setting Up Auto-Reply Email Notifications",
        "Webhook Rate Limits and Policies",
        "Testing Webhooks in Local Environment",
        "Analyzing Email Header Logs",
        "Securing Webhook Data Transfers"
      ]
    },
    {
      id: "security-compliance",
      name: "Security & Compliance",
      titles: [
        "SOC 2 Type II Compliance Standards",
        "GDPR and Data Privacy Settings",
        "Configuring Access Whitelists (CORS)",
        "Data Retention and Deletion Policies",
        "IP Whitelisting for Support Agents",
        "Auditing Workspace Security Settings",
        "Managing Encryption Keys (AES-256)",
        "Role-Based Access Control Compliance",
        "HIPAA Compliance Guidelines",
        "Reporting Security Vulnerabilities (Bug Bounty)",
        "Handling Personally Identifiable Information (PII)",
        "Multi-Tenant Isolation Overview",
        "Configuring Audit Trail Logs Export",
        "Managing Data Processing Agreements (DPA)",
        "Business Continuity & Disaster Recovery"
      ]
    },
    {
      id: "analytics-reports",
      name: "Analytics & Reports",
      titles: [
        "Reading the Customer Satisfaction (CSAT) Report",
        "Analyzing Support First-Response Times",
        "Exporting Ticket History to CSV/Excel",
        "Understanding SLA Compliance Metrics",
        "Reading the Agent Performance Leaderboard",
        "Tracking Ticket Volume Intake Analytics",
        "Configuring Weekly Summary Emails",
        "Analyzing AI Copilot Resolution Rates",
        "Understanding Ticket Category Breakdowns",
        "SLA Breach Root-Cause Analysis"
      ]
    },
    {
      id: "troubleshooting",
      name: "Troubleshooting",
      titles: [
        "Troubleshooting CORS Whitelist Block Errors",
        "Resolving Webhook Signature Failures",
        "Debugging Inbound Email Missing Webhooks",
        "How to Resolve SLA Expired warnings",
        "Fixing Missing Email Verification Links",
        "Resolving Database Connection Pool Timeouts",
        "Debugging AI Copilot Low-Confidence Answers",
        "Fixing Slow Page Loading on Dashboard",
        "Troubleshooting Auth Session Expired loops",
        "Resolving Express API Route Error 500s",
        "Debugging Attachment Upload Failures",
        "Fixing Invite Team Member Mail Blocked",
        "Troubleshooting SSO Login Loop Problems",
        "Resolving Missing Priority Badges on Tickets",
        "Fixing SMTP Outbound Connection Timeout",
        "Troubleshooting CORS Wildcard Warnings",
        "Resolving Cloudinary Upload API Errors",
        "Debugging Groq API Rate Limit Breaches",
        "Fixing Command Palette Search Inaccuracies",
        "Troubleshooting Better-Auth Internal Failures"
      ]
    },
    {
      id: "apis-sdks",
      name: "APIs & SDKs",
      titles: [
        "Getting Started with Node.js SDK",
        "Python SDK Installation and Usage",
        "How to Use Go SDK for Support Integration",
        "Accessing the REST API documentation",
        "API Rate Limits and Usage Rules",
        "Authenticating Requests with API Keys",
        "React Native SDK Quickstart Guide",
        "Querying Tickets via GraphQL API",
        "Updating Ticket Categories via API",
        "Uploading Attachments using REST API",
        "Retrieving Agent Performance via API",
        "Listening to Live Ticket Feeds (WebSockets)",
        "Managing Custom Fields programmatically",
        "API Deprecation Schedule & Policies",
        "Testing APIs with Postman Collections"
      ]
    },
    {
      id: "billing-plans",
      name: "Billing & Plans",
      titles: [
        "Updating Workspace Credit Card details",
        "Refund Request Policy & Steps",
        "Comparing Starter, Pro, and Enterprise Plans",
        "Downloading Invoice History & Receipts",
        "Understanding Seat-Based Billing Updates",
        "How to Upgrade Your Workspace Subscription",
        "Downgrading Plan and Active Feature Impact",
        "Handling Failed Subscription Payments",
        "Requesting Custom Enterprise Billing",
        "Applying Promotional Discount Codes"
      ]
    }
  ];

  function generateArticleContent(title: string, categoryName: string): string {
    return `### ${title}
This article provides detailed guidelines and step-by-step instructions regarding **${title}** within the ResolveNow AI Helpdesk system.

#### Guidelines & Steps:
1. Navigate to the **${categoryName}** section in your administrator or agent console.
2. Verify you have the correct roles and permissions assigned to execute actions in this workspace area.
3. Review the active configurations and follow standard operating procedures for **${title}**.
4. Confirm changes and monitor real-time logs to ensure correct propagation.

#### Common Scenarios:
- **Initial Setup**: Configuring parameters for the first time.
- **Verification**: Verifying successful delivery or setup.
- **Troubleshooting**: Checking log files if errors arise during processing.

> [!NOTE]
> All changes applied under ${categoryName} are synced immediately, but may take up to 2 minutes to show in client-facing widgets due to caching layer propagation.`;
  }

  const articlesData = [];
  for (const config of categoryConfigs) {
    for (const title of config.titles) {
      articlesData.push({
        title,
        category: config.id,
        content: generateArticleContent(title, config.name)
      });
    }
  }

  await prisma.knowledgeBaseArticle.createMany({
    data: articlesData
  });

  console.log("Seeding articles completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
