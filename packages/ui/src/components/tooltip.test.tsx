import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

function Fixture({ side }: { side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={(props) => <button type="button" {...props} />}>
          trigger
        </TooltipTrigger>
        <TooltipContent side={side}>tooltip text</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

describe("Tooltip", () => {
  it("renders an accessible, focusable trigger and accepts side='right'", () => {
    render(<Fixture side="right" />);
    const trigger = screen.getByRole("button", { name: "trigger" });
    expect(trigger).toBeInTheDocument();
    trigger.focus();
    expect(trigger).toHaveFocus();
  });

  it("reveals the content on hover", async () => {
    render(<Fixture side="right" />);
    const trigger = screen.getByRole("button", { name: "trigger" });

    await userEvent.hover(trigger);

    await waitFor(() => {
      expect(screen.getByText("tooltip text")).toBeInTheDocument();
    });
  });
});
