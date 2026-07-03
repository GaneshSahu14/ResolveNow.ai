import { Page, expect } from "@playwright/test";

export class LoginPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: /sign in/i }).click();
  }

  async expectFormElements() {
    await expect(this.page.getByText("Welcome back")).toBeVisible();
    await expect(this.page.getByLabel("Email")).toBeVisible();
    await expect(this.page.getByLabel("Password")).toBeVisible();
    await expect(this.page.getByRole("button", { name: /sign in/i })).toBeVisible();
  }

  async expectValidationError(message: string | RegExp) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  async expectAlertError(message: string | RegExp) {
    const alert = this.page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(message);
  }
}
