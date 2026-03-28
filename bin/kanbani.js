#!/usr/bin/env node

const { execSync, spawn } = require("node:child_process");
const { existsSync, mkdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { platform } = require("node:os");

const HOME = process.env.HOME || process.env.USERPROFILE;
const KANBANI_DIR = join(HOME, ".kanbani");
const BOARD_PATH = join(KANBANI_DIR, "board.json");
const PKG_DIR = join(__dirname, "..");

// Ensure data directory and board file exist
if (!existsSync(KANBANI_DIR)) {
	mkdirSync(KANBANI_DIR, { recursive: true });
}
if (!existsSync(BOARD_PATH)) {
	writeFileSync(
		BOARD_PATH,
		JSON.stringify({ tasks: [], projects: [] }, null, 2) + "\n",
	);
	console.log(`Created board at ${BOARD_PATH}`);
}

// Build if needed
const nextDir = join(PKG_DIR, ".next");
if (!existsSync(nextDir)) {
	console.log("Building Kanbani (first run)...");
	execSync("npx next build", { cwd: PKG_DIR, stdio: "inherit" });
}

// Pick a port
const PORT = process.env.PORT || 3333;

console.log(`\n  Kanbani is starting on http://localhost:${PORT}\n`);

// Start Next.js production server
const server = spawn("npx", ["next", "start", "--port", String(PORT)], {
	cwd: PKG_DIR,
	stdio: "inherit",
	env: {
		...process.env,
		BOARD_PATH,
		NODE_ENV: "production",
	},
});

// Open browser after a short delay
setTimeout(() => {
	const url = `http://localhost:${PORT}`;
	try {
		if (platform() === "darwin") {
			execSync(`open ${url}`);
		} else if (platform() === "win32") {
			execSync(`start ${url}`);
		} else {
			execSync(`xdg-open ${url}`);
		}
	} catch {
		// silently fail if can't open browser
	}
}, 1500);

// Handle shutdown
process.on("SIGINT", () => {
	server.kill("SIGINT");
	process.exit(0);
});
process.on("SIGTERM", () => {
	server.kill("SIGTERM");
	process.exit(0);
});
