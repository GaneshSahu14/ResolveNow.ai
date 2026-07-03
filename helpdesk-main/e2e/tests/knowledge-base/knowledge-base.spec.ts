import { test, expect } from "../../fixtures/auth";
import { KnowledgeBasePage } from "../../pages/KnowledgeBasePage";

test.describe("Knowledge Base Catalog", () => {
  test("should display category filters and support reading articles", async ({ adminPage }) => {
    const kb = new KnowledgeBasePage(adminPage);
    await kb.goto();

    await kb.searchArticles("refund");
    await kb.verifyArticleContent("How to Request a Refund", "Refund Guarantee Policy");

    // Click the article to read details
    await kb.selectArticle("How to Request a Refund");
    
    // Verify detailed markdown layout and content
    await expect(adminPage.getByRole("heading", { name: "How to Request a Refund" })).toBeVisible();
    await expect(adminPage.getByText(/Refund Guarantee Policy/).first()).toBeVisible();
    await expect(adminPage.getByText(/Ensure your transaction/).first()).toBeVisible();
    await expect(adminPage.getByText(/NOTE/).first()).toBeVisible();

    // Go back to main directory
    await kb.goBack();

    // Clear search
    await kb.searchArticles("");

    // Try filtering categories
    await kb.filterByCategory("Troubleshooting");
    await expect(adminPage.getByText("CORS and Authentication Troubleshooting")).toBeVisible();
  });
});
