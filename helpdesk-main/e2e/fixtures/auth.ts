import { test as base, Page, expect, APIRequestContext } from "@playwright/test";
import { Role } from "core/constants/role";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { TicketsPage } from "../pages/TicketsPage";
import { TicketDetailPage } from "../pages/TicketDetailPage";
import { KnowledgeBasePage } from "../pages/KnowledgeBasePage";
import { InboxPage } from "../pages/InboxPage";
import { UsersPage } from "../pages/UsersPage";
import { SettingsPage } from "../pages/SettingsPage";
import { Navigation } from "../pages/Navigation";
import type { InboundEmailInput } from "core/schemas/tickets";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "test-webhook-secret";
const API_BASE_URL = process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3001";

/**
 * Test credentials matching seed data
 */
export const TEST_USERS = {
  admin: {
    email: "admin@example.com",
    password: "password123",
    name: "Admin",
    role: Role.admin,
  },
  agent: {
    email: "agent@example.com",
    password: "password123",
    name: "Agent",
    role: Role.agent,
  },
} as const;

export async function fillAndSubmitLoginForm(
  page: Page,
  credentials: { email: string; password: string }
) {
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

/**
 * Navigates to login page and logs in with the provided credentials
 */
export async function login(
  page: Page,
  credentials: { email: string; password: string }
) {
  await page.goto("/login");
  await fillAndSubmitLoginForm(page, credentials);
}

/**
 * Logs in as the seeded admin user
 */
export async function loginAsAdmin(page: Page) {
  await login(page, TEST_USERS.admin);
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({ timeout: 15000 });
}

/**
 * Logs in as the seeded agent user
 */
export async function loginAsAgent(page: Page) {
  await login(page, TEST_USERS.agent);
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({ timeout: 15000 });
}

/**
 * Logs out the current user
 */
export async function logout(page: Page) {
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.waitForURL(/\/login|\/$/);
}

export async function expectLoginPage(page: Page) {
  await expect(page).toHaveURL("/login");
  await expect(page.getByText("Welcome back")).toBeVisible();
}

export async function expectHomePage(page: Page) {
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
}

/**
 * Helper to create a ticket via the inbound email webhook
 */
export async function createTicketViaWebhook(
  request: APIRequestContext,
  payload: Partial<InboundEmailInput> & { from: string; fromName: string; subject: string; body: string }
) {
  const from = payload.fromName?.trim()
    ? `${payload.fromName} <${payload.from}>`
    : payload.from;
  const response = await request.post(
    `${API_BASE_URL}/api/webhooks/inbound-email`,
    {
      headers: {
        "x-webhook-secret": WEBHOOK_SECRET,
      },
      multipart: {
        from,
        subject: payload.subject,
        text: payload.body,
        ...(payload.bodyHtml ? { html: payload.bodyHtml } : {}),
      },
    }
  );

  expect(response.status()).toBe(201);
  const body = await response.json();
  return body.ticket;
}


/**
 * Helper to create a unique test payload
 */
export function createTestPayload(uniqueId: string, overrides?: Partial<InboundEmailInput>): InboundEmailInput {
  return {
    from: `sender-${uniqueId}@example.com`,
    fromName: `Test Sender ${uniqueId}`,
    subject: `Test Subject ${uniqueId}`,
    body: `This is a test email body for ${uniqueId}`,
    ...overrides,
  };
}

// Define Custom Fixture Types
export type HelpdeskFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  ticketsPage: TicketsPage;
  ticketDetailPage: TicketDetailPage;
  knowledgeBasePage: KnowledgeBasePage;
  inboxPage: InboxPage;
  usersPage: UsersPage;
  settingsPage: SettingsPage;
  navigation: Navigation;
  adminPage: Page;
  agentPage: Page;
};

// Extend base Playwright test with project-specific fixtures.
// Exporting this `test` keeps compatibility with existing specs importing from this module.
export const test = base.extend<HelpdeskFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  ticketsPage: async ({ page }, use) => {
    await use(new TicketsPage(page));
  },
  ticketDetailPage: async ({ page }, use) => {
    await use(new TicketDetailPage(page));
  },
  knowledgeBasePage: async ({ page }, use) => {
    await use(new KnowledgeBasePage(page));
  },
  inboxPage: async ({ page }, use) => {
    await use(new InboxPage(page));
  },
  usersPage: async ({ page }, use) => {
    await use(new UsersPage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  navigation: async ({ page }, use) => {
    await use(new Navigation(page));
  },

  adminPage: async ({ browser }, use) => {
    const storagePath = "./e2e/storage/auth-admin.json";
    const context = await browser.newContext({ storageState: storagePath });
    const page = await context.newPage();

    await page.goto("/dashboard");
    try {
      await Promise.race([
        page.waitForURL("**/login", { timeout: 5000 }),
        page
          .getByRole("heading", { name: /^dashboard$|^dashboard overview$/i })
          .waitFor({ state: "visible", timeout: 5000 }),
      ]);
    } catch {
      // ignore timeout
    }

    if (page.url().includes("/login")) {
      await loginAsAdmin(page);
      await page.context().storageState({ path: storagePath });
    }

    await use(page);
    await context.close();
  },

  agentPage: async ({ browser }, use) => {
    const storagePath = "./e2e/storage/auth-agent.json";
    const context = await browser.newContext({ storageState: storagePath });
    const page = await context.newPage();

    await page.goto("/dashboard");
    try {
      await Promise.race([
        page.waitForURL("**/login", { timeout: 5000 }),
        page
          .getByRole("heading", { name: /^dashboard$|^dashboard overview$/i })
          .waitFor({ state: "visible", timeout: 5000 }),
      ]);
    } catch {
      // ignore timeout
    }

    if (page.url().includes("/login")) {
      await loginAsAgent(page);
      await page.context().storageState({ path: storagePath });
    }

    await use(page);
    await context.close();
  },
});

export { expect };

