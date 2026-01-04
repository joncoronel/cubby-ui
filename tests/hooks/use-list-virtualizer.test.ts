import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useListVirtualizer } from "@/registry/default/hooks/use-list-virtualizer";

interface TestItem {
  id: number;
  name: string;
}

describe("useListVirtualizer", () => {
  const items: TestItem[] = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }));

  const defaultOptions = {
    items,
    filteredItems: items,
  };

  describe("rootProps", () => {
    it("returns virtualized flag as true", () => {
      const { result } = renderHook(() => useListVirtualizer(defaultOptions));
      expect(result.current.rootProps.virtualized).toBe(true);
    });

    it("includes items and filteredItems", () => {
      const { result } = renderHook(() => useListVirtualizer(defaultOptions));
      expect(result.current.rootProps.items).toBe(items);
      expect(result.current.rootProps.filteredItems).toBe(items);
    });

    it("includes onItemHighlighted callback", () => {
      const { result } = renderHook(() => useListVirtualizer(defaultOptions));
      expect(typeof result.current.rootProps.onItemHighlighted).toBe(
        "function",
      );
    });
  });

  describe("getItem", () => {
    it("returns item at virtual index", () => {
      const { result } = renderHook(() => useListVirtualizer(defaultOptions));
      const item = result.current.getItem({ index: 5 });
      expect(item).toEqual({ id: 5, name: "Item 5" });
    });

    it("returns undefined for out of bounds index", () => {
      const { result } = renderHook(() => useListVirtualizer(defaultOptions));
      const item = result.current.getItem({ index: 999 });
      expect(item).toBeUndefined();
    });
  });

  describe("getItemStyle", () => {
    it("returns absolute positioning styles", () => {
      const { result } = renderHook(() => useListVirtualizer(defaultOptions));
      const style = result.current.getItemStyle({ start: 100 });

      expect(style.position).toBe("absolute");
      expect(style.top).toBe(0);
      expect(style.left).toBe(0);
      expect(style.right).toBe(0);
      expect(style.transform).toBe("translateY(100px)");
    });

    it("uses start value for transform", () => {
      const { result } = renderHook(() => useListVirtualizer(defaultOptions));
      const style = result.current.getItemStyle({ start: 250 });
      expect(style.transform).toBe("translateY(250px)");
    });
  });

  describe("getItemProps", () => {
    it("returns aria-setsize based on filteredItems length", () => {
      const { result } = renderHook(() => useListVirtualizer(defaultOptions));
      const props = result.current.getItemProps({ index: 0 });
      expect(props["aria-setsize"]).toBe(100);
    });

    it("returns aria-posinset as 1-indexed position", () => {
      const { result } = renderHook(() => useListVirtualizer(defaultOptions));
      const props = result.current.getItemProps({ index: 5 });
      expect(props["aria-posinset"]).toBe(6); // 1-indexed
    });

    it("returns data-index and index", () => {
      const { result } = renderHook(() => useListVirtualizer(defaultOptions));
      const props = result.current.getItemProps({ index: 10 });
      expect(props["data-index"]).toBe(10);
      expect(props.index).toBe(10);
    });
  });

  describe("with filtered items", () => {
    it("uses filteredItems for aria-setsize", () => {
      const filteredItems = items.slice(0, 10);
      const { result } = renderHook(() =>
        useListVirtualizer({
          items,
          filteredItems,
        }),
      );

      const props = result.current.getItemProps({ index: 0 });
      expect(props["aria-setsize"]).toBe(10);
    });

    it("getItem returns from filteredItems", () => {
      const filteredItems = items.filter((item) => item.id >= 50);
      const { result } = renderHook(() =>
        useListVirtualizer({
          items,
          filteredItems,
        }),
      );

      // Index 0 of filteredItems is item with id 50
      const item = result.current.getItem({ index: 0 });
      expect(item?.id).toBe(50);
    });
  });

  describe("totalSize", () => {
    it("returns 0 when filteredItems is empty", () => {
      const { result } = renderHook(() =>
        useListVirtualizer({
          items,
          filteredItems: [],
        }),
      );
      expect(result.current.totalSize).toBe(0);
    });
  });

  describe("refs", () => {
    it("provides scrollRef callback", () => {
      const { result } = renderHook(() => useListVirtualizer(defaultOptions));
      expect(typeof result.current.scrollRef).toBe("function");
    });

    it("provides measureRef callback", () => {
      const { result } = renderHook(() => useListVirtualizer(defaultOptions));
      expect(typeof result.current.measureRef).toBe("function");
    });
  });

  describe("virtualItems", () => {
    it("returns array of virtual items", () => {
      const { result } = renderHook(() => useListVirtualizer(defaultOptions));
      expect(Array.isArray(result.current.virtualItems)).toBe(true);
    });
  });
});
