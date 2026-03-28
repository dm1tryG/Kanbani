import { readdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const rawPath = searchParams.get("path") || homedir();
	const currentPath = resolve(rawPath);

	try {
		const entries = await readdir(currentPath, { withFileTypes: true });
		const folders = entries
			.filter((e) => e.isDirectory() && !e.name.startsWith("."))
			.map((e) => ({
				name: e.name,
				path: join(currentPath, e.name),
			}))
			.sort((a, b) => a.name.localeCompare(b.name));

		return NextResponse.json({ current: currentPath, folders });
	} catch {
		return NextResponse.json({ error: "Cannot read directory" }, { status: 400 });
	}
}
