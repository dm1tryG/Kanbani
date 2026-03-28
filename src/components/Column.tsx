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
			className={`bg-surface-dim/60 rounded-xl flex-1 min-w-[250px] flex flex-col max-h-full border border-border/50 transition-colors duration-150 ${
				isOver ? "bg-surface-dim border-primary/30" : ""
			}`}
		>
			<div className="flex items-center justify-between px-4 pt-4 pb-2">
				<div className="flex items-center gap-2">
					<h2 className="text-body font-bold text-foreground">{title}</h2>
					<Badge variant="count">{tasks.length}</Badge>
				</div>
				{onAddTask && (
					<button
						onClick={onAddTask}
						type="button"
						className="w-7 h-7 flex items-center justify-center rounded-lg text-faint hover:text-primary hover:bg-primary-light transition-all duration-150 cursor-pointer text-lg leading-none"
					>
						+
					</button>
				)}
			</div>
			<div
				ref={setNodeRef}
				className="flex-1 overflow-y-auto px-3 pb-3 pt-1 space-y-2.5 min-h-[40px]"
			>
				<SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
					{tasks.map((task) => (
						<TaskCard key={task.id} task={task} onClick={onTaskClick} onRun={onRunTask} />
					))}
				</SortableContext>
			</div>
		</div>
	);
}
