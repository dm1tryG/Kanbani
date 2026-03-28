import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const WORKTREES_DIR = ".kanbani-worktrees";

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 40);
}

/** Directory that holds all worktrees for a given project folder. */
function worktreesRoot(projectFolder: string): string {
	return join(dirname(projectFolder), WORKTREES_DIR);
}

/** Create a git worktree for a task. Returns { worktreePath, branch }. */
export function createWorktree(
	projectFolder: string,
	taskId: string,
	taskTitle: string,
): { worktreePath: string; branch: string } {
	const slug = slugify(taskTitle) || "task";
	const shortId = taskId.split("-")[0];
	const branch = `task/${slug}-${shortId}`;
	const worktreePath = join(worktreesRoot(projectFolder), `${slug}-${shortId}`);

	// Ensure we're branching off main/master
	let baseBranch = "main";
	try {
		execSync("git rev-parse --verify main", { cwd: projectFolder, stdio: "pipe" });
	} catch {
		baseBranch = "master";
	}

	// Create worktree with a new branch
	execSync(`git worktree add -b "${branch}" "${worktreePath}" "${baseBranch}"`, {
		cwd: projectFolder,
		encoding: "utf-8",
		stdio: "pipe",
	});

	return { worktreePath, branch };
}

/** Merge the task branch into main (locally) and clean up the worktree. */
export function mergeAndCleanup(
	projectFolder: string,
	branch: string,
	worktreePath: string,
): { merged: boolean; error?: string } {
	let baseBranch = "main";
	try {
		execSync("git rev-parse --verify main", { cwd: projectFolder, stdio: "pipe" });
	} catch {
		baseBranch = "master";
	}

	try {
		// Auto-commit any uncommitted changes in the worktree
		try {
			const status = execSync("git status --porcelain", {
				cwd: worktreePath,
				encoding: "utf-8",
				stdio: "pipe",
			}).trim();
			if (status) {
				execSync("git add -A", { cwd: worktreePath, stdio: "pipe" });
				execSync('git commit -m "chore: auto-commit uncommitted changes"', {
					cwd: worktreePath,
					encoding: "utf-8",
					stdio: "pipe",
				});
			}
		} catch {
			// ignore — worktree may not exist
		}

		// Check if there are any commits to merge
		const diffCount = execSync(`git rev-list --count ${baseBranch}..${branch}`, {
			cwd: projectFolder,
			encoding: "utf-8",
			stdio: "pipe",
		}).trim();

		if (diffCount === "0") {
			// No commits — just clean up
			cleanupWorktree(projectFolder, branch, worktreePath);
			return { merged: true };
		}

		// Ensure main repo is on base branch before merging
		const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
			cwd: projectFolder,
			encoding: "utf-8",
			stdio: "pipe",
		}).trim();

		if (currentBranch !== baseBranch) {
			execSync(`git checkout "${baseBranch}"`, {
				cwd: projectFolder,
				encoding: "utf-8",
				stdio: "pipe",
			});
		}

		// Merge the branch into main
		execSync(`git merge --no-ff "${branch}" -m "Merge ${branch}"`, {
			cwd: projectFolder,
			encoding: "utf-8",
			stdio: "pipe",
		});

		// Cleanup
		cleanupWorktree(projectFolder, branch, worktreePath);
		return { merged: true };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		return { merged: false, error: msg };
	}
}

/** Remove the worktree and delete the branch. */
export function cleanupWorktree(
	projectFolder: string,
	branch: string,
	worktreePath: string,
): void {
	// Remove worktree
	try {
		if (existsSync(worktreePath)) {
			execSync(`git worktree remove "${worktreePath}" --force`, {
				cwd: projectFolder,
				encoding: "utf-8",
				stdio: "pipe",
			});
		}
	} catch {
		// If worktree remove fails, prune
		try {
			execSync("git worktree prune", { cwd: projectFolder, stdio: "pipe" });
		} catch {
			// ignore
		}
	}

	// Delete branch
	try {
		execSync(`git branch -D "${branch}"`, {
			cwd: projectFolder,
			encoding: "utf-8",
			stdio: "pipe",
		});
	} catch {
		// Branch may already be deleted
	}
}

/** Get the effective working directory for a task (worktree or original folder). */
export function getTaskCwd(task: { folder: string; worktreePath?: string }): string {
	if (task.worktreePath && existsSync(task.worktreePath)) {
		return task.worktreePath;
	}
	return task.folder;
}
