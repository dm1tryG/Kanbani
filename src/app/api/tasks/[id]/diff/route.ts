import { execSync } from "node:child_process";
import { type NextRequest, NextResponse } from "next/server";
import { readBoard } from "@/lib/board";
import { getTaskCwd } from "@/lib/worktree";

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

	const cwd = getTaskCwd(task);

	try {
		// Detect current branch
		const branch = execSync("git rev-parse --abbrev-ref HEAD", {
			cwd,
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
		let diffBase = "main";
		try {
			diff = execSync(`git diff main...HEAD`, {
				cwd,
				encoding: "utf-8",
				maxBuffer: 10 * 1024 * 1024,
			});
		} catch {
			// Try master if main doesn't exist
			try {
				diff = execSync(`git diff master...HEAD`, {
					cwd,
					encoding: "utf-8",
					maxBuffer: 10 * 1024 * 1024,
				});
				diffBase = "master";
			} catch {
				diff = "";
			}
		}

		// If branch diff is empty, fall back to uncommitted changes (staged + unstaged + untracked)
		let uncommitted = false;
		let addedIntentToAdd = false;
		if (!diff.trim()) {
			// Mark untracked files with intent-to-add so git diff can see them
			try {
				const untracked = execSync(`git ls-files --others --exclude-standard`, {
					cwd,
					encoding: "utf-8",
				}).trim();
				if (untracked) {
					execSync("git add -N .", { cwd, stdio: "pipe" });
					addedIntentToAdd = true;
				}
			} catch {
				// ignore
			}

			try {
				diff = execSync(`git diff HEAD`, {
					cwd,
					encoding: "utf-8",
					maxBuffer: 10 * 1024 * 1024,
				});
				uncommitted = true;
			} catch {
				diff = "";
			}
			if (!diff.trim()) {
				try {
					diff = execSync(`git diff --cached`, {
						cwd,
						encoding: "utf-8",
						maxBuffer: 10 * 1024 * 1024,
					});
					uncommitted = true;
				} catch {
					diff = "";
				}
			}
		}

		// Get numstat for precise +/- counts
		let numstat = "";
		const numstatCmd = uncommitted
			? `git diff HEAD --numstat`
			: `git diff ${diffBase}...HEAD --numstat`;
		try {
			numstat = execSync(numstatCmd, {
				cwd,
				encoding: "utf-8",
			});
		} catch {
			if (!uncommitted) {
				try {
					numstat = execSync(`git diff master...HEAD --numstat`, {
						cwd,
						encoding: "utf-8",
					});
				} catch {
					numstat = "";
				}
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

		// Clean up intent-to-add markers
		if (addedIntentToAdd) {
			try {
				execSync("git reset", { cwd, stdio: "pipe" });
			} catch {
				// ignore
			}
		}

		return NextResponse.json({ branch, diff, files, stats, uncommitted });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
