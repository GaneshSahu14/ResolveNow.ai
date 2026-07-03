import { test, expect, createTicketViaWebhook, createTestPayload } from "../../fixtures/auth";
import { TicketDetailPage } from "../../pages/TicketDetailPage";

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3001";

test.describe("AI Copilot Features", () => {
  let ticketId: number;

  test.beforeEach(async ({ adminPage, request }) => {
    const uniqueId = `ai-test-${Date.now()}`;
    const payload = createTestPayload(uniqueId);
    const ticket = await createTicketViaWebhook(request, payload);
    ticketId = ticket.id;

    // Open the ticket immediately with status and category
    await adminPage.request.patch(`${BETTER_AUTH_URL}/api/tickets/${ticketId}`, {
      data: { status: "open", category: "general_question" },
    });
  });

  test("should successfully generate AI summary, suggestion, and polish drafts", async ({ adminPage }) => {
    test.slow();
    // Intercept and return mock responses for AI endpoints
    await adminPage.route("**/api/tickets/*/replies/summarize", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ summary: "This is a deterministic mock AI summary of the ticket." }),
      });
    });

    await adminPage.route("**/api/tickets/*/replies/suggest", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ suggestion: "Hello, this is a mock AI reply suggestion." }),
      });
    });

    await adminPage.route("**/api/tickets/*/replies/polish", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ body: "Hello, this is the mock polished reply." }),
      });
    });

    const ticketDetail = new TicketDetailPage(adminPage);
    await ticketDetail.goto(ticketId);

    // Test AI Summarize
    await ticketDetail.generateSummary();
    await expect(adminPage.getByText("This is a deterministic mock AI summary of the ticket.")).toBeVisible();

    // Test AI Suggest Reply
    await ticketDetail.suggestReply();
    await expect(adminPage.getByPlaceholder(/type your reply/i)).toHaveValue("Hello, this is a mock AI reply suggestion.");

    // Test AI Polish
    await ticketDetail.polishReply("Hello, please polish this text.");
    await expect(adminPage.getByPlaceholder(/type your reply/i)).toHaveValue("Hello, this is the mock polished reply.");
  });

  test("should handle AI API failures gracefully and show error alerts", async ({ adminPage }) => {
    // Force AI endpoints to fail
    await adminPage.route("**/api/tickets/*/replies/summarize", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    const ticketDetail = new TicketDetailPage(adminPage);
    await ticketDetail.goto(ticketId);

    // Trigger summarize
    await adminPage.getByRole("button", { name: /^summarize$/i }).click();

    // Verify error banner is shown
    await expect(adminPage.getByRole("alert")).toBeVisible();
    await expect(adminPage.getByRole("alert")).toContainText(/Internal Server Error/i);
  });
});
