import { expect, test } from "vitest";
import Home from "./page";

test("Home page component is defined", () => {
  expect(Home).toBeDefined();
  expect(typeof Home).toBe("function");
});
