import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/registry/default/input/input";

describe("Input", () => {
  describe("rendering", () => {
    it("renders an input element", () => {
      render(<Input />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with placeholder", () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("renders with default value", () => {
      render(<Input defaultValue="Hello" />);
      expect(screen.getByRole("textbox")).toHaveValue("Hello");
    });

    it("applies data-slot attribute", () => {
      render(<Input />);
      expect(screen.getByRole("textbox")).toHaveAttribute("data-slot", "input");
    });
  });

  describe("interactions", () => {
    it("accepts user input", async () => {
      render(<Input />);
      const input = screen.getByRole("textbox");

      await userEvent.type(input, "Hello World");
      expect(input).toHaveValue("Hello World");
    });

    it("calls onChange when value changes", async () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      await userEvent.type(screen.getByRole("textbox"), "a");
      expect(handleChange).toHaveBeenCalled();
    });

    it("calls onFocus when focused", async () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      await userEvent.click(screen.getByRole("textbox"));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("calls onBlur when focus is lost", async () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole("textbox");
      await userEvent.click(input);
      await userEvent.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe("disabled state", () => {
    it("is disabled when disabled prop is true", () => {
      render(<Input disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("does not accept input when disabled", async () => {
      render(<Input disabled defaultValue="Original" />);
      const input = screen.getByRole("textbox");

      await userEvent.type(input, "New text");
      expect(input).toHaveValue("Original");
    });
  });

  describe("input types", () => {
    it("renders as password type", () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it("renders as email type", () => {
      render(<Input type="email" />);
      const input = document.querySelector('input[type="email"]');
      expect(input).toBeInTheDocument();
    });

    it("renders as number type", () => {
      render(<Input type="number" />);
      const input = document.querySelector('input[type="number"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe("controlled input", () => {
    it("displays controlled value", () => {
      render(<Input value="Controlled" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("Controlled");
    });

    it("updates when controlled value changes", () => {
      const { rerender } = render(<Input value="First" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("First");

      rerender(<Input value="Second" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("Second");
    });
  });

  describe("accessibility", () => {
    it("can be labeled with aria-label", () => {
      render(<Input aria-label="Email address" />);
      expect(
        screen.getByRole("textbox", { name: "Email address" }),
      ).toBeInTheDocument();
    });

    it("can be associated with a label via id", () => {
      render(
        <>
          <label htmlFor="email-input">Email</label>
          <Input id="email-input" />
        </>,
      );
      expect(
        screen.getByRole("textbox", { name: "Email" }),
      ).toBeInTheDocument();
    });

    it("supports aria-invalid for error states", () => {
      render(<Input aria-invalid="true" />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it("supports aria-describedby for error messages", () => {
      render(
        <>
          <Input aria-describedby="error-msg" aria-invalid="true" />
          <span id="error-msg">This field is required</span>
        </>,
      );
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-describedby",
        "error-msg",
      );
    });
  });

  describe("custom className", () => {
    it("applies custom className", () => {
      render(<Input className="custom-input" />);
      expect(screen.getByRole("textbox")).toHaveClass("custom-input");
    });
  });
});
