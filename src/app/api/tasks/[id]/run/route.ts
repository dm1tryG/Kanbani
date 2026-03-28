import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import type { BoardData } from "@/types";

const DATA_PATH = join(process.cwd(), "data", "board.json");

async function readBoard(): Promise<BoardData> {
	const raw = await readFile(DATA_PATH, "utf-8");
	return JSON.parse(raw);
}

async function writeBoard(data: BoardData): Promise<void> {
	await writeFile(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

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

	await writeBoard(board);

	// Build CLI args
	const isResume = !!task.sessionId && !!userComment;
	const args = ["--print", "--output-format", "json", "--dangerously-skip-permissions"];
	if (isResume) {
		args.push("--resume", task.sessionId as string);
	}

	// Build prompt
	const prompt = isResume
		? userComment
		: [task.title, task.description].filter(Boolean).join("\n\n");

	// Spawn claude CLI
	const child = spawn("claude", args, {
		cwd: task.folder,
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
