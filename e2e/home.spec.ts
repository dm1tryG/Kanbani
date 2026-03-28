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
            comments: [],
            agentRunning: false,
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

  // Task card should show folder label (Badge component)
  await expect(page.getByText("kanbani", { exact: true }).first()).toBeVisible();
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
            comments: [],
            agentRunning: false,
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
    panel.getByText("kanbani", { exact: true }).first(),
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
            comments: [],
            agentRunning: false,
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

test("task card shows run button when folder is set", async ({ page }) => {
  writeFileSync(
    DATA_PATH,
    JSON.stringify(
      {
        tasks: [
          {
            id: "test-run",
            title: "Run me",
            description: "Test running claude",
            column: "todo",
            folder: "/tmp",
            comments: [],
            agentRunning: false,
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
  await expect(page.getByText("Run me")).toBeVisible();

  // Play button should be visible on the task card
  const card = page.locator("div", { hasText: "Run me" }).first();
  const playButton = card.locator("button[title='Run Claude agent']");
  await expect(playButton).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/task-with-run-button.png" });
});

test("task panel shows Run button and comments section", async ({ page }) => {
  writeFileSync(
    DATA_PATH,
    JSON.stringify(
      {
        tasks: [
          {
            id: "test-panel-run",
            title: "Panel run test",
            description: "Check panel features",
            column: "todo",
            folder: "/tmp",
            comments: [
              {
                id: "comment-1",
                text: "Agent completed successfully",
                author: "agent",
                createdAt: new Date().toISOString(),
              },
            ],
            agentRunning: false,
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
  await page.getByText("Panel run test").click();
  await expect(page.getByText("Task Details")).toBeVisible();

  const panel = page.locator(".animate-slide-in");

  // Run button in panel
  await expect(panel.locator("button", { hasText: "Run" })).toBeVisible();

  // Comments section
  await expect(panel.getByText("Comments (1)")).toBeVisible();
  await expect(panel.getByText("Claude Agent")).toBeVisible();
  await expect(panel.getByText("Agent completed successfully")).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/task-panel-with-comments.png" });
});

test("task with sessionId shows comment input", async ({ page }) => {
  writeFileSync(
    DATA_PATH,
    JSON.stringify(
      {
        tasks: [
          {
            id: "test-session",
            title: "Session task",
            description: "Has active session",
            column: "testing",
            folder: "/tmp",
            sessionId: "fake-session-id-123",
            comments: [
              {
                id: "comment-1",
                text: "I created the file.",
                author: "agent",
                createdAt: new Date().toISOString(),
              },
            ],
            agentRunning: false,
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
  await page.getByText("Session task").click();
  await expect(page.getByText("Task Details")).toBeVisible();

  const panel = page.locator(".animate-slide-in");

  // Session indicator
  await expect(panel.getByText("Session active")).toBeVisible();

  // Comment input should be visible
  await expect(panel.getByPlaceholder("Add a comment for Claude...")).toBeVisible();
  await expect(panel.locator("button", { hasText: "Send" })).toBeVisible();

  // Send button should be disabled when empty
  await expect(panel.locator("button", { hasText: "Send" })).toBeDisabled();

  // Type a comment
  await panel.getByPlaceholder("Add a comment for Claude...").fill("Please also add tests");
  await expect(panel.locator("button", { hasText: "Send" })).toBeEnabled();

  await page.screenshot({ path: "e2e/screenshots/task-session-comment-input.png" });
});

test("task without sessionId does not show comment input", async ({ page }) => {
  writeFileSync(
    DATA_PATH,
    JSON.stringify(
      {
        tasks: [
          {
            id: "test-no-session",
            title: "No session task",
            description: "Fresh task",
            column: "todo",
            folder: "/tmp",
            comments: [],
            agentRunning: false,
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
  await page.getByText("No session task").click();
  await expect(page.getByText("Task Details")).toBeVisible();

  const panel = page.locator(".animate-slide-in");

  // No session indicator
  await expect(panel.getByText("Session active")).not.toBeVisible();

  // No comment input
  await expect(panel.getByPlaceholder("Add a comment for Claude...")).not.toBeVisible();

  await page.screenshot({ path: "e2e/screenshots/task-no-session-no-comment.png" });
});
