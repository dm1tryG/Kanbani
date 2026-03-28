import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const DATA_PATH = join(process.cwd(), "data", "board.json");

test.beforeEach(() => {
  writeFileSync(
    DATA_PATH,
    JSON.stringify({ tasks: [], projects: [] }, null, 2) + "\n",
  );
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

test("can create a task with folder picker", async ({ page }) => {
  await page.goto("/");

  await page.locator("button", { hasText: "+" }).click();
  await expect(page.getByText("Create Task")).toBeVisible();

  // Folder picker should be shown immediately (no projects yet)
  await expect(page.getByText("Select this folder")).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/folder-picker.png" });

  // Navigate into a folder and select it
  // We're starting at $HOME, just select the current folder
  await page.getByText("Select this folder").click();

  // Now fill in task details
  await page.fill("#new-title", "Test task");
  await page.fill("#new-desc", "Test description");
  await page.click("button[type='submit']");

  await expect(page.getByText("Test task")).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/task-created-with-folder.png" });
});

test("project dropdown shows previously used projects", async ({ page }) => {
  // Seed with an existing project
  writeFileSync(
    DATA_PATH,
    JSON.stringify(
      {
        tasks: [
          {
            id: "test-1",
            title: "Existing task",
            description: "",
            column: "todo",
            folder: "/Users/dmitrii/projects/kanbani",
            createdAt: new Date().toISOString(),
          },
        ],
        projects: ["/Users/dmitrii/projects/kanbani"],
      },
      null,
      2,
    ) + "\n",
  );

  await page.goto("/");
  await expect(page.getByText("Existing task")).toBeVisible();

  // Task card should show folder label
  await expect(page.locator(".text-blue-700", { hasText: "kanbani" })).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/task-card-with-label.png" });

  // Open create modal — should show dropdown (not picker) since projects exist
  await page.locator("button", { hasText: "+" }).click();
  await expect(page.getByText("Create Task")).toBeVisible();

  // Click the project dropdown — use the one inside the modal
  await page.locator(".relative button", { hasText: "kanbani" }).click();
  await expect(page.getByText("+ Browse for folder...")).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/project-dropdown.png" });

  // Click browse to open picker
  await page.getByText("+ Browse for folder...").click();
  await expect(page.getByText("Select this folder")).toBeVisible();
  await page.screenshot({
    path: "e2e/screenshots/folder-picker-from-dropdown.png",
  });
});

test("can open task side panel and see folder", async ({ page }) => {
  // Seed with a task that has a folder
  writeFileSync(
    DATA_PATH,
    JSON.stringify(
      {
        tasks: [
          {
            id: "test-2",
            title: "Task with folder",
            description: "Has a project",
            column: "todo",
            folder: "/Users/dmitrii/projects/kanbani",
            createdAt: new Date().toISOString(),
          },
        ],
        projects: ["/Users/dmitrii/projects/kanbani"],
      },
      null,
      2,
    ) + "\n",
  );

  await page.goto("/");
  await page.getByText("Task with folder").click();
  await expect(page.getByText("Task Details")).toBeVisible();

  // Should show project info in panel
  const panel = page.locator(".animate-slide-in");
  await expect(panel.getByText("Project", { exact: true })).toBeVisible();
  await expect(
    panel.locator(".text-blue-700", { hasText: "kanbani" }),
  ).toBeVisible();
  await expect(
    panel.getByText("/Users/dmitrii/projects/kanbani"),
  ).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/task-panel-with-folder.png" });
});

test("can delete a task", async ({ page }) => {
  // Seed with a task
  writeFileSync(
    DATA_PATH,
    JSON.stringify(
      {
        tasks: [
          {
            id: "test-3",
            title: "Delete me",
            description: "",
            column: "todo",
            folder: "/tmp",
            createdAt: new Date().toISOString(),
          },
        ],
        projects: ["/tmp"],
      },
      null,
      2,
    ) + "\n",
  );

  await page.goto("/");
  await expect(page.getByText("Delete me")).toBeVisible();

  // Open panel and delete
  await page.getByText("Delete me").click();
  await page.getByText("Delete task").click();

  await expect(page.getByText("Delete me")).not.toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/task-deleted.png" });
});
