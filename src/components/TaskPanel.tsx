"use client";

import { useEffect, useRef, useState } from "react";
import type { Task } from "@/types";

interface TaskPanelProps {
	task: Task;
	onClose: () => void;
	onUpdate: (id: string, data: { title: string; description: string }) => void;
	onDelete: (id: string) => void;
	onRun: (task: Task) => void;
	onComment: (task: Task, comment: string) => void;
}

export default function TaskPanel({ task, onClose, onUpdate, onDelete, onRun, onComment }: TaskPanelProps) {
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
				className="relative w-[480px] max-w-full bg-white h-full shadow-xl flex flex-col animate-slide-in"
			>
				<div className="flex items-center justify-between p-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
					<div className="flex items-center gap-2">
						{task.agentRunning && (
							<span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded animate-pulse">
								Agent running...
							</span>
						)}
						{canRun && (
							<button
								onClick={() => onRun(task)}
								type="button"
								title="Run Claude agent"
								className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
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
							</button>
						)}
						<button
							onClick={onClose}
							type="button"
							className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
						>
							&times;
						</button>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					<div>
						<label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
							Title
						</label>
						<input
							id="task-title"
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							onBlur={handleSave}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
						/>
					</div>

					<div>
						<label htmlFor="task-desc" className="block text-sm font-medium text-gray-700 mb-1">
							Description
						</label>
						<textarea
							id="task-desc"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							onBlur={handleSave}
							rows={4}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
						/>
					</div>

					{task.folder && (
						<div>
							<span className="block text-sm font-medium text-gray-700 mb-1">Project</span>
							<div className="flex items-center gap-2">
								<span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
									{task.folder.split("/").filter(Boolean).pop() || task.folder}
								</span>
								<span className="text-xs text-gray-400 truncate" title={task.folder}>
									{task.folder}
								</span>
							</div>
						</div>
					)}

					<div className="text-xs text-gray-400">
						Created: {new Date(task.createdAt).toLocaleDateString()}
						{task.sessionId && (
							<span className="ml-2 text-green-600" title={task.sessionId}>
								Session active
							</span>
						)}
					</div>

					{/* Comments Section */}
					{comments.length > 0 && (
						<div>
							<h3 className="text-sm font-medium text-gray-700 mb-2">
								Comments ({comments.length})
							</h3>
							<div className="space-y-2">
								{comments.map((comment) => (
									<div
										key={comment.id}
										className={`text-xs rounded-lg p-3 ${
											comment.author === "agent"
												? "bg-purple-50 border border-purple-100"
												: "bg-gray-50 border border-gray-100"
										}`}
									>
										<div className="flex items-center justify-between mb-1">
											<span
												className={`font-medium ${
													comment.author === "agent" ? "text-purple-700" : "text-gray-700"
												}`}
											>
												{comment.author === "agent" ? "Claude Agent" : "User"}
											</span>
											<span className="text-gray-400">
												{new Date(comment.createdAt).toLocaleString()}
											</span>
										</div>
										<pre className="whitespace-pre-wrap break-words text-gray-600 font-mono text-[11px] max-h-60 overflow-y-auto">
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
					<div className="p-4 border-t border-gray-200">
						<div className="flex gap-2">
							<textarea
								value={commentText}
								onChange={(e) => setCommentText(e.target.value)}
								onKeyDown={handleCommentKeyDown}
								placeholder="Add a comment for Claude..."
								rows={2}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
							/>
							<button
								onClick={handleSendComment}
								type="button"
								disabled={!commentText.trim()}
								className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors cursor-pointer self-end"
							>
								Send
							</button>
						</div>
						<p className="text-[10px] text-gray-400 mt-1">Cmd+Enter to send. Claude will resume with full context.</p>
					</div>
				)}

				<div className="p-4 border-t border-gray-200">
					<button
						onClick={() => onDelete(task.id)}
						type="button"
						className="text-sm text-red-500 hover:text-red-700 cursor-pointer"
					>
						Delete task
					</button>
				</div>
			</div>
		</div>
	);
}
