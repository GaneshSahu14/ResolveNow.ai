import { Page, expect } from "@playwright/test";

export class KnowledgeBasePage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("/knowledge-base");
    await expect(this.page).toHaveURL("/knowledge-base");
    await expect(this.page.getByRole("heading", { name: /knowledge base/i })).toBeVisible({ timeout: 15000 });
  }

  async searchArticles(query: string) {
    const searchInput = this.page.getByPlaceholder(/e\.g\./i);
    await searchInput.fill(query);
  }

  async filterByCategory(categoryName: string) {
    // categoryName e.g., "Troubleshooting", "Administration"
    // Find the category button that contains a heading with the categoryName
    await this.page.getByRole("button").filter({ has: this.page.getByRole("heading", { name: categoryName, exact: true }) }).click();
  }

  async selectArticle(title: string) {
    await this.page.getByRole("heading", { name: title }).first().click();
  }

  async goBack() {
    await this.page.getByRole("button", { name: /back to articles/i }).click();
  }

  async verifyArticleContent(title: string, bodySnippet: string) {
    await expect(this.page.getByRole("heading", { name: title }).first()).toBeVisible();
    await expect(this.page.getByText(bodySnippet).first()).toBeVisible();
  }
}
