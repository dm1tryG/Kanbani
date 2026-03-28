"use client";

import { useCallback, useEffect, useState } from "react";
import { Diff, Hunk, parseDiff } from "react-diff-view";
import "react-diff-view/style/index.css";
import type { Task } from "@/types";
import { Badge, Button } from "./ui";

interface DiffFile {
	path: string;
	additions: number;
	deletions: number;
}

interface DiffData {
	branch: string;
	diff: string;
	files: DiffFile[];
	stats: { additions: number; deletions: number };
	uncommitted?: boolean;
}

type ViewType = "unified" | "split";

interface DiffViewProps {
	task: Task;
}

export default function DiffView({ task }: DiffViewProps) {
	const [data, setData] = useState<DiffData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [viewType, setViewType] = useState<ViewType>("split");
	const [selectedFile, setSelectedFile] = useState<string | null>(null);

	const fetchDiff = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/tasks/${task.id}/diff`);
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Failed to fetch diff");
			}
			const d: DiffData = await res.json();
			setData(d);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	}, [task.id]);

	useEffect(() => {
		fetchDiff();
	}, [fetchDiff]);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-16 text-muted text-body">
				<svg
					className="animate-spin mr-2 h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					aria-label="Loading"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					/>
				</svg>
				Loading diff...
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-16 gap-3">
				<span className="text-destructive text-body">{error}</span>
				<Button variant="secondary" size="sm" onClick={fetchDiff}>
					Retry
				</Button>
			</div>
		);
	}

	if (!data?.diff) {
		return (
			<div className="flex flex-col items-center justify-center py-16 gap-2 text-muted">
				<svg
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					aria-label="No changes"
				>
					<path d="M9 12h6M12 9v6" strokeLinecap="round" />
					<circle cx="12" cy="12" r="10" />
				</svg>
				<span className="text-body">No changes detected</span>
				<span className="text-caption text-faint">
					{data?.branch === "main" || data?.branch === "master"
						? "Task is on the main branch"
						: `Branch: ${data?.branch}`}
				</span>
			</div>
		);
	}

	const parsedFiles = parseDiff(data.diff);
	const filesToShow = selectedFile
		? parsedFiles.filter((f) => getFilePath(f) === selectedFile)
		: parsedFiles;

	return (
		<div className="flex flex-col h-full">
			{/* Toolbar */}
			<div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-alt">
				<div className="flex items-center gap-2">
					<Badge variant="neutral">{data.branch}</Badge>
<span className="text-caption text-faint">
						{data.files.length} file{data.files.length !== 1 ? "s" : ""}
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={() => setViewType("unified")}
						className={`px-2.5 py-1 text-caption rounded-md transition-colors cursor-pointer ${
							viewType === "unified"
								? "bg-primary text-white font-semibold"
								: "text-muted hover:bg-surface-dim"
						}`}
					>
						Unified
					</button>
					<button
						type="button"
						onClick={() => setViewType("split")}
						className={`px-2.5 py-1 text-caption rounded-md transition-colors cursor-pointer ${
							viewType === "split"
								? "bg-primary text-white font-semibold"
								: "text-muted hover:bg-surface-dim"
						}`}
					>
						Split
					</button>
					<div className="w-px h-4 bg-border mx-1" />
					<Button variant="ghost" size="sm" onClick={fetchDiff} title="Refresh diff">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							aria-label="Refresh"
						>
							<path d="M1 4v6h6M23 20v-6h-6" />
							<path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
						</svg>
					</Button>
				</div>
			</div>

			{/* File tree + diff */}
			<div className="flex flex-1 overflow-hidden">
				{/* File sidebar */}
				<div className="w-56 min-w-56 border-r border-border overflow-y-auto bg-surface">
					<div className="py-2">
						<button
							type="button"
							onClick={() => setSelectedFile(null)}
							className={`w-full text-left px-3 py-1.5 text-caption transition-colors cursor-pointer ${
								!selectedFile
									? "bg-primary-light text-primary font-semibold"
									: "text-muted hover:bg-surface-dim"
							}`}
						>
							All files ({data.files.length})
						</button>
						{data.files.map((file) => (
							<button
								key={file.path}
								type="button"
								onClick={() => setSelectedFile(file.path === selectedFile ? null : file.path)}
								className={`w-full text-left px-3 py-1.5 text-caption transition-colors flex items-center gap-1.5 cursor-pointer ${
									selectedFile === file.path
										? "bg-primary-light text-primary font-semibold"
										: "text-muted hover:bg-surface-dim"
								}`}
							>
								<span className="truncate flex-1 font-mono">{file.path.split("/").pop()}</span>
								<span className="flex items-center gap-1 shrink-0">
									{file.additions > 0 && <span className="text-success">+{file.additions}</span>}
									{file.deletions > 0 && (
										<span className="text-destructive">-{file.deletions}</span>
									)}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Diff content */}
				<div className="flex-1 overflow-auto diff-container">
					{filesToShow.map((file) => {
						const filePath = getFilePath(file);
						const fileStats = data.files.find((f) => f.path === filePath);
						return (
							<div key={filePath} className="border-b border-border last:border-b-0">
								{/* File header */}
								<div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 bg-surface-alt border-b border-border">
									<span className="font-mono text-caption text-foreground font-semibold truncate">
										{filePath}
									</span>
									{fileStats && (
										<span className="flex items-center gap-1.5 text-caption shrink-0">
											<span className="text-success font-semibold">+{fileStats.additions}</span>
											<span className="text-destructive font-semibold">-{fileStats.deletions}</span>
										</span>
									)}
								</div>
								<Diff viewType={viewType} diffType={file.type} hunks={file.hunks}>
									{(hunks) => hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)}
								</Diff>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function getFilePath(file: ReturnType<typeof parseDiff>[number]): string {
	return file.newPath === "/dev/null" ? file.oldPath : file.newPath;
}
