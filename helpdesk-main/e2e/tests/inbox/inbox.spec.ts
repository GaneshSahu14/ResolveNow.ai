import { test, expect, createTicketViaWebhook, createTestPayload } from "../../fixtures/auth";
import { InboxPage } from "../../pages/InboxPage";

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3001";

test.describe("Agent Inbox Workflow", () => {
  test("should display ticket lists and handle replying and AI suggestions", async ({ adminPage, request }) => {
    // Create an open ticket via webhook
    const uniqueId = `inbox-flow-${Date.now()}`;
    const payload = createTestPayload(uniqueId);
    const ticket = await createTicketViaWebhook(request, payload);

    await adminPage.request.patch(`${BETTER_AUTH_URL}/api/tickets/${ticket.id}`, {
      data: { status: "open", category: "general_question" },
    });

    // Mock the suggest reply inside Inbox
    await adminPage.route("**/api/tickets/*/replies/suggest", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ suggestion: "This is a mock suggested reply for inbox." }),
      });
    });

    const inbox = new InboxPage(adminPage);
    await inbox.goto();

    // Select the ticket in the list
    await inbox.selectTicket(ticket.subject);

    // Verify conversation thread header displays the ticket
    await expect(adminPage.getByRole("heading", { name: ticket.subject }).first()).toBeVisible();

    // Test AI Draft suggestion
    await inbox.suggestReply();
    await expect(adminPage.getByPlaceholder(/type your reply/i)).toHaveValue("This is a mock suggested reply for inbox.");

    // Submit reply
    const replyBody = `Inbox reply message ${uniqueId}`;
    await inbox.sendReply(replyBody);
    await expect(adminPage.getByText(replyBody).first()).toBeVisible();

    // Navigate to ticket detail view
    await inbox.openTicketDetails();
    await expect(adminPage).toHaveURL(`/tickets/${ticket.id}`);
  });
});
