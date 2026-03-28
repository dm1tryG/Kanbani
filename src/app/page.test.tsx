import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "./page";

test("renders Kanbani heading", () => {
	render(<Home />);
	expect(screen.getByText("Kanbani")).toBeDefined();
});
