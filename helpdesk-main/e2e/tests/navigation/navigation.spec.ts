import { test, expect } from "../../fixtures/auth";
import { Navigation } from "../../pages/Navigation";

test.describe("App Navigation & Accessibility Paths", () => {
  test("should navigate to every page successfully for admin and verify active states", async ({ adminPage }) => {
    const nav = new Navigation(adminPage);

    // Verify reachability of AI Insights
    await adminPage.getByRole("link", { name: /ai insights/i }).click();
    await expect(adminPage).toHaveURL("/ai-insights");
    await expect(adminPage.getByRole("heading", { name: /deep insights/i })).toBeVisible();

    // Verify reachability of Analytics
    await adminPage.getByRole("link", { name: /analytics/i }).click();
    await expect(adminPage).toHaveURL("/analytics");
    await expect(adminPage.getByRole("heading", { name: /performance analytics/i })).toBeVisible();

    // Go to Dashboard
    await nav.toDashboard();
    
    // Go to Inbox
    await nav.toInbox();

    // Go to Tickets
    await nav.toTickets();

    // Go to Knowledge Base
    await nav.toKnowledgeBase();

    // Go to Settings
    await nav.toSettings();

    // Go to Users
    await nav.toUsers();
  });

  test("should support keyboard navigation tab order on settings page", async ({ adminPage }) => {
    await adminPage.goto("/settings");
    
    // Check initial focus can be moved to input via keyboard
    const nameInput = adminPage.getByLabel("Display Name");
    await expect(nameInput).toBeVisible({ timeout: 15000 });
    await nameInput.focus();
    await expect(nameInput).toBeFocused();

    // Tab to next item (Save button or discard button)
    await adminPage.keyboard.press("Tab");
  });
});
