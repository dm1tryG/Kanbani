import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import type { BoardData } from "@/types";

const DATA_PATH = join(process.cwd(), "data", "board.json");

async function readBoard(): Promise<BoardData> {
	const raw = await readFile(DATA_PATH, "utf-8");
	return JSON.parse(raw);
}

async function writeBoard(data: BoardData): Promise<void> {
	await writeFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const body = await request.json();
	const { title, description } = body as {
		title: string;
		description: string;
	};

	const board = await readBoard();
	const task = board.tasks.find((t) => t.id === id);
	if (!task) {
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	}

	if (title !== undefined) task.title = title.trim();
	if (description !== undefined) task.description = description.trim();
	await writeBoard(board);

	return NextResponse.json(task);
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const board = await readBoard();
	const idx = board.tasks.findIndex((t) => t.id === id);
	if (idx === -1) {
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	}

	board.tasks.splice(idx, 1);
	await writeBoard(board);

	return NextResponse.json({ ok: true });
}
