import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "@playwright/test";

const DATA_PATH = join(process.cwd(), "data", "board.test.json");

const demoBoardData = {
	tasks: [
		{
			id: "demo-001",
			title: "Add WebSocket live updates",
			description:
				"Real-time board sync when Claude agent completes work. Push task status changes via WebSocket so the UI updates instantly without polling.",
			column: "todo",
			folder: "/Users/dev/projects/kanbani",
			comments: [],
			agentRunning: false,
			createdAt: "2026-03-29T08:00:00.000Z",
		},
		{
			id: "demo-002",
			title: "GitHub PR integration",
			description:
				"Auto-create PRs when tasks move to Testing. Link PR status back to the board with merge/close actions.",
			column: "todo",
			folder: "/Users/dev/projects/kanbani",
			comments: [],
			agentRunning: false,
			createdAt: "2026-03-29T08:01:00.000Z",
		},
		{
			id: "demo-003",
			title: "Implement dark mode",
			description: "Add dark variant of the Warm Workshop theme with toggle in header.",
			column: "inprogress",
			folder: "/Users/dev/projects/webapp",
			comments: [
				{
					id: "c-001",
					text: "Working on the color token mappings. The terracotta primary works beautifully against dark surfaces — using `#1a1816` as the base.",
					author: "agent",
					createdAt: "2026-03-29T09:30:00.000Z",
				},
			],
			agentRunning: true,
			createdAt: "2026-03-29T07:00:00.000Z",
			branch: "feat/dark-mode",
			sessionId: "demo-session-1",
		},
		{
			id: "demo-004",
			title: "Fix drag-and-drop on mobile",
			description: "Touch events not registering properly on iOS Safari. Need to add touch handlers to dnd-kit config.",
			column: "inprogress",
			folder: "/Users/dev/projects/kanbani",
			comments: [
				{
					id: "c-002",
					text: "Added `TouchSensor` to the sensor array and configured activation constraints. Testing on iOS 18 simulator now.",
					author: "agent",
					createdAt: "2026-03-29T10:00:00.000Z",
				},
			],
			agentRunning: false,
			createdAt: "2026-03-29T06:00:00.000Z",
			branch: "fix/mobile-dnd",
			sessionId: "demo-session-2",
		},
		{
			id: "demo-005",
			title: "Add task priority levels",
			description: "Support High/Medium/Low priority with color-coded badges and sort within columns.",
			column: "testing",
			folder: "/Users/dev/projects/webapp",
			comments: [
				{
					id: "c-003",
					text: "Implementation complete. Added priority field, badge variants, and column sorting. Ready for review.",
					author: "agent",
					createdAt: "2026-03-29T08:45:00.000Z",
				},
			],
			agentRunning: false,
			createdAt: "2026-03-28T14:00:00.000Z",
			branch: "feat/task-priorities",
			sessionId: "demo-session-3",
		},
		{
			id: "demo-006",
			title: "Diff tab in task panel",
			description: "Show git diff with syntax highlighting using react-diff-view. Unified view with +/- line stats.",
			column: "done",
			folder: "/Users/dev/projects/kanbani",
			comments: [
				{
					id: "c-004",
					text: "Shipped! The diff tab shows `main...branch` with full syntax highlighting. Split view toggle works too.",
					author: "agent",
					createdAt: "2026-03-28T19:04:15.796Z",
				},
			],
			agentRunning: false,
			createdAt: "2026-03-28T12:00:00.000Z",
			branch: "feat/diff-view",
			sessionId: "demo-session-4",
		},
		{
			id: "demo-007",
			title: "Worktree per task",
			description:
				"Auto-create git worktree with dedicated branch per task. Enables parallel Claude sessions without conflicts.",
			column: "done",
			folder: "/Users/dev/projects/kanbani",
			comments: [],
			agentRunning: false,
			createdAt: "2026-03-27T10:00:00.000Z",
		},
		{
			id: "demo-008",
			title: "Setup CI pipeline",
			description: "GitHub Actions for lint, test, and build on every PR.",
			column: "done",
			folder: "/Users/dev/projects/kanbani",
			comments: [],
			agentRunning: false,
			createdAt: "2026-03-26T10:00:00.000Z",
		},
	],
	projects: ["/Users/dev/projects/kanbani", "/Users/dev/projects/webapp"],
};

test("capture demo board screenshot", async ({ browser }) => {
	writeFileSync(DATA_PATH, JSON.stringify(demoBoardData, null, 2) + "\n");

	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		deviceScaleFactor: 2,
	});
	const page = await context.newPage();
	await page.goto("/");

	// Wait for board to render
	await page.waitForSelector("h1");
	await page.waitForTimeout(500);

	await page.screenshot({
		path: "e2e/screenshots/demo-board.png",
		fullPage: false,
	});
});
