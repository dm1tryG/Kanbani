import { expect, test } from "@playwright/test";

test("homepage loads and shows title", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator("h1")).toHaveText("Kanbani");
	await page.screenshot({ path: "e2e/screenshots/home.png" });
});
