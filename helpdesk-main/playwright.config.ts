import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/tests",
  // storageState is generated once in globalSetup and then reused across suites

  globalSetup: "./e2e/global-setup.ts",
  // storage state files live under helpdesk-main/e2e/storage/

  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  outputDir: "./e2e/test-results",
  reporter: [["html", { outputFolder: "./e2e/playwright-report" }]],
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: "http://127.0.0.1:5174",

    trace: "on-first-retry",
    screenshot: "on",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: [
    {
      command: "bun run --cwd server src/index.ts",
      url: "http://127.0.0.1:3001/api/health",
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: process.env.PORT ?? "3001",
        DATABASE_URL:
          process.env.DATABASE_URL ??
          'postgresql://neondb_owner:npg_A8RiMX9ZdvFY@ep-cold-violet-atghvp9l-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
        WEBHOOK_SECRET: process.env.WEBHOOK_SECRET ?? 'test-webhook-secret',
        BETTER_AUTH_SECRET:
          process.env.BETTER_AUTH_SECRET ?? "test-secret-do-not-use-in-production",
        BETTER_AUTH_URL: "http://127.0.0.1:3001",
        TRUSTED_ORIGINS: "http://127.0.0.1:5174",
        NODE_ENV: "test",
      },
    },
    {
      command: "bun run --cwd client dev -- --port 5174 --host 127.0.0.1",
      url: "http://127.0.0.1:5174",
      reuseExistingServer: !process.env.CI,
      env: {
        VITE_API_URL: "http://127.0.0.1:3001",
      },
    },
  ],
});
