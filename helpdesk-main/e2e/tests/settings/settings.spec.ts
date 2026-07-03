import { test, expect } from "../../fixtures/auth";
import { SettingsPage } from "../../pages/SettingsPage";

test.describe("Identity & App Settings", () => {
  test("should load settings and successfully save simulated changes", async ({ adminPage }) => {
    const settings = new SettingsPage(adminPage);
    await settings.goto();

    // Verify fields are loaded
    await expect(adminPage.getByLabel("Display Name")).toHaveValue("Admin");
    await expect(adminPage.getByLabel("Enterprise Email")).toHaveValue("admin@example.com");

    // Change Display Name
    const updatedName = "Admin Executive";
    await settings.updateDisplayName(updatedName);

    // Toggle Theme (Deep Space / Light)
    await settings.selectTheme("Light");
    
    // Check if the light button is active
    const lightBtn = adminPage.getByRole("button", { name: "light_mode Light" });
    await expect(lightBtn).toHaveClass(/border-primary bg-primary/);

    // Change AI Parameters (Confidence: 90%, Tone: Warm)
    await settings.configureAI(90, "warm");

    // Click Save (Alert will pop up, SettingsPage.save() waits for and accepts it)
    await settings.save();
  });
});
