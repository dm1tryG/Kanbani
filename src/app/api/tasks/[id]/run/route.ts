import { execSync, spawn } from "node:child_process";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { readBoard, writeBoard } from "@/lib/board";
import { createWorktree, getTaskCwd } from "@/lib/worktree";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const body = await request.json().catch(() => ({}));
	const userComment: string | undefined = body.comment;

	const board = await readBoard();
	const task = board.tasks.find((t) => t.id === id);
	if (!task) {
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	}

	if (!task.folder) {
		return NextResponse.json({ error: "Task has no folder" }, { status: 400 });
	}

	if (task.agentRunning) {
		return NextResponse.json({ error: "Agent is already running" }, { status: 409 });
	}

	// Move to inprogress and mark as running
	task.column = "inprogress";
	task.agentRunning = true;
	if (!task.comments) task.comments = [];

	// If user sent a comment, add it before running
	if (userComment) {
		task.comments.push({
			id: uuidv4(),
			text: userComment,
			author: "user",
			createdAt: new Date().toISOString(),
		});
	}

	// Create worktree for first run (not resume)
	const isResume = !!task.sessionId && !!userComment;
	if (!isResume && !task.worktreePath) {
		try {
			const { worktreePath, branch } = createWorktree(task.folder, task.id, task.title);
			task.worktreePath = worktreePath;
			task.branch = branch;
		} catch (e) {
			task.agentRunning = false;
			task.column = "todo";
			const msg = e instanceof Error ? e.message : String(e);
			task.comments.push({
				id: uuidv4(),
				text: `Failed to create worktree:\n${msg}`,
				author: "agent",
				createdAt: new Date().toISOString(),
			});
			await writeBoard(board);
			return NextResponse.json({ error: "Failed to create worktree" }, { status: 500 });
		}
	}

	await writeBoard(board);

	// Determine working directory — use worktree if available
	const cwd = getTaskCwd(task);

	// Build CLI args
	const args = ["--print", "--output-format", "json", "--dangerously-skip-permissions"];
	if (isResume) {
		args.push("--resume", task.sessionId as string);
	}

	// Build prompt
	const prompt = isResume
		? userComment
		: [task.title, task.description].filter(Boolean).join("\n\n");

	// Spawn claude CLI in worktree directory
	const child = spawn("claude", args, {
		cwd,
		shell: true,
		stdio: ["pipe", "pipe", "pipe"],
	});

	child.stdin.write(prompt);
	child.stdin.end();

	let stdout = "";
	let stderr = "";

	child.stdout.on("data", (data: Buffer) => {
		stdout += data.toString();
	});

	child.stderr.on("data", (data: Buffer) => {
		stderr += data.toString();
	});

	child.on("close", async (code) => {
		try {
			const board = await readBoard();
			const task = board.tasks.find((t) => t.id === id);
			if (!task) return;

			if (!task.comments) task.comments = [];
			task.agentRunning = false;

			if (code === 0) {
				task.column = "testing";

				// Detect current branch in worktree
				const taskCwd = getTaskCwd(task);
				try {
					const branch = execSync("git rev-parse --abbrev-ref HEAD", {
						cwd: taskCwd,
						encoding: "utf-8",
					}).trim();
					task.branch = branch;
				} catch {
					// Not a git repo or git not available — skip
				}

				// Parse JSON output to extract result and session_id
				let resultText = stdout.trim() || "(no output)";
				try {
					const parsed = JSON.parse(stdout);
					resultText = parsed.result || resultText;
					if (parsed.session_id) {
						task.sessionId = parsed.session_id;
					}
				} catch {
					// Not JSON — use raw output
				}

				task.comments.push({
					id: uuidv4(),
					text: resultText,
					author: "agent",
					createdAt: new Date().toISOString(),
				});
			} else {
				task.column = "todo";
				const errorOutput = stderr.trim() || stdout.trim() || `Process exited with code ${code}`;
				task.comments.push({
					id: uuidv4(),
					text: `Error (exit code ${code}):\n${errorOutput}`,
					author: "agent",
					createdAt: new Date().toISOString(),
				});
			}

			await writeBoard(board);
		} catch (e) {
			console.error("Failed to update task after agent run:", e);
		}
	});

	return NextResponse.json({ ok: true, message: isResume ? "Agent resumed" : "Agent started" });
}
