import { execSync } from "node:child_process";
import { type NextRequest, NextResponse } from "next/server";
import { readBoard } from "@/lib/board";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const board = await readBoard();
	const task = board.tasks.find((t) => t.id === id);
	if (!task) {
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	}

	if (!task.folder) {
		return NextResponse.json({ error: "Task has no folder" }, { status: 400 });
	}

	try {
		// Detect current branch
		const branch = execSync("git rev-parse --abbrev-ref HEAD", {
			cwd: task.folder,
			encoding: "utf-8",
		}).trim();

		// If on main, there's nothing to diff
		if (branch === "main" || branch === "master") {
			return NextResponse.json({
				branch,
				diff: "",
				files: [],
				stats: { additions: 0, deletions: 0 },
			});
		}

		// Get the diff against main
		let diff = "";
		try {
			diff = execSync(`git diff main...HEAD`, {
				cwd: task.folder,
				encoding: "utf-8",
				maxBuffer: 10 * 1024 * 1024,
			});
		} catch {
			// Try master if main doesn't exist
			try {
				diff = execSync(`git diff master...HEAD`, {
					cwd: task.folder,
					encoding: "utf-8",
					maxBuffer: 10 * 1024 * 1024,
				});
			} catch {
				diff = "";
			}
		}

		// Get numstat for precise +/- counts
		let numstat = "";
		try {
			numstat = execSync(`git diff main...HEAD --numstat`, {
				cwd: task.folder,
				encoding: "utf-8",
			});
		} catch {
			try {
				numstat = execSync(`git diff master...HEAD --numstat`, {
					cwd: task.folder,
					encoding: "utf-8",
				});
			} catch {
				numstat = "";
			}
		}

		// Parse numstat into file list with stats
		const files = numstat
			.trim()
			.split("\n")
			.filter(Boolean)
			.map((line) => {
				const [add, del, file] = line.split("\t");
				return {
					path: file,
					additions: add === "-" ? 0 : Number.parseInt(add, 10),
					deletions: del === "-" ? 0 : Number.parseInt(del, 10),
				};
			});

		const stats = files.reduce(
			(acc, f) => ({
				additions: acc.additions + f.additions,
				deletions: acc.deletions + f.deletions,
			}),
			{ additions: 0, deletions: 0 },
		);

		return NextResponse.json({ branch, diff, files, stats });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
