import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const DATA_PATH = join(process.cwd(), "data", "board.json");

test.beforeEach(() => {
  writeFileSync(DATA_PATH, JSON.stringify({ tasks: [] }, null, 2) + "\n");
});

test("homepage loads and shows kanban board", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("Kanbani");
  await expect(page.getByText("To Do")).toBeVisible();
  await expect(page.getByText("In Progress")).toBeVisible();
  await expect(page.getByText("Testing")).toBeVisible();
  await expect(page.getByText("Done")).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/home.png" });
});

test("can create a task", async ({ page }) => {
  await page.goto("/");

  await page.locator("button", { hasText: "+" }).click();
  await expect(page.getByText("Create Task")).toBeVisible();

  await page.fill("#new-title", "Test task");
  await page.fill("#new-desc", "Test description");
  await page.click("button[type='submit']");

  await expect(page.getByText("Test task")).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/task-created.png" });
});

test("can open task side panel and edit", async ({ page }) => {
  await page.goto("/");

  // Create a task first
  await page.locator("button", { hasText: "+" }).click();
  await page.fill("#new-title", "Editable task");
  await page.click("button[type='submit']");
  await expect(page.getByText("Editable task")).toBeVisible();

  // Click the task card to open panel
  await page.getByText("Editable task").click();
  await expect(page.getByText("Task Details")).toBeVisible();

  // Edit title
  await page.fill("#task-title", "Updated task");
  await page.locator("#task-desc").click(); // blur title to trigger save

  await page.screenshot({ path: "e2e/screenshots/task-panel.png" });

  // Close panel
  await page.keyboard.press("Escape");
  await expect(page.getByText("Updated task")).toBeVisible();
});

test("can delete a task", async ({ page }) => {
  await page.goto("/");

  // Create a task
  await page.locator("button", { hasText: "+" }).click();
  await page.fill("#new-title", "Delete me");
  await page.click("button[type='submit']");
  await expect(page.getByText("Delete me")).toBeVisible();

  // Open panel and delete
  await page.getByText("Delete me").click();
  await page.getByText("Delete task").click();

  await expect(page.getByText("Delete me")).not.toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/task-deleted.png" });
});
