import { test, expect } from "../../fixtures/auth";
import { DashboardPage } from "../../pages/DashboardPage";

test.describe("Dashboard Page", () => {
  test("should load all widgets and stats correctly for admin", async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.verifyKPIs();
    await dashboard.verifyWorkQueue();
    await dashboard.verifyVolumeChart();
    await dashboard.verifyActivityTimeline();
  });

  test("should load all widgets and stats correctly for agent", async ({ agentPage }) => {
    const dashboard = new DashboardPage(agentPage);
    await dashboard.goto();
    await dashboard.verifyKPIs();
    await dashboard.verifyWorkQueue();
    await dashboard.verifyVolumeChart();
    await dashboard.verifyActivityTimeline();
  });
});
