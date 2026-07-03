import { test, expect } from "../../fixtures/auth";

test.describe("Security & Permission Boundaries", () => {
  test("should redirect unauthenticated guest to login for protected pages", async ({ page }) => {
    // Access dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login");

    // Access users
    await page.goto("/users");
    await expect(page).toHaveURL("/login");

    // Access settings
    await page.goto("/settings");
    await expect(page).toHaveURL("/login");
  });

  test("should redirect agent user to dashboard when accessing admin-only page", async ({ agentPage }) => {
    // Agent attempts to access /users directly
    await agentPage.goto("/users");
    await expect(agentPage).toHaveURL("/dashboard");
  });

  test("should enforce server-side role boundaries for agent", async ({ agentPage }) => {
    // Agent attempts to fetch users via API
    const response = await agentPage.request.get("/api/users");
    expect(response.status()).toBe(403);

    // Agent attempts to create user via API
    const createResponse = await agentPage.request.post("/api/users", {
      data: { name: "Hacker Agent", email: "hacker@example.com", password: "password123" },
    });
    expect(createResponse.status()).toBe(403);
  });
});
