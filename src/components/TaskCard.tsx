"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";
import { Badge, IconButton } from "./ui";

interface TaskCardProps {
	task: Task;
	onClick: (task: Task) => void;
	onRun?: (task: Task) => void;
}

export default function TaskCard({ task, onClick, onRun }: TaskCardProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: task.id,
		data: { column: task.column },
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const folderLabel = task.folder
		? task.folder.split("/").filter(Boolean).pop() || task.folder
		: null;
	const canRun = !!task.folder && !task.agentRunning;

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: dnd-kit requires div with handlers
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			onClick={() => onClick(task)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") onClick(task);
			}}
			className={`bg-surface rounded-md shadow-sm border border-border p-3 cursor-grab hover:shadow-md transition-shadow ${
				isDragging ? "opacity-50 shadow-lg" : ""
			}`}
		>
			<div className="flex items-center justify-between mb-1.5">
				<div className="flex items-center gap-1.5">
					{folderLabel && <Badge>{folderLabel}</Badge>}
					{task.agentRunning && <Badge variant="warning">running</Badge>}
				</div>
				{canRun && onRun && (
					<IconButton
						variant="success"
						onClick={(e) => {
							e.stopPropagation();
							onRun(task);
						}}
						onPointerDown={(e) => e.stopPropagation()}
						title="Run Claude agent"
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-label="Run">
							<path d="M8 5v14l11-7z" />
						</svg>
					</IconButton>
				)}
			</div>
			<h3 className="text-body font-medium text-text-primary break-words">{task.title}</h3>
			{task.description && (
				<p className="text-caption text-text-secondary mt-1 line-clamp-2 break-words">
					{task.description}
				</p>
			)}
		</div>
	);
}
