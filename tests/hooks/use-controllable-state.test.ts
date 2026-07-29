import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useControllableState } from "@/registry/default/hooks/use-controllable-state";

describe("useControllableState", () => {
  describe("uncontrolled mode", () => {
    it("initializes with defaultValue", () => {
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: "a" }),
      );
      expect(result.current[0]).toBe("a");
    });

    it("updates value and fires onValueChange", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: "a", onValueChange }),
      );

      act(() => result.current[1]("b"));

      expect(result.current[0]).toBe("b");
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith("b");
    });

    it("composes multiple functional updates in one event tick", () => {
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 0 }),
      );

      act(() => {
        result.current[1]((prev) => prev + 1);
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(2);
    });

    it("bails out without firing onValueChange when the value is unchanged", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: "a", onValueChange }),
      );

      act(() => result.current[1]("a"));

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe("controlled mode", () => {
    it("reflects the value prop and fires onValueChange without owning state", () => {
      const onValueChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ value }) =>
          useControllableState({ value, defaultValue: "a", onValueChange }),
        { initialProps: { value: "a" } },
      );

      act(() => result.current[1]("b"));

      // The parent owns the state: the value only moves once the prop does.
      expect(result.current[0]).toBe("a");
      expect(onValueChange).toHaveBeenCalledWith("b");

      rerender({ value: "b" });
      expect(result.current[0]).toBe("b");
    });

    it("composes multiple functional updates in one event tick", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(
        ({ value }) =>
          useControllableState({ value, defaultValue: 0, onValueChange }),
        { initialProps: { value: 0 } },
      );

      act(() => {
        result.current[1]((prev) => prev + 1);
        result.current[1]((prev) => prev + 1);
      });

      // The second update must resolve against the first (1 -> 2), not
      // against the stale committed prop (which would clobber it back to 1).
      expect(onValueChange).toHaveBeenNthCalledWith(1, 1);
      expect(onValueChange).toHaveBeenNthCalledWith(2, 2);
    });

    it("re-syncs from the prop after the parent rejects a change", () => {
      const onValueChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ value }) =>
          useControllableState({ value, defaultValue: 0, onValueChange }),
        { initialProps: { value: 0 } },
      );

      act(() => result.current[1]((prev) => prev + 1));
      expect(onValueChange).toHaveBeenCalledWith(1);

      // Parent rejects: re-renders with the same value.
      rerender({ value: 0 });
      act(() => result.current[1]((prev) => prev + 1));

      // Resolves against the committed prop (0), not the rejected 1.
      expect(onValueChange).toHaveBeenLastCalledWith(1);
    });

    it("bails out without firing onValueChange when the value is unchanged", () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ value: "a", defaultValue: "a", onValueChange }),
      );

      act(() => result.current[1]("a"));

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  it("keeps setValue referentially stable across renders", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState({ value, defaultValue: 0 }),
      { initialProps: { value: 0 } },
    );
    const firstSetValue = result.current[1];

    rerender({ value: 1 });

    expect(result.current[1]).toBe(firstSetValue);
  });
});
