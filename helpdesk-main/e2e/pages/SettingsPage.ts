import { Page, expect } from "@playwright/test";

export class SettingsPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("/settings");
    await expect(this.page).toHaveURL("/settings");
    await expect(this.page.getByRole("heading", { name: /settings & configuration/i })).toBeVisible({ timeout: 15000 });
  }

  async updateDisplayName(name: string) {
    const input = this.page.getByLabel("Display Name");
    await input.clear();
    await input.fill(name);
  }

  async selectTheme(themeName: "Deep Space" | "Light") {
    const accessibleName = themeName === "Light" ? "light_mode Light" : "dark_mode Deep Space";
    await this.page.getByRole("button", { name: accessibleName }).click();
  }

  async configureAI(confidence: number, tone: "professional" | "warm" | "concise") {
    // Slider
    const slider = this.page.locator("input[type='range']");
    await slider.fill(String(confidence));
    
    // Select dropdown — uses aria label linkage (label[for="smart-reply-tone"])
    const select = this.page.getByLabel("Smart Reply Tone");
    await select.selectOption(tone);
  }

  async save() {
    // Alert dialog handler is registered before clicking save
    const dialogPromise = this.page.waitForEvent("dialog");
    await this.page.getByRole("button", { name: /save configuration/i }).click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain("All settings saved!");
    await dialog.accept();
  }
}
