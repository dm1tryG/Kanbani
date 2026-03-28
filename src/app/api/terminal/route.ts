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

	const escaped = command.replace(/["\\]/g, "\\$&");

	// Prefer iTerm2 if installed, fall back to Terminal.app
	let hasITerm = false;
	try {
		execSync("test -d /Applications/iTerm.app", { stdio: "pipe" });
		hasITerm = true;
	} catch {}

	try {
		if (hasITerm) {
			execSync(
				`osascript -e 'tell application "iTerm" to create window with default profile command "${escaped}"' -e 'tell application "iTerm" to activate'`,
				{ encoding: "utf-8", stdio: "pipe" },
			);
		} else {
			execSync(
				`osascript -e 'tell application "Terminal" to do script "${escaped}"' -e 'tell application "Terminal" to activate'`,
				{ encoding: "utf-8", stdio: "pipe" },
			);
		}
		return NextResponse.json({ ok: true });
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		return NextResponse.json({ error: msg }, { status: 500 });
	}
}
