"use client";

import { useEffect, useRef, useState } from "react";
import type { Task } from "@/types";

interface TaskPanelProps {
	task: Task;
	onClose: () => void;
	onUpdate: (id: string, data: { title: string; description: string }) => void;
	onDelete: (id: string) => void;
}

export default function TaskPanel({ task, onClose, onUpdate, onDelete }: TaskPanelProps) {
	const [title, setTitle] = useState(task.title);
	const [description, setDescription] = useState(task.description);
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setTitle(task.title);
		setDescription(task.description);
	}, [task]);

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

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			<div className="absolute inset-0 bg-black/30" />
			<div
				ref={panelRef}
				className="relative w-[480px] max-w-full bg-white h-full shadow-xl flex flex-col animate-slide-in"
			>
				<div className="flex items-center justify-between p-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
					<button
						onClick={onClose}
						type="button"
						className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
					>
						×
					</button>
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
							rows={8}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
						/>
					</div>

					{task.folder && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Project
							</label>
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
					</div>
				</div>

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
