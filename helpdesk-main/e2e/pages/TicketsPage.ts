import { Page, expect } from "@playwright/test";

export class TicketsPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("/tickets");
    await expect(this.page).toHaveURL("/tickets");
  }

  async openCreateTicketModal() {
    // Click "New Ticket" button in sidebar (rendered in Layout)
    await this.page.getByRole("button", { name: /new ticket/i }).click();
    await expect(this.page.getByRole("heading", { name: /create support ticket/i })).toBeVisible();
  }

  async createTicket(subject: string, body: string, senderEmail: string, senderName: string) {
    await this.page.getByLabel("Customer Name").fill(senderName);
    await this.page.getByLabel("Customer Email").fill(senderEmail);
    await this.page.getByLabel("Subject").fill(subject);
    await this.page.getByLabel("Description").fill(body);
    await this.page.getByRole("button", { name: /create ticket/i }).click();
  }

  async searchTickets(query: string) {
    const searchInput = this.page.getByPlaceholder("Search tickets...");
    await searchInput.fill(query);
    await searchInput.press("Enter");
  }

  async filterByCategory(categoryName: string) {
    // categoryName e.g., "General Qs", "Technical Qs", "Refunds"
    await this.page.getByRole("button", { name: categoryName, exact: true }).click();
  }

  async filterByStatus(statusName: string) {
    // statusName e.g., "Open", "Resolved", "Closed"
    await this.page.getByRole("button", { name: statusName, exact: true }).click();
  }

  async selectTicket(subject: string) {
    const link = this.page.getByRole("row").filter({ hasText: subject }).getByRole("link");
    await link.first().click();
  }

  async expectTicketVisible(subject: string) {
    await expect(this.page.getByText(subject).first()).toBeVisible();
  }
}
