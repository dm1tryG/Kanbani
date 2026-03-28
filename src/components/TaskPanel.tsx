"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import type { Task } from "@/types";
import DiffView from "./DiffView";
import { Badge, Button, Textarea } from "./ui";
import { Input } from "./ui/Input";

type TabId = "overview" | "diff";

interface DiffStats {
	additions: number;
	deletions: number;
	fileCount: number;
}

interface TaskPanelProps {
	task: Task;
	onClose: () => void;
	onUpdate: (id: string, data: { title: string; description: string }) => void;
	onDelete: (id: string) => void;
	onRun: (task: Task) => void;
	onComment: (task: Task, comment: string) => void;
	onMerge: (task: Task) => void;
	onDiscard: (task: Task) => void;
}

export default function TaskPanel({
	task,
	onClose,
	onUpdate,
	onDelete,
	onRun,
	onComment,
	onMerge,
	onDiscard,
}: TaskPanelProps) {
	const [title, setTitle] = useState(task.title);
	const [description, setDescription] = useState(task.description);
	const [commentText, setCommentText] = useState("");
	const [activeTab, setActiveTab] = useState<TabId>("overview");
	const [diffStats, setDiffStats] = useState<DiffStats | null>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const commentsEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setTitle(task.title);
		setDescription(task.description);
	}, [task]);

	const commentsLength = (task.comments || []).length;
	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new comments
	useEffect(() => {
		commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [commentsLength]);

	// Fetch diff stats for the tab badge
	const fetchDiffStats = useCallback(async () => {
		if (!task.folder) return;
		try {
			const res = await fetch(`/api/tasks/${task.id}/diff`);
			if (!res.ok) return;
			const data = await res.json();
			if (data.stats && (data.stats.additions > 0 || data.stats.deletions > 0)) {
				setDiffStats({
					additions: data.stats.additions,
					deletions: data.stats.deletions,
					fileCount: data.files?.length || 0,
				});
			} else {
				setDiffStats(null);
			}
		} catch {
			// Silently fail — stats are optional
		}
	}, [task.id, task.folder]);

	useEffect(() => {
		fetchDiffStats();
	}, [fetchDiffStats]);

	// Re-fetch diff stats when agent finishes running
	useEffect(() => {
		if (!task.agentRunning) {
			fetchDiffStats();
		}
	}, [task.agentRunning, fetchDiffStats]);

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		function handleClickOutside(e: MouseEvent) {
			if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
				onClose();
			}
		}
		document.addEventListener("keydown", handleKey);
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("keydown", handleKey);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [onClose]);

	function handleSave() {
		if (!title.trim()) return;
		onUpdate(task.id, { title, description });
	}

	function handleSendComment() {
		const text = commentText.trim();
		if (!text) return;
		setCommentText("");
		onComment(task, text);
	}

	function handleCommentKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			handleSendComment();
		}
	}

	const canRun = !!task.folder && !task.agentRunning && !task.sessionId;
	const canComment = !!task.folder && !task.agentRunning && !!task.sessionId;
	const comments = task.comments || [];

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			<div className="absolute inset-0 bg-overlay animate-fade-in" />
			<div
				ref={panelRef}
				className="relative w-[680px] max-w-full bg-surface h-full shadow-panel flex flex-col animate-slide-in"
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-border">
					<h2 className="text-heading font-bold text-foreground">Task Details</h2>
					<div className="flex items-center gap-2.5">
						{task.agentRunning && (
							<Badge variant="warning" className="px-2.5 py-1">
								Agent running...
							</Badge>
						)}
						{canRun && (
							<Button
								variant="success"
								size="sm"
								onClick={() => onRun(task)}
								title="Run Claude agent"
								className="flex items-center gap-1.5"
							>
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-label="Run"
								>
									<path d="M8 5v14l11-7z" />
								</svg>
								Run
							</Button>
						)}
						{task.worktreePath && !task.agentRunning && (
							<>
								<Button variant="accent" size="sm" onClick={() => onMerge(task)} className="flex items-center gap-1.5">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-label="Merge">
										<circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 9v3a6 6 0 0 0 6 6h3" />
									</svg>
									Merge
								</Button>
								<Button variant="ghost" size="sm" onClick={() => onDiscard(task)}>
									Discard
								</Button>
							</>
						)}
						<button
							onClick={onClose}
							type="button"
							className="w-8 h-8 flex items-center justify-center rounded-lg text-faint hover:text-foreground hover:bg-surface-dim transition-all duration-150 cursor-pointer"
						>
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								aria-label="Close"
							>
								<path d="M18 6L6 18M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				{/* Tabs */}
				<div className="flex items-center gap-0 px-6 border-b border-border bg-surface">
					<button
						type="button"
						onClick={() => setActiveTab("overview")}
						className={`px-4 py-2.5 text-body font-semibold border-b-2 transition-colors cursor-pointer ${
							activeTab === "overview"
								? "border-primary text-primary"
								: "border-transparent text-muted hover:text-foreground"
						}`}
					>
						Overview
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("diff")}
						className={`px-4 py-2.5 text-body font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
							activeTab === "diff"
								? "border-primary text-primary"
								: "border-transparent text-muted hover:text-foreground"
						}`}
					>
						Diff
						{diffStats && (
							<span className="flex items-center gap-1 text-caption font-mono">
								<span className="text-success">+{diffStats.additions}</span>
								<span className="text-destructive">-{diffStats.deletions}</span>
							</span>
						)}
					</button>
				</div>

				{/* Tab Content */}
				{activeTab === "overview" ? (
					<>
						{/* Content */}
						<div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
							<Input
								id="task-title"
								label="Title"
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								onBlur={handleSave}
							/>

							<Textarea
								id="task-desc"
								label="Description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								onBlur={handleSave}
								rows={4}
							/>

							{task.folder && (
								<div>
									<span className="block text-body font-semibold text-foreground mb-1.5">
										Project
									</span>
									<div className="flex items-center gap-2.5">
										<Badge>{task.folder.split("/").filter(Boolean).pop() || task.folder}</Badge>
										<span
											className="text-caption text-faint truncate font-mono"
											title={task.folder}
										>
											{task.folder}
										</span>
									</div>
								</div>
							)}

							<div className="text-caption text-faint flex items-center gap-3 flex-wrap">
								<span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
								{task.sessionId && (
									<span className="flex items-center gap-1 text-success" title={task.sessionId}>
										<span className="w-1.5 h-1.5 rounded-full bg-success" />
										Session active
									</span>
								)}
								{task.worktreePath && (
									<span className="flex items-center gap-1 text-accent" title={task.worktreePath}>
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-label="Worktree">
											<path d="M6 3v12" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="6" r="3" /><path d="M6 9a9 9 0 0 0 9 9" />
										</svg>
										Worktree
									</span>
								)}
								{task.branch && (
									<span className="font-mono text-code bg-surface-alt px-1.5 py-0.5 rounded">
										{task.branch}
									</span>
								)}
							</div>

							{/* Comments Section */}
							{comments.length > 0 && (
								<div>
									<h3 className="text-body font-semibold text-foreground mb-3">
										Comments ({comments.length})
									</h3>
									<div className="space-y-2.5">
										{comments.map((comment) => (
											<div
												key={comment.id}
												className={`text-caption rounded-lg p-3.5 ${
													comment.author === "agent"
														? "bg-accent-light border border-accent/10"
														: "bg-surface-alt border border-border"
												}`}
											>
												<div className="flex items-center justify-between mb-1.5">
													<span
														className={`font-semibold ${
															comment.author === "agent" ? "text-accent" : "text-foreground"
														}`}
													>
														{comment.author === "agent" ? "Claude Agent" : "User"}
													</span>
													<span className="text-faint">
														{new Date(comment.createdAt).toLocaleString()}
													</span>
												</div>
												{comment.author === "agent" ? (
													<div className="prose-comment max-h-60 overflow-y-auto text-muted text-caption leading-relaxed">
														<Markdown>{comment.text}</Markdown>
													</div>
												) : (
													<pre className="whitespace-pre-wrap break-words text-muted font-mono text-code max-h-60 overflow-y-auto leading-relaxed">
														{comment.text}
													</pre>
												)}
											</div>
										))}
										<div ref={commentsEndRef} />
									</div>
								</div>
							)}
						</div>

						{/* Comment Input */}
						{canComment && (
							<div className="px-6 py-4 border-t border-border bg-surface-alt">
								<div className="flex items-stretch gap-2.5">
									<textarea
										value={commentText}
										onChange={(e) => setCommentText(e.target.value)}
										onKeyDown={handleCommentKeyDown}
										placeholder="Add a comment for Claude..."
										rows={1}
										className="flex-1 px-3 py-2.5 bg-surface border border-border-strong rounded-md text-body text-foreground placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-none"
									/>
									<Button
										variant="accent"
										onClick={handleSendComment}
										disabled={!commentText.trim()}
									>
										Send
									</Button>
								</div>
								<p className="text-caption text-faint mt-2">
									Cmd+Enter to send. Claude will resume with full context.
								</p>
							</div>
						)}

						{/* Footer */}
						<div className="px-6 py-4 border-t border-border">
							<Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>
								Delete task
							</Button>
						</div>
					</>
				) : (
					/* Diff Tab */
					<div className="flex-1 overflow-hidden flex flex-col">
						<DiffView task={task} />
					</div>
				)}
			</div>
		</div>
	);
}
