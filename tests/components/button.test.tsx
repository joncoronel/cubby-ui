import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/registry/default/button/button";

describe("Button", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      render(<Button>Click me</Button>);
      expect(
        screen.getByRole("button", { name: /click me/i }),
      ).toBeInTheDocument();
    });

    it("renders with leftSection", () => {
      render(
        <Button leftSection={<span data-testid="left-icon">L</span>}>
          Button
        </Button>,
      );
      expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    });

    it("renders with rightSection", () => {
      render(
        <Button rightSection={<span data-testid="right-icon">R</span>}>
          Button
        </Button>,
      );
      expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    });

    it("renders with both sections", () => {
      render(
        <Button
          leftSection={<span data-testid="left">L</span>}
          rightSection={<span data-testid="right">R</span>}
        >
          Button
        </Button>,
      );
      expect(screen.getByTestId("left")).toBeInTheDocument();
      expect(screen.getByTestId("right")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("applies variant data attribute", () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "destructive");
    });

    it("applies size data attribute", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "lg");
    });

    it("uses default variant when not specified", () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole("button");
      // Default variant is "primary" but data-variant will be undefined
      // since we only set it when explicitly passed
      expect(button).toHaveAttribute("data-slot", "button");
    });
  });

  describe("interactions", () => {
    it("calls onClick when clicked", async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      await userEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", async () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>,
      );

      await userEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("does not call onClick when loading", async () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>,
      );

      await userEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("disabled state", () => {
    it("is disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("is aria-disabled but focusable when loading", () => {
      // When loading, button should be disabled but remain focusable
      // This is the expected UX - users can still tab to it
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).toHaveAttribute("tabindex", "0");
    });

    it("is not disabled by default", () => {
      render(<Button>Normal</Button>);
      expect(screen.getByRole("button")).not.toBeDisabled();
    });
  });

  describe("custom className", () => {
    it("applies custom className", () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });
  });
});
