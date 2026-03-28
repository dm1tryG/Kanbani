#!/usr/bin/env node

const { execSync } = require("node:child_process");
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

const PORT = process.env.PORT || 3333;
const HOSTNAME = process.env.HOSTNAME || "localhost";

console.log(`\n  Kanbani is running on http://${HOSTNAME}:${PORT}\n`);

// Open browser after a short delay
setTimeout(() => {
	const url = `http://${HOSTNAME}:${PORT}`;
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

// Start the standalone Next.js server
process.env.BOARD_PATH = BOARD_PATH;
process.env.PORT = String(PORT);
process.env.HOSTNAME = HOSTNAME;

require(join(PKG_DIR, ".next", "standalone", "server.js"));
