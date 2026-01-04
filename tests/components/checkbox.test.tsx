import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "@/registry/default/checkbox/checkbox";

describe("Checkbox", () => {
  describe("rendering", () => {
    it("renders a checkbox", () => {
      render(<Checkbox />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("applies data-slot attribute", () => {
      render(<Checkbox />);
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "data-slot",
        "checkbox",
      );
    });

    it("is unchecked by default", () => {
      render(<Checkbox />);
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("renders checked when defaultChecked is true", () => {
      render(<Checkbox defaultChecked />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });

  describe("interactions", () => {
    it("toggles when clicked", async () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");

      expect(checkbox).not.toBeChecked();
      await userEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      await userEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("toggles when Space key is pressed", async () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");

      checkbox.focus();
      await userEvent.keyboard(" ");
      expect(checkbox).toBeChecked();
    });

    it("calls onCheckedChange when toggled", async () => {
      const handleChange = vi.fn();
      render(<Checkbox onCheckedChange={handleChange} />);

      await userEvent.click(screen.getByRole("checkbox"));
      // Base UI passes (checked, details) - we check first arg
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange.mock.calls[0][0]).toBe(true);

      await userEvent.click(screen.getByRole("checkbox"));
      expect(handleChange).toHaveBeenCalledTimes(2);
      expect(handleChange.mock.calls[1][0]).toBe(false);
    });
  });

  describe("disabled state", () => {
    it("is disabled when disabled prop is true", () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole("checkbox");
      // Base UI uses aria-disabled instead of native disabled
      expect(checkbox).toHaveAttribute("aria-disabled", "true");
    });

    it("does not toggle when disabled", async () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole("checkbox");

      await userEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("does not call onCheckedChange when disabled", async () => {
      const handleChange = vi.fn();
      render(<Checkbox disabled onCheckedChange={handleChange} />);

      await userEvent.click(screen.getByRole("checkbox"));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("controlled checkbox", () => {
    it("displays controlled checked state", () => {
      render(<Checkbox checked onCheckedChange={() => {}} />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("displays controlled unchecked state", () => {
      render(<Checkbox checked={false} onCheckedChange={() => {}} />);
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("updates when controlled value changes", () => {
      const { rerender } = render(
        <Checkbox checked={false} onCheckedChange={() => {}} />,
      );
      expect(screen.getByRole("checkbox")).not.toBeChecked();

      rerender(<Checkbox checked={true} onCheckedChange={() => {}} />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });

  describe("accessibility", () => {
    it("can be labeled with aria-label", () => {
      render(<Checkbox aria-label="Accept terms" />);
      expect(
        screen.getByRole("checkbox", { name: "Accept terms" }),
      ).toBeInTheDocument();
    });

    it("can be wrapped with a label element", async () => {
      // Base UI Checkbox creates its own internal structure
      // Wrapping with label element works for click handling
      render(
        <label>
          <Checkbox />
          Accept terms and conditions
        </label>,
      );
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();

      // Clicking the label text should toggle the checkbox
      await userEvent.click(screen.getByText("Accept terms and conditions"));
      expect(checkbox).toBeChecked();
    });

    it("supports aria-invalid for error states", () => {
      render(<Checkbox aria-invalid="true" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });
  });

  describe("custom className", () => {
    it("applies custom className", () => {
      render(<Checkbox className="custom-checkbox" />);
      expect(screen.getByRole("checkbox")).toHaveClass("custom-checkbox");
    });
  });
});
