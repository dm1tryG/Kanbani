import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import type { BoardData, ColumnId, Task } from "@/types";

const DATA_PATH = join(process.cwd(), "data", "board.json");

async function readBoard(): Promise<BoardData> {
	const raw = await readFile(DATA_PATH, "utf-8");
	return JSON.parse(raw);
}

async function writeBoard(data: BoardData): Promise<void> {
	await writeFile(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

export async function GET() {
	const board = await readBoard();
	if (!board.projects) board.projects = [];
	for (const task of board.tasks) {
		if (!task.comments) task.comments = [];
		if (task.agentRunning === undefined) task.agentRunning = false;
	}
	return NextResponse.json(board);
}

export async function POST(request: Request) {
	const body = await request.json();
	const { title, description, folder } = body as {
		title: string;
		description: string;
		folder: string;
	};

	if (!title?.trim()) {
		return NextResponse.json({ error: "Title is required" }, { status: 400 });
	}
	if (!folder?.trim()) {
		return NextResponse.json({ error: "Folder is required" }, { status: 400 });
	}

	const board = await readBoard();
	if (!board.projects) board.projects = [];

	const trimmedFolder = folder.trim();
	if (!board.projects.includes(trimmedFolder)) {
		board.projects.push(trimmedFolder);
	}

	const task: Task = {
		id: uuidv4(),
		title: title.trim(),
		description: description?.trim() || "",
		column: "todo",
		folder: trimmedFolder,
		comments: [],
		agentRunning: false,
		createdAt: new Date().toISOString(),
	};
	board.tasks.push(task);
	await writeBoard(board);

	return NextResponse.json(task, { status: 201 });
}

export async function PATCH(request: Request) {
	const body = await request.json();
	const { id, column } = body as { id: string; column: ColumnId };

	const board = await readBoard();
	const task = board.tasks.find((t) => t.id === id);
	if (!task) {
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	}

	task.column = column;
	await writeBoard(board);

	return NextResponse.json(task);
}
