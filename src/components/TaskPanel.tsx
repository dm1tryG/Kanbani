"use client";

import { useEffect, useRef, useState } from "react";
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
			<div className="absolute inset-0 bg-black/30" />
			<div
				ref={panelRef}
				className="relative w-[480px] max-w-full bg-surface h-full shadow-xl flex flex-col animate-slide-in"
			>
				<div className="flex items-center justify-between p-4 border-b border-border">
					<h2 className="text-heading font-semibold text-text-primary">Task Details</h2>
					<div className="flex items-center gap-2">
						{task.agentRunning && (
							<Badge variant="warning" className="px-2 py-1">
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
							className="text-text-disabled hover:text-text-secondary text-xl leading-none cursor-pointer"
						>
							&times;
						</button>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-4 space-y-4">
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
							<span className="block text-body font-medium text-text-primary mb-1">Project</span>
							<div className="flex items-center gap-2">
								<Badge>{task.folder.split("/").filter(Boolean).pop() || task.folder}</Badge>
								<span className="text-caption text-text-disabled truncate" title={task.folder}>
									{task.folder}
								</span>
							</div>
						</div>
					)}

					<div className="text-caption text-text-disabled">
						Created: {new Date(task.createdAt).toLocaleDateString()}
						{task.sessionId && (
							<span className="ml-2 text-success" title={task.sessionId}>
								Session active
							</span>
						)}
					</div>

					{/* Comments Section */}
					{comments.length > 0 && (
						<div>
							<h3 className="text-body font-medium text-text-primary mb-2">
								Comments ({comments.length})
							</h3>
							<div className="space-y-2">
								{comments.map((comment) => (
									<div
										key={comment.id}
										className={`text-caption rounded-md p-3 ${
											comment.author === "agent"
												? "bg-accent-light border border-accent-light"
												: "bg-surface-secondary border border-border"
										}`}
									>
										<div className="flex items-center justify-between mb-1">
											<span
												className={`font-medium ${
													comment.author === "agent" ? "text-accent" : "text-text-primary"
												}`}
											>
												{comment.author === "agent" ? "Claude Agent" : "User"}
											</span>
											<span className="text-text-disabled">
												{new Date(comment.createdAt).toLocaleString()}
											</span>
										</div>
										<pre className="whitespace-pre-wrap break-words text-text-secondary font-mono text-code max-h-60 overflow-y-auto">
											{comment.text}
										</pre>
									</div>
								))}
								<div ref={commentsEndRef} />
							</div>
						</div>
					)}
				</div>

				{/* Comment Input */}
				{canComment && (
					<div className="p-4 border-t border-border">
						<div className="flex gap-2">
							<textarea
								value={commentText}
								onChange={(e) => setCommentText(e.target.value)}
								onKeyDown={handleCommentKeyDown}
								placeholder="Add a comment for Claude..."
								rows={2}
								className="flex-1 px-3 py-2 border border-border-strong rounded-md text-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
							/>
							<Button
								variant="primary"
								onClick={handleSendComment}
								disabled={!commentText.trim()}
								className="self-end bg-accent hover:bg-accent-hover"
							>
								Send
							</Button>
						</div>
						<p className="text-caption text-text-disabled mt-1">
							Cmd+Enter to send. Claude will resume with full context.
						</p>
					</div>
				)}

				<div className="p-4 border-t border-border">
					<Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>
						Delete task
					</Button>
				</div>
			</div>
		</div>
	);
}
