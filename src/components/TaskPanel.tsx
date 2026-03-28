"use client";

import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import type { Task } from "@/types";
import { Badge, Button, Textarea } from "./ui";
import { Input } from "./ui/Input";

interface TaskPanelProps {
	task: Task;
	onClose: () => void;
	onUpdate: (id: string, data: { title: string; description: string }) => void;
	onDelete: (id: string) => void;
	onRun: (task: Task) => void;
	onComment: (task: Task, comment: string) => void;
}

export default function TaskPanel({
	task,
	onClose,
	onUpdate,
	onDelete,
	onRun,
	onComment,
}: TaskPanelProps) {
	const [title, setTitle] = useState(task.title);
	const [description, setDescription] = useState(task.description);
	const [commentText, setCommentText] = useState("");
	const panelRef = useRef<HTMLDivElement>(null);
	const commentsEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setTitle(task.title);
		setDescription(task.description);
	}, [task]);

	useEffect(() => {
		commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [task.comments]);

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

	const canRun = !!task.folder && !task.agentRunning;
	const canComment = !!task.folder && !task.agentRunning && !!task.sessionId;
	const comments = task.comments || [];

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			<div className="absolute inset-0 bg-overlay animate-fade-in" />
			<div
				ref={panelRef}
				className="relative w-[520px] max-w-full bg-surface h-full shadow-panel flex flex-col animate-slide-in"
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
							>
								<path d="M18 6L6 18M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

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
							<span className="block text-body font-semibold text-foreground mb-1.5">Project</span>
							<div className="flex items-center gap-2.5">
								<Badge>{task.folder.split("/").filter(Boolean).pop() || task.folder}</Badge>
								<span className="text-caption text-faint truncate font-mono" title={task.folder}>
									{task.folder}
								</span>
							</div>
						</div>
					)}

					<div className="text-caption text-faint flex items-center gap-3">
						<span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
						{task.sessionId && (
							<span className="flex items-center gap-1 text-success" title={task.sessionId}>
								<span className="w-1.5 h-1.5 rounded-full bg-success" />
								Session active
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
							<Button variant="accent" onClick={handleSendComment} disabled={!commentText.trim()}>
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
			</div>
		</div>
	);
}
