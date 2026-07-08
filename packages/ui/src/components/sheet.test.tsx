import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sheet, SheetContent } from "./sheet";

describe("SheetContent", () => {
  it("renders the close button by default", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>conteúdo</SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("fechar")).toBeInTheDocument();
  });

  it("omits the close button when hideClose is set", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent hideClose>conteúdo</SheetContent>
      </Sheet>,
    );
    expect(screen.queryByText("fechar")).not.toBeInTheDocument();
  });
});
