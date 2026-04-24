import { test, expect } from "@playwright/test";

test("landing page and dashboard render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Turn public job boards into strategy signals")).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByText("Competitor hiring intelligence")).toBeVisible();
  await expect(page.getByText("Overview")).toBeVisible();
  await expect(page.getByText("Signals")).toBeVisible();
  await expect(page.getByText("Jobs")).toBeVisible();
});
