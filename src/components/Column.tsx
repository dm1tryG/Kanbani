"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task } from "@/types";
import TaskCard from "./TaskCard";
import { Badge } from "./ui";

interface ColumnProps {
	id: string;
	title: string;
	tasks: Task[];
	onTaskClick: (task: Task) => void;
	onAddTask?: () => void;
	onRunTask?: (task: Task) => void;
}

export default function Column({
	id,
	title,
	tasks,
	onTaskClick,
	onAddTask,
	onRunTask,
}: ColumnProps) {
	const { setNodeRef, isOver } = useDroppable({ id });

	return (
		<div
			className={`bg-surface-tertiary rounded-lg w-72 flex-shrink-0 flex flex-col max-h-full ${
				isOver ? "bg-border" : ""
			}`}
		>
			<div className="flex items-center justify-between px-3 pt-3 pb-1">
				<div className="flex items-center gap-2">
					<h2 className="text-body font-semibold text-text-secondary">{title}</h2>
					<Badge variant="count">{tasks.length}</Badge>
				</div>
				{onAddTask && (
					<button
						onClick={onAddTask}
						type="button"
						className="text-text-disabled hover:text-text-secondary text-xl leading-none pb-0.5 cursor-pointer"
					>
						+
					</button>
				)}
			</div>
			<div ref={setNodeRef} className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[40px]">
				<SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
					{tasks.map((task) => (
						<TaskCard key={task.id} task={task} onClick={onTaskClick} onRun={onRunTask} />
					))}
				</SortableContext>
			</div>
		</div>
	);
}
