export type ColumnId = "todo" | "inprogress" | "testing" | "done";

export interface Task {
	id: string;
	title: string;
	description: string;
	column: ColumnId;
	createdAt: string;
}

export interface BoardData {
	tasks: Task[];
}

export const COLUMNS: { id: ColumnId; title: string }[] = [
	{ id: "todo", title: "To Do" },
	{ id: "inprogress", title: "In Progress" },
	{ id: "testing", title: "Testing" },
	{ id: "done", title: "Done" },
];
