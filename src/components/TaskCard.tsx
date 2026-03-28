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
			<h3 className="text-sm font-medium text-gray-900 break-words">{task.title}</h3>
			{task.description && (
				<p className="text-xs text-gray-500 mt-1 line-clamp-2 break-words">{task.description}</p>
			)}
		</div>
	);
}
