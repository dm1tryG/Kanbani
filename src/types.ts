export type ColumnId = "todo" | "inprogress" | "testing" | "done";

export interface Comment {
	id: string;
	text: string;
	author: "user" | "agent";
	createdAt: string;
}

export interface Task {
	id: string;
	title: string;
	description: string;
	column: ColumnId;
	folder: string;
	comments: Comment[];
	agentRunning: boolean;
	createdAt: string;
}

export interface BoardData {
	tasks: Task[];
	projects: string[];
}

export const COLUMNS: { id: ColumnId; title: string }[] = [
	{ id: "todo", title: "To Do" },
	{ id: "inprogress", title: "In Progress" },
	{ id: "testing", title: "Testing" },
	{ id: "done", title: "Done" },
];
