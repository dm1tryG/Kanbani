import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

const TEST_BOARD_PATH = join(process.cwd(), "data", "board.test.json");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3099",
    trace: "on-first-retry",
    screenshot: "on",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `BOARD_PATH=${TEST_BOARD_PATH} npx next dev --port 3099`,
    url: "http://localhost:3099",
    reuseExistingServer: false,
    env: {
      BOARD_PATH: TEST_BOARD_PATH,
    },
  },
});
