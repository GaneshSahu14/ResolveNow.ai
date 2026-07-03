import { Page, expect } from "@playwright/test";

export class InboxPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("/inbox");
    await expect(this.page).toHaveURL("/inbox");
  }

  async selectTicket(subject: string) {
    const item = this.page.getByText(subject).first();
    await expect(item).toBeVisible({ timeout: 15000 });
    await item.click();
  }

  async sendReply(body: string) {
    const textComposer = this.page.getByPlaceholder("Type your reply...");
    await textComposer.fill(body);
    await this.page.getByRole("button", { name: /send reply/i }).click({ force: true });
  }

  async suggestReply() {
    await this.page.getByRole("button", { name: /ai draft/i }).click();
    // Wait for the suggestion to populate
    const textComposer = this.page.getByPlaceholder("Type your reply...");
    await expect(textComposer).not.toHaveValue("", { timeout: 15000 });
  }

  async escalateTicket() {
    await this.page.getByRole("button", { name: /escalate ticket/i }).click();
  }

  async openTicketDetails() {
    await this.page.getByRole("link", { name: /details/i }).click();
  }
}
