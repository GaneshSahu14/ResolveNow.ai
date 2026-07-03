import { Page, expect } from "@playwright/test";

export class UsersPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("/users");
    await expect(this.page).toHaveURL("/users");
    await expect(this.page.getByRole("heading", { name: /^users$/i })).toBeVisible();
  }

  async createUser(name: string, email: string, password: string) {
    await this.page.getByRole("button", { name: /new user/i }).click();
    await expect(this.page.getByRole("heading", { name: /^create user$/i })).toBeVisible();
    await this.page.getByLabel(/^name$/i).fill(name);
    await this.page.getByLabel(/^email$/i).fill(email);
    await this.page.getByLabel(/^password$/i).fill(password);
    await this.page.getByRole("button", { name: /create user/i }).click();
  }

  async editUser(name: string, newName: string, newEmail: string) {
    const row = this.page.getByRole("row").filter({ hasText: name });
    await row.getByRole("button", { name: new RegExp(`edit ${name}`, "i") }).click();
    await expect(this.page.getByRole("heading", { name: /^edit user$/i })).toBeVisible();
    await this.page.getByLabel(/^name$/i).clear();
    await this.page.getByLabel(/^name$/i).fill(newName);
    await this.page.getByLabel(/^email$/i).clear();
    await this.page.getByLabel(/^email$/i).fill(newEmail);
    await this.page.getByRole("button", { name: /save changes/i }).click();
  }

  async deleteUser(name: string) {
    const row = this.page.getByRole("row").filter({ hasText: name });
    await row.getByRole("button", { name: new RegExp(`delete ${name}`, "i") }).click();
    await expect(this.page.getByRole("heading", { name: /revoke access/i })).toBeVisible();
    await this.page.getByRole("button", { name: /confirm revocation/i }).click();
  }

  async expectUserInTable(email: string, name?: string) {
    await expect(this.page.getByRole("cell", { name: email, exact: true })).toBeVisible();
    if (name) {
      const row = this.page.getByRole("row").filter({ hasText: email });
      await expect(row).toContainText(name);
    }
  }

  async expectUserNotInTable(email: string) {
    await expect(this.page.getByRole("cell", { name: email, exact: true })).not.toBeVisible();
  }
}
