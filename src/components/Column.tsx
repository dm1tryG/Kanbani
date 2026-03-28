"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ColumnId, Task } from "@/types";
import TaskCard from "./TaskCard";

interface ColumnProps {
	id: ColumnId;
	title: string;
	tasks: Task[];
	onTaskClick: (task: Task) => void;
	onAddTask?: () => void;
}

export default function Column({ id, title, tasks, onTaskClick, onAddTask }: ColumnProps) {
	const { setNodeRef, isOver } = useDroppable({ id });

	return (
		<div
			className={`bg-gray-100 rounded-xl w-72 flex-shrink-0 flex flex-col max-h-full ${
				isOver ? "bg-gray-200" : ""
			}`}
		>
			<div className="flex items-center justify-between px-3 pt-3 pb-1">
				<div className="flex items-center gap-2">
					<h2 className="text-sm font-semibold text-gray-700">{title}</h2>
					<span className="text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
						{tasks.length}
					</span>
				</div>
				{onAddTask && (
					<button
						onClick={onAddTask}
						type="button"
						className="text-gray-400 hover:text-gray-600 text-xl leading-none pb-0.5 cursor-pointer"
					>
						+
					</button>
				)}
			</div>
			<div ref={setNodeRef} className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[40px]">
				<SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
					{tasks.map((task) => (
						<TaskCard key={task.id} task={task} onClick={onTaskClick} />
					))}
				</SortableContext>
			</div>
		</div>
	);
}
