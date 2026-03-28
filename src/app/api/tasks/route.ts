import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { readBoard, writeBoard } from "@/lib/board";
import type { ColumnId, Task } from "@/types";

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
