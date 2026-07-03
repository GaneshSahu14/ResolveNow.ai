import { test, expect } from "../../fixtures/auth";
import { UsersPage } from "../../pages/UsersPage";

test.describe("User Management CRUD (Admin Only)", () => {
  test("should display users table with correct headers", async ({ adminPage }) => {
    const usersPage = new UsersPage(adminPage);
    await usersPage.goto();

    const table = adminPage.getByRole("table");
    await expect(table).toBeVisible();

    await expect(adminPage.getByRole("columnheader", { name: /^name$/i })).toBeVisible();
    await expect(adminPage.getByRole("columnheader", { name: /^email$/i })).toBeVisible();
    await expect(adminPage.getByRole("columnheader", { name: /^role$/i })).toBeVisible();
    await expect(adminPage.getByRole("columnheader", { name: /^created$/i })).toBeVisible();
  });

  test("should create, edit, and revoke agent user successfully", async ({ adminPage }) => {
    const usersPage = new UsersPage(adminPage);
    await usersPage.goto();

    const timestamp = Date.now();
    const name = `Test Agent ${timestamp}`;
    const email = `agent-${timestamp}@example.com`;
    const password = "password123";

    // 1. Create
    await usersPage.createUser(name, email, password);
    await usersPage.expectUserInTable(email, name);

    // 2. Edit name & email
    const updatedName = `Updated Agent ${timestamp}`;
    const updatedEmail = `updated-agent-${timestamp}@example.com`;
    await usersPage.editUser(name, updatedName, updatedEmail);
    await usersPage.expectUserInTable(updatedEmail, updatedName);

    // 3. Delete / Revoke
    await usersPage.deleteUser(updatedName);
    await usersPage.expectUserNotInTable(updatedEmail);
  });
});
