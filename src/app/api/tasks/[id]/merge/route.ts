import { type NextRequest, NextResponse } from "next/server";
import { readBoard, writeBoard } from "@/lib/board";
import { cleanupWorktree, mergeAndCleanup } from "@/lib/worktree";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const board = await readBoard();
	const task = board.tasks.find((t) => t.id === id);
	if (!task) {
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	}

	if (!task.branch || !task.worktreePath) {
		return NextResponse.json({ error: "No worktree to merge" }, { status: 400 });
	}

	if (task.agentRunning) {
		return NextResponse.json({ error: "Agent is still running" }, { status: 409 });
	}

	const { merged, error } = mergeAndCleanup(task.folder, task.branch, task.worktreePath);

	if (!merged) {
		return NextResponse.json({ error: `Merge failed: ${error}` }, { status: 409 });
	}

	// Move to done and clear worktree state
	task.column = "done";
	task.worktreePath = undefined;
	// Keep branch name for reference but it's been deleted
	await writeBoard(board);

	return NextResponse.json({ ok: true, message: `Merged ${task.branch} into main` });
}

/** Discard worktree without merging. */
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	const board = await readBoard();
	const task = board.tasks.find((t) => t.id === id);
	if (!task) {
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	}

	if (!task.branch || !task.worktreePath) {
		return NextResponse.json({ error: "No worktree to discard" }, { status: 400 });
	}

	cleanupWorktree(task.folder, task.branch, task.worktreePath);

	task.worktreePath = undefined;
	task.branch = undefined;
	task.column = "todo";
	await writeBoard(board);

	return NextResponse.json({ ok: true, message: "Worktree discarded" });
}
