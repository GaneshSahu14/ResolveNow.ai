import { test, expect, createTicketViaWebhook, createTestPayload } from "../../fixtures/auth";
import { TicketsPage } from "../../pages/TicketsPage";
import { TicketDetailPage } from "../../pages/TicketDetailPage";

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3001";

test.describe("Tickets List & Queue Management", () => {
  test("should display tickets and support full sorting and filters", async ({ adminPage }) => {
    const ticketsPage = new TicketsPage(adminPage);
    await ticketsPage.goto();

    // Verify search
    await ticketsPage.searchTickets("Cannot login");
    // Verify results show first ticket
    await expect(adminPage.getByText("Cannot login to my account")).toBeVisible();

    // Clear search by empty input search
    await ticketsPage.searchTickets("");

    // Try filtering
    await ticketsPage.filterByCategory("Refunds");
    await expect(adminPage.getByText("Billing charge incorrect")).toBeVisible();
    await expect(adminPage.getByText("Cannot login to my account")).not.toBeVisible();
  });

  test("should handle pagination", async ({ adminPage }) => {
    const ticketsPage = new TicketsPage(adminPage);
    await ticketsPage.goto();
    
    // Wait for table data to load and render
    await expect(adminPage.getByText(/Showing \d+ items of \d+ total/i)).toBeVisible({ timeout: 15000 });
    
    // Check if next page button is visible
    const nextBtn = adminPage.getByLabel("Next page");
    await expect(nextBtn).toBeVisible();
  });

  test("should perform bulk actions: resolve selected tickets", async ({ adminPage, request }) => {
    const ticketsPage = new TicketsPage(adminPage);
    
    // Create 2 test tickets via Webhook
    const uniqueId1 = `bulk-1-${Date.now()}`;
    const uniqueId2 = `bulk-2-${Date.now()}`;
    const t1 = await createTicketViaWebhook(request, createTestPayload(uniqueId1));
    const t2 = await createTicketViaWebhook(request, createTestPayload(uniqueId2));

    // Force their status to Open using API so they appear in UI
    await adminPage.request.patch(`${BETTER_AUTH_URL}/api/tickets/${t1.id}`, {
      data: { status: "open", category: "general_question" },
    });
    await adminPage.request.patch(`${BETTER_AUTH_URL}/api/tickets/${t2.id}`, {
      data: { status: "open", category: "general_question" },
    });

    await ticketsPage.goto();

    // Select both checkboxes
    const row1 = adminPage.getByRole("row").filter({ hasText: t1.subject });
    const row2 = adminPage.getByRole("row").filter({ hasText: t2.subject });

    await expect(row1).toBeVisible({ timeout: 15000 });
    await expect(row2).toBeVisible({ timeout: 15000 });

    const row1Checkbox = row1.getByRole("checkbox");
    const row2Checkbox = row2.getByRole("checkbox");

    await row1Checkbox.click();
    await row2Checkbox.click();

    // Verify bulk actions bar pops up
    const resolveBtn = adminPage.getByRole("button", { name: /^resolve$/i });
    await expect(resolveBtn).toBeVisible();
    
    // Click Resolve in bulk
    await resolveBtn.click();

    // Confirm that the status in the rows has updated
    await expect(row1.locator("text=Resolved").first()).toBeVisible();
    await expect(row2.locator("text=Resolved").first()).toBeVisible();
  });

  test("should create support ticket via UI successfully", async ({ adminPage }) => {
    const ticketsPage = new TicketsPage(adminPage);
    await ticketsPage.goto();

    const uniqueId = `create-ui-${Date.now()}`;
    const subject = `Urgent UI bug ${uniqueId}`;
    const body = `Description of the bug ${uniqueId}`;
    
    await ticketsPage.openCreateTicketModal();
    await ticketsPage.createTicket(subject, body, "reporter@example.com", "Reporter User");

    // The ticket is created with status "new" by default which means it may not appear in some queues.
    // We still verify that the create modal closes and the ticket exists in the tickets table.
    await expect(adminPage.getByRole("heading", { name: /create support ticket/i })).not.toBeVisible();

    // Wait for list to show the ticket subject.
    await expect(adminPage.getByText(subject).first()).toBeVisible({ timeout: 15000 });
  });
});

