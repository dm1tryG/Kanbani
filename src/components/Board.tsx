"use client";

import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { useCallback, useEffect, useState } from "react";
import type { ColumnId, Task } from "@/types";
import { COLUMNS } from "@/types";
import Column from "./Column";
import CreateTaskModal from "./CreateTaskModal";
import TaskCard from "./TaskCard";
import TaskPanel from "./TaskPanel";

export default function Board() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [showCreate, setShowCreate] = useState(false);
	const [activeTask, setActiveTask] = useState<Task | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		}),
	);

	const fetchTasks = useCallback(async () => {
		const res = await fetch("/api/tasks");
		const data = await res.json();
		setTasks(data.tasks);
	}, []);

	useEffect(() => {
		fetchTasks();
	}, [fetchTasks]);

	async function handleCreateTask(title: string, description: string) {
		const res = await fetch("/api/tasks", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title, description }),
		});
		const task = await res.json();
		setTasks((prev) => [...prev, task]);
		setShowCreate(false);
	}

	async function handleMoveTask(id: string, column: ColumnId) {
		setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, column } : t)));
		await fetch("/api/tasks", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id, column }),
		});
	}

	async function handleUpdateTask(id: string, data: { title: string; description: string }) {
		setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
		const res = await fetch(`/api/tasks/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		const updated = await res.json();
		setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
		setSelectedTask((sel) => (sel?.id === id ? updated : sel));
	}

	async function handleDeleteTask(id: string) {
		setTasks((prev) => prev.filter((t) => t.id !== id));
		setSelectedTask(null);
		await fetch(`/api/tasks/${id}`, { method: "DELETE" });
	}

	function handleDragStart(event: DragStartEvent) {
		const task = tasks.find((t) => t.id === event.active.id);
		setActiveTask(task || null);
	}

	function handleDragEnd(event: DragEndEvent) {
		setActiveTask(null);
		const { active, over } = event;
		if (!over) return;

		const taskId = active.id as string;
		let targetColumn: ColumnId | null = null;

		if (COLUMNS.some((c) => c.id === over.id)) {
			targetColumn = over.id as ColumnId;
		} else {
			const overTask = tasks.find((t) => t.id === over.id);
			if (overTask) targetColumn = overTask.column;
		}

		if (targetColumn) {
			const task = tasks.find((t) => t.id === taskId);
			if (task && task.column !== targetColumn) {
				handleMoveTask(taskId, targetColumn);
			}
		}
	}

	function handleTaskClick(task: Task) {
		if (!activeTask) {
			setSelectedTask(task);
		}
	}

	return (
		<div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-gray-100">
			<header className="flex items-center px-6 py-3 bg-white/80 backdrop-blur border-b border-gray-200">
				<h1 className="text-xl font-bold text-gray-800">Kanbani</h1>
			</header>

			<main className="flex-1 overflow-x-auto p-6">
				<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
					<div className="flex gap-4 h-full">
						{COLUMNS.map((col) => (
							<Column
								key={col.id}
								id={col.id}
								title={col.title}
								tasks={tasks.filter((t) => t.column === col.id)}
								onTaskClick={handleTaskClick}
								onAddTask={col.id === "todo" ? () => setShowCreate(true) : undefined}
							/>
						))}
					</div>
					<DragOverlay>
						{activeTask ? (
							<div className="rotate-3">
								<TaskCard task={activeTask} onClick={() => {}} />
							</div>
						) : null}
					</DragOverlay>
				</DndContext>
			</main>

			{selectedTask && (
				<TaskPanel
					task={selectedTask}
					onClose={() => setSelectedTask(null)}
					onUpdate={handleUpdateTask}
					onDelete={handleDeleteTask}
				/>
			)}

			{showCreate && (
				<CreateTaskModal onClose={() => setShowCreate(false)} onCreate={handleCreateTask} />
			)}
		</div>
	);
}
