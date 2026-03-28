import { execSync } from "node:child_process";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	if (process.platform !== "darwin") {
		return NextResponse.json({ error: "Only supported on macOS" }, { status: 400 });
	}

	const { command } = await request.json();
	if (!command || typeof command !== "string") {
		return NextResponse.json({ error: "Missing command" }, { status: 400 });
	}

	try {
		execSync(
			`osascript -e 'tell application "Terminal" to do script "${command.replace(/["\\]/g, "\\$&")}"' -e 'tell application "Terminal" to activate'`,
			{ encoding: "utf-8", stdio: "pipe" },
		);
		return NextResponse.json({ ok: true });
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		return NextResponse.json({ error: msg }, { status: 500 });
	}
}
