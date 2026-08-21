import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NoteCard from "@/components/NoteCard";

describe("NoteCard", () => {
  it("renders the note text and author", () => {
    render(<NoteCard index={1} text="Buy milk" author="Sam" onDelete={() => {}} />);
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByText("Sam")).toBeInTheDocument();
  });

  it("shows a zero-padded index", () => {
    render(<NoteCard index={3} text="Note" onDelete={() => {}} />);
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("calls onDelete when the delete button is clicked", () => {
    const onDelete = vi.fn();
    render(<NoteCard index={1} text="Note" onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText("Delete note"));
    expect(onDelete).toHaveBeenCalledOnce();
  });
});
