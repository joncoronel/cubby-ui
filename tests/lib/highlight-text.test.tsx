import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { highlightText } from "@/registry/default/lib/highlight-text";

describe("highlightText", () => {
  describe("when query is empty", () => {
    it("returns original text for empty string query", () => {
      const result = highlightText("Hello World", "");
      expect(result).toBe("Hello World");
    });

    it("returns original text for whitespace-only query", () => {
      const result = highlightText("Hello World", "   ");
      expect(result).toBe("Hello World");
    });
  });

  describe("when query matches", () => {
    it("wraps matching text in mark element", () => {
      const result = highlightText("Hello World", "World");
      render(<>{result}</>);

      const mark = screen.getByText("World");
      expect(mark.tagName).toBe("MARK");
    });

    it("is case-insensitive", () => {
      const result = highlightText("Hello World", "world");
      render(<>{result}</>);

      const mark = screen.getByText("World");
      expect(mark.tagName).toBe("MARK");
    });

    it("highlights multiple occurrences", () => {
      const result = highlightText("foo bar foo baz foo", "foo");
      render(<>{result}</>);

      const marks = screen.getAllByText("foo");
      expect(marks).toHaveLength(3);
      marks.forEach((mark) => {
        expect(mark.tagName).toBe("MARK");
      });
    });

    it("highlights partial matches", () => {
      const result = highlightText("Hello World", "llo");
      render(<>{result}</>);

      const mark = screen.getByText("llo");
      expect(mark.tagName).toBe("MARK");
    });
  });

  describe("when query does not match", () => {
    it("returns text without marks", () => {
      const result = highlightText("Hello World", "xyz");
      render(<>{result}</>);

      expect(screen.queryByRole("mark")).not.toBeInTheDocument();
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });
  });

  describe("special characters handling", () => {
    it("escapes regex special characters in query", () => {
      const result = highlightText("Price: $100.00", "$100");
      render(<>{result}</>);

      const mark = screen.getByText("$100");
      expect(mark.tagName).toBe("MARK");
    });

    it("handles query with brackets", () => {
      const result = highlightText("Array [1, 2, 3]", "[1");
      render(<>{result}</>);

      const mark = screen.getByText("[1");
      expect(mark.tagName).toBe("MARK");
    });

    it("handles query with parentheses", () => {
      const result = highlightText("Function (arg)", "(arg)");
      render(<>{result}</>);

      const mark = screen.getByText("(arg)");
      expect(mark.tagName).toBe("MARK");
    });
  });

  describe("query length limiting", () => {
    it("limits query to 100 characters", () => {
      const longQuery = "a".repeat(150);
      const text = "a".repeat(150);
      // Should not throw and should work with truncated query
      const result = highlightText(text, longQuery);
      expect(result).toBeDefined();
    });
  });

  describe("mark element styling", () => {
    it("applies correct classes to mark element", () => {
      const result = highlightText("Hello World", "World");
      render(<>{result}</>);

      const mark = screen.getByText("World");
      expect(mark).toHaveClass("text-primary", "bg-transparent", "font-bold");
    });
  });
});
