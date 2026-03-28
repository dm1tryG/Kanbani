"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";

interface TaskCardProps {
	task: Task;
	onClick: (task: Task) => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: task.id,
		data: { column: task.column },
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const folderLabel = task.folder ? task.folder.split("/").filter(Boolean).pop() || task.folder : null;

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			onClick={() => onClick(task)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") onClick(task);
			}}
			className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-grab hover:shadow-md transition-shadow ${
				isDragging ? "opacity-50 shadow-lg" : ""
			}`}
		>
			{folderLabel && (
				<span className="inline-block text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mb-1.5">
					{folderLabel}
				</span>
			)}
			<h3 className="text-sm font-medium text-gray-900 break-words">{task.title}</h3>
			{task.description && (
				<p className="text-xs text-gray-500 mt-1 line-clamp-2 break-words">{task.description}</p>
			)}
		</div>
	);
}
