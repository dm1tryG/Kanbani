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
import { useCallback, useEffect, useRef, useState } from "react";
import type { ColumnId, Task } from "@/types";
import { COLUMNS } from "@/types";
import Column from "./Column";
import CreateTaskModal from "./CreateTaskModal";
import TaskCard from "./TaskCard";
import TaskPanel from "./TaskPanel";

export default function Board() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [projects, setProjects] = useState<string[]>([]);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [showCreate, setShowCreate] = useState(false);
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		}),
	);

	const fetchTasks = useCallback(async () => {
		const res = await fetch("/api/tasks");
		const data = await res.json();
		setTasks(data.tasks);
		setProjects(data.projects || []);
	}, []);

	useEffect(() => {
		fetchTasks();
	}, [fetchTasks]);

	useEffect(() => {
		const hasRunning = tasks.some((t) => t.agentRunning);
		if (hasRunning && !pollingRef.current) {
			pollingRef.current = setInterval(fetchTasks, 3000);
		} else if (!hasRunning && pollingRef.current) {
			clearInterval(pollingRef.current);
			pollingRef.current = null;
		}
		return () => {
			if (pollingRef.current) {
				clearInterval(pollingRef.current);
				pollingRef.current = null;
			}
		};
	}, [tasks, fetchTasks]);

	useEffect(() => {
		if (selectedTask) {
			const updated = tasks.find((t) => t.id === selectedTask.id);
			if (updated) setSelectedTask(updated);
		}
	}, [tasks, selectedTask]);

	async function handleCreateTask(title: string, description: string, folder: string) {
		const res = await fetch("/api/tasks", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title, description, folder }),
		});
		const task = await res.json();
		setTasks((prev) => [...prev, task]);
		if (!projects.includes(folder)) {
			setProjects((prev) => [...prev, folder]);
		}
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

	async function handleMergeTask(task: Task) {
		const res = await fetch(`/api/tasks/${task.id}/merge`, { method: "POST" });
		const data = await res.json();
		if (res.ok) {
			await fetchTasks();
		} else {
			alert(`Merge failed: ${data.error}`);
		}
	}

	async function handleDiscardWorktree(task: Task) {
		const res = await fetch(`/api/tasks/${task.id}/merge`, { method: "DELETE" });
		if (res.ok) {
			await fetchTasks();
		}
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
	}

	async function handleDeleteTask(id: string) {
		setTasks((prev) => prev.filter((t) => t.id !== id));
		setSelectedTask(null);
		await fetch(`/api/tasks/${id}`, { method: "DELETE" });
	}

	async function handleRunTask(task: Task) {
		setTasks((prev) =>
			prev.map((t) =>
				t.id === task.id ? { ...t, column: "inprogress" as ColumnId, agentRunning: true } : t,
			),
		);
		await fetch(`/api/tasks/${task.id}/run`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
	}

	async function handleCommentTask(task: Task, comment: string) {
		setTasks((prev) =>
			prev.map((t) =>
				t.id === task.id ? { ...t, column: "inprogress" as ColumnId, agentRunning: true } : t,
			),
		);
		await fetch(`/api/tasks/${task.id}/run`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ comment }),
		});
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
		<div className="h-screen flex flex-col">
			<header className="flex items-center px-6 py-4 bg-surface/70 backdrop-blur-md border-b border-border">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
						<span className="text-white font-bold text-body">K</span>
					</div>
					<h1 className="text-heading font-bold text-foreground tracking-tight">Kanbani</h1>
				</div>
			</header>

			<main className="flex-1 overflow-x-auto p-6">
				<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
					<div className="flex gap-5 h-full">
						{COLUMNS.map((col) => (
							<Column
								key={col.id}
								id={col.id}
								title={col.title}
								tasks={tasks.filter((t) => t.column === col.id)}
								onTaskClick={handleTaskClick}
								onAddTask={col.id === "todo" ? () => setShowCreate(true) : undefined}
								onRunTask={handleRunTask}
							/>
						))}
					</div>
					<DragOverlay>
						{activeTask ? (
							<div className="rotate-2 scale-105">
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
					onRun={handleRunTask}
					onComment={handleCommentTask}
					onMerge={handleMergeTask}
					onDiscard={handleDiscardWorktree}
				/>
			)}

			{showCreate && (
				<CreateTaskModal
					projects={projects}
					onClose={() => setShowCreate(false)}
					onCreate={handleCreateTask}
				/>
			)}
		</div>
	);
}
