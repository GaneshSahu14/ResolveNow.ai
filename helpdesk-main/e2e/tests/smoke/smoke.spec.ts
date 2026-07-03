import { test, expect, TEST_USERS, createTicketViaWebhook, createTestPayload, expectLoginPage, expectHomePage } from "../../fixtures/auth";
import { LoginPage } from "../../pages/LoginPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { TicketsPage } from "../../pages/TicketsPage";
import { TicketDetailPage } from "../../pages/TicketDetailPage";
import { UsersPage } from "../../pages/UsersPage";

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3001";

test.describe("Production Smoke (critical paths)", () => {
  test("Login, Logout, Dashboard loads", async ({ page }) => {
    const login = new LoginPage(page);

    await page.goto("/login");
    await login.expectFormElements();

    await login.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await expectHomePage(page);

    // Logout
    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login|\/$/);

    // Navigate to login page again for the next login step
    await page.goto("/login");

    // Login again quickly
    await login.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await expectHomePage(page);

    // Dashboard loads
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.verifyKPIs();
  });

  test("Tickets: list loads, create ticket, open ticket, reply, AI summary + suggested reply", async ({ adminPage, request }) => {
    const ticketsPage = new TicketsPage(adminPage);
    await ticketsPage.goto();

    // Ticket list loads
    await expect(adminPage.getByRole("heading", { name: /tickets/i })).toBeVisible();

    // Create ticket via UI (verify it exists)
    const uniqueId = `smoke-${Date.now()}`;
    const subject = `Smoke Ticket Subject ${uniqueId}`;
    const body = `Smoke ticket body ${uniqueId}`;

    await ticketsPage.openCreateTicketModal();
    await ticketsPage.createTicket(subject, body, "reporter@example.com", "Reporter User");

    await expect(adminPage.getByRole("heading", { name: /create support ticket/i })).not.toBeVisible();
    await expect(adminPage.getByText(subject).first()).toBeVisible({ timeout: 15000 });

    // Open ticket
    await ticketsPage.selectTicket(subject);

    // Ticket detail loads (heading is the ticket subject)
    const ticketDetail = new TicketDetailPage(adminPage);
    await expect(adminPage.getByRole("heading", { name: subject })).toBeVisible();

    // Reply to ticket
    const replyBody = `Customer reply ${uniqueId}`;
    await ticketDetail.sendReply(replyBody);
    await ticketDetail.expectReplyVisible(replyBody);

    // AI endpoints mocked (deterministic smoke)
    await adminPage.route("**/api/tickets/*/replies/summarize", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ summary: `Smoke summary ${uniqueId}` }),
      });
    });

    await adminPage.route("**/api/tickets/*/replies/suggest", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ suggestion: `Smoke suggested reply ${uniqueId}` }),
      });
    });

    // Ensure ticket is in a state where AI buttons show (best-effort via API)
    // If the UI already has it, this is a no-op.
    const url = adminPage.url();
    const idMatch = url.match(/\/tickets\/(\d+)/);
    const ticketId = idMatch ? Number(idMatch[1]) : undefined;
    if (ticketId) {
      await adminPage.request.patch(`${BETTER_AUTH_URL}/api/tickets/${ticketId}`, {
        data: { status: "open", category: "general_question" },
      });
    }

    // AI Summary
    await ticketDetail.generateSummary();
    await expect(adminPage.getByText(`Smoke summary ${uniqueId}`)).toBeVisible({ timeout: 15000 });

    // AI Suggested Reply
    await ticketDetail.suggestReply();
    await expect(adminPage.getByPlaceholder(/type your reply/i)).toHaveValue(
      `Smoke suggested reply ${uniqueId}`
    );
  });

  test("Admin: User Management reachable and supports CRUD", async ({ adminPage }) => {
    const users = new UsersPage(adminPage);
    await users.goto();

    // Ensure table loads
    await expect(adminPage.getByRole("table")).toBeVisible();

    // CRUD smoke
    const timestamp = Date.now();
    const name = `Smoke Agent ${timestamp}`;
    const email = `smoke-agent-${timestamp}@example.com`;

    await users.createUser(name, email, "password123");
    await users.expectUserInTable(email, name);

    const updatedName = `Smoke Agent Updated ${timestamp}`;
    const updatedEmail = `smoke-agent-updated-${timestamp}@example.com`;
    await users.editUser(name, updatedName, updatedEmail);
    await users.expectUserInTable(updatedEmail, updatedName);

    await users.deleteUser(updatedName);
    await users.expectUserNotInTable(updatedEmail);
  });

  test("Route Protection: unauthenticated + agent boundaries", async ({ page, agentPage }) => {
    // Unauthenticated protected pages => redirect to login
    await page.goto("/dashboard");
    await expectLoginPage(page);

    await page.goto("/tickets");
    await expect(page).toHaveURL(/\/login|\/$/);

    await page.goto("/users");
    await expect(page).toHaveURL(/\/login|\/$/);

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login|\/$/);

    // Agent cannot access admin-only pages
    await agentPage.goto("/users");
    await expect(agentPage).toHaveURL("/dashboard");
  });
});

