import { Page, expect } from "@playwright/test";

export class Navigation {
  constructor(readonly page: Page) {}

  async toDashboard() {
    await this.page.getByRole("link", { name: /dashboard/i }).first().click();
    await expect(this.page).toHaveURL("/dashboard");
  }

  async toInbox() {
    await this.page.getByRole("link", { name: /inbox/i }).first().click();
    await expect(this.page).toHaveURL("/inbox");
  }

  async toTickets() {
    await this.page.getByRole("link", { name: /tickets/i }).first().click();
    await expect(this.page).toHaveURL("/tickets");
  }

  async toKnowledgeBase() {
    await this.page.getByRole("link", { name: /knowledge base/i }).first().click();
    await expect(this.page).toHaveURL("/knowledge-base");
  }

  async toUsers() {
    await this.page.getByRole("link", { name: /users/i }).first().click();
    await expect(this.page).toHaveURL("/users");
  }

  async toSettings() {
    await this.page.getByRole("link", { name: /settings/i }).first().click();
    await expect(this.page).toHaveURL("/settings");
  }

  async signOut() {
    await this.page.getByRole("button", { name: /sign out/i }).click();
    await this.page.waitForURL(/\/login|\/$/);
  }

  async expectUsersLinkVisible(visible: boolean) {
    const link = this.page.getByRole("link", { name: /users/i });
    if (visible) {
      await expect(link).toBeVisible();
    } else {
      await expect(link).not.toBeVisible();
    }
  }
}
