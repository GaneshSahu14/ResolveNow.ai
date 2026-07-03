import { Page, expect } from "@playwright/test";

export class TicketDetailPage {
  constructor(readonly page: Page) {}

  async goto(id: number | string) {
    await this.page.goto(`/tickets/${id}`);
    await expect(this.page).toHaveURL(`/tickets/${id}`);
  }

  async sendReply(body: string) {
    await this.page.getByRole("button", { name: /customer reply/i }).click();
    await this.page.getByPlaceholder(/type your reply/i).fill(body);
    await this.page.getByRole("button", { name: /send reply/i }).click();
  }

  async addInternalNote(body: string) {
    await this.page.getByRole("button", { name: /internal note/i }).click();
    await this.page.getByPlaceholder(/type a private note/i).fill(body);
    await this.page.getByRole("button", { name: /add note/i }).click();
  }

  async suggestReply() {
    await this.page.getByRole("button", { name: /suggest reply/i }).click();
    // Wait for the compiled suggestion to show
    const draftTextarea = this.page.locator("textarea[readonly]");
    await expect(draftTextarea).toBeVisible({ timeout: 15000 });
    // Click "Insert draft"
    await this.page.getByRole("button", { name: /insert draft/i }).click();
  }

  async polishReply(originalText: string) {
    await this.page.getByPlaceholder(/type your reply/i).fill(originalText);
    await this.page.getByRole("button", { name: /polish/i }).click();
    // Wait for the value of the textarea to change
    await expect(this.page.getByPlaceholder(/type your reply/i)).not.toHaveValue(originalText, { timeout: 15000 });
  }

  async updateStatus(statusName: string) {
    // There are three comboboxes on the sidebar: Status is the first one
    const trigger = this.page.getByRole("combobox").first();
    await trigger.click();
    await this.page.getByRole("option", { name: new RegExp(`^${statusName}$`, "i") }).click();
  }

  async updateCategory(categoryName: string) {
    // Category is the second combobox
    const trigger = this.page.getByRole("combobox").nth(1);
    await trigger.click();
    await this.page.getByRole("option", { name: new RegExp(`^${categoryName}$`, "i") }).click();
  }

  async assignToAgent(agentName: string) {
    // Assigned Agent is the third (last) combobox
    const trigger = this.page.getByRole("combobox").last();
    await trigger.click();
    await this.page.getByRole("option", { name: new RegExp(`^${agentName}$`, "i") }).click();
  }

  async generateSummary() {
    await this.page.getByRole("button", { name: /^summarize$/i }).click();
    await expect(this.page.getByText("✦ AI Summary")).toBeVisible({ timeout: 15000 });
  }

  async expectReplyVisible(body: string) {
    await expect(this.page.getByText(body).first()).toBeVisible();
  }
}
