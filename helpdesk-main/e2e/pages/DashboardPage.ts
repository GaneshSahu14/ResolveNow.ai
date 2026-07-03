import { Page, expect } from "@playwright/test";

export class DashboardPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("/dashboard");
    await expect(this.page).toHaveURL("/dashboard");
    await expect(this.page.getByRole("heading", { name: /^dashboard$|^dashboard overview$/i })).toBeVisible();
  }

  async verifyKPIs() {
    await expect(this.page.getByText("Open Tickets")).toBeVisible();
    await expect(this.page.getByText("Resolved Today")).toBeVisible();
    await expect(this.page.getByText("Avg Response Time")).toBeVisible();
    await expect(this.page.getByText("Satisfaction Score")).toBeVisible();
  }

  async verifyWorkQueue() {
    await expect(this.page.getByText("Today's Work Queue")).toBeVisible();
  }

  async verifyVolumeChart() {
    await expect(this.page.getByText("Ticket Volume Intake")).toBeVisible();
  }

  async verifyActivityTimeline() {
    await expect(this.page.getByText("Recent Activity Timeline")).toBeVisible();
  }
}
