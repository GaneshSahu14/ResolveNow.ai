import { test, expect, createTicketViaWebhook, createTestPayload } from "../../fixtures/auth";
import { TicketDetailPage } from "../../pages/TicketDetailPage";

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3001";

test.describe("Ticket Detail Conversations & Updates", () => {
  test("should display conversation and allow posting customer replies and internal notes", async ({ adminPage, request }) => {
    const uniqueId = `detail-${Date.now()}`;
    const payload = createTestPayload(uniqueId);
    const ticket = await createTicketViaWebhook(request, payload);

    // Force Open status so it has loaded fully
    await adminPage.request.patch(`${BETTER_AUTH_URL}/api/tickets/${ticket.id}`, {
      data: { status: "open", category: "general_question" },
    });

    const ticketDetail = new TicketDetailPage(adminPage);
    await ticketDetail.goto(ticket.id);

    // Verify customer conversation is visible
    await expect(adminPage.getByRole("heading", { name: ticket.subject })).toBeVisible();
    await expect(adminPage.getByText(payload.body)).toBeVisible();

    // Post customer reply
    const replyBody = `Customer reply text ${uniqueId}`;
    await ticketDetail.sendReply(replyBody);
    await ticketDetail.expectReplyVisible(replyBody);

    // Post internal note
    const noteBody = `Internal note text ${uniqueId}`;
    await ticketDetail.addInternalNote(noteBody);
    await ticketDetail.expectReplyVisible(noteBody);
  });

  test("should support triaging updates (Status, Category, Assignee)", async ({ adminPage, request }) => {
    const uniqueId = `triage-${Date.now()}`;
    const payload = createTestPayload(uniqueId);
    const ticket = await createTicketViaWebhook(request, payload);

    await adminPage.request.patch(`${BETTER_AUTH_URL}/api/tickets/${ticket.id}`, {
      data: { status: "open", category: "general_question" },
    });

    const ticketDetail = new TicketDetailPage(adminPage);
    await ticketDetail.goto(ticket.id);

    // Update status
    await ticketDetail.updateStatus("Resolved");
    await expect(adminPage.getByRole("combobox").first()).toHaveText("Resolved");
    // Verify status persists on reload
    await adminPage.reload();
    await expect(adminPage.getByRole("combobox").first()).toHaveText("Resolved");

    // Update category
    await ticketDetail.updateCategory("Technical");
    await expect(adminPage.getByRole("combobox").nth(1)).toHaveText("Technical");
    await adminPage.reload();
    await expect(adminPage.getByRole("combobox").nth(1)).toHaveText("Technical");

    // Update assignment
    await ticketDetail.assignToAgent("Admin");
    await expect(adminPage.getByRole("combobox").last()).toHaveText("Admin");
    await adminPage.reload();
    await expect(adminPage.getByRole("combobox").last()).toHaveText("Admin");
  });
});
