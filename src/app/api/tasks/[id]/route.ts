import { type NextRequest, NextResponse } from "next/server";
import { readBoard, writeBoard } from "@/lib/board";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const body = await request.json();
	const { title, description, folder } = body as {
		title: string;
		description: string;
		folder: string;
	};

	const board = await readBoard();
	const task = board.tasks.find((t) => t.id === id);
	if (!task) {
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	}

	if (title !== undefined) task.title = title.trim();
	if (description !== undefined) task.description = description.trim();
	if (folder !== undefined) task.folder = folder.trim();
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
