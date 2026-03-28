import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { BoardData } from "@/types";

export const DATA_PATH = process.env.BOARD_PATH || join(process.cwd(), "data", "board.json");

export async function readBoard(): Promise<BoardData> {
	const raw = await readFile(DATA_PATH, "utf-8");
	return JSON.parse(raw);
}

export async function writeBoard(data: BoardData): Promise<void> {
	await writeFile(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}
