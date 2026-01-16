import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrintPageButton } from "./PrintPageButton";

jest.mock("@payloadcms/ui", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("PrintPageButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.open as any) = jest.fn();
  });

  it("disables printing for draft pages", () => {
    render(<PrintPageButton date="2026-01-16T12:00:00.000Z" isDraft={true} />);

    const button = screen.getByRole("button", { name: "Publish page to enable print" });
    expect(button).toBeDisabled();
  });

  it("opens date-based print route for published pages", async () => {
    const user = userEvent.setup();
    render(<PrintPageButton date="2026-01-16T12:00:00.000Z" isDraft={false} />);

    const button = screen.getByRole("button", { name: "🖨️ Open Print Version" });
    await user.click(button);

    expect(window.open).toHaveBeenCalledWith(
      "/ogloszenia/16-01-2026/print",
      "_blank",
      "noopener,noreferrer"
    );
  });
});

