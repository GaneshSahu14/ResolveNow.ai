import { test, expect, TEST_USERS, expectLoginPage, expectHomePage } from "../../fixtures/auth";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");
  });

  test("should display login form with all elements", async ({ loginPage }) => {
    await loginPage.expectFormElements();
  });

  test("should show error with empty email and empty password", async ({ loginPage, page }) => {
    await page.getByRole("button", { name: /sign in/i }).click();

    // Email is required
    await loginPage.expectValidationError(/please enter a valid email/i);
    // Password is required
    await loginPage.expectValidationError(/password is required/i);

    await expectLoginPage(page);
  });

  test("should show error with invalid email format", async ({ loginPage, page }) => {
    await loginPage.login("invalid-email", "password123");
    await loginPage.expectValidationError(/please enter a valid email/i);
    await expectLoginPage(page);
  });

  test("should show error with empty password", async ({ loginPage, page }) => {
    await page.getByLabel("Email").fill(TEST_USERS.admin.email);
    await page.getByRole("button", { name: /sign in/i }).click();
    await loginPage.expectValidationError(/password is required/i);
    await expectLoginPage(page);
  });

  test("should show error with invalid credentials", async ({ loginPage, page }) => {
    await loginPage.login("nonexistent@example.com", "password123");
    await loginPage.expectAlertError(/invalid email or password/i);
    await expectLoginPage(page);
  });

  test("should login successfully with valid admin credentials", async ({ loginPage, page }) => {
    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await expectHomePage(page);
  });

  test("should login successfully with valid agent credentials", async ({ loginPage, page }) => {
    await loginPage.login(TEST_USERS.agent.email, TEST_USERS.agent.password);
    await expectHomePage(page);
  });

  test.describe("Authenticated Scenarios", () => {
    test("should maintain session after page reload", async ({ adminPage }) => {
      await adminPage.reload();
      await expectHomePage(adminPage);
    });

    test("should expire session when cookies are cleared", async ({ adminPage }) => {
      // Clear auth state and force navigation
      await adminPage.context().clearCookies();
      await adminPage.goto("/dashboard");

      // Protected route should redirect to login
      await expect(adminPage).toHaveURL(/\/login|\/$/);
      await expect(adminPage.getByText(/welcome back/i)).toBeVisible();
    });

    test("should maintain session when 'remember me' is enabled (if feature exists)", async ({ browser }) => {
      const storagePath = "./e2e/storage/auth-admin.json";

      const context = await browser.newContext({ storageState: storagePath });
      const page = await context.newPage();

      await page.goto("/login");

      // Feature detection: only run if remember-me control exists
      const rememberCheckbox =
        page.getByRole("checkbox", { name: /remember me/i }).first();

      if ((await rememberCheckbox.count()) === 0) {
        test.skip(true, "Remember me feature not present (checkbox not found).");
      }

      await page.getByLabel("Email").fill(TEST_USERS.admin.email);
      await page.getByLabel("Password").fill(TEST_USERS.admin.password);

      await rememberCheckbox.check();
      await page.getByRole("button", { name: /sign in/i }).click();

      await expectHomePage(page);

      // Close and reopen context to verify persistence
      await context.close();

      const ctx2 = await browser.newContext({ storageState: storagePath });
      const page2 = await ctx2.newPage();
      await page2.goto("/dashboard");

      await expectHomePage(page2);
      await ctx2.close();
    });

    test("should logout successfully", async ({ adminPage, navigation }) => {
      // Re-initialize navigation POM for adminPage
      const adminNav = new (navigation.constructor as any)(adminPage);
      await adminNav.signOut();
      await expect(adminPage).toHaveURL(/\/login|\/$/);
    });
  });

  test.describe("Unauthorized Route Access", () => {
    test("should redirect guest to login for protected pages", async ({ page }) => {
      // Dashboard already covered by security spec, but keep broader coverage here
      await page.goto("/tickets");
      await expect(page).toHaveURL("/login");

      await page.goto("/ticket/1");
      await expect(page).toHaveURL("/login");

      await page.goto("/inbox");
      await expect(page).toHaveURL("/login");

      await page.goto("/knowledge-base");
      await expect(page).toHaveURL("/login");

      await page.goto("/settings");
      await expect(page).toHaveURL("/login");

      await page.goto("/users");
      await expect(page).toHaveURL("/login");
    });
  });
});
