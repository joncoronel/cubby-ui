import * as React from "react";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";

/**
 * The virtualizer instance type. Use to type a ref that receives
 * the virtualizer via the `virtualizerRef` option.
 */
export type ListVirtualizerInstance = ReturnType<
  typeof useVirtualizer<HTMLDivElement, Element>
>;

/**
 * Returns a stable `onItemHighlighted` handler that scrolls the virtualizer
 * to the highlighted item on keyboard navigation.
 *
 * Use this on the Root component when the virtualizer lives in a child
 * component (e.g. when using `useFilteredItems`).
 */
export function useHighlightHandler(
  virtualizerRef: React.RefObject<ListVirtualizerInstance | null>,
) {
  return React.useCallback(
    (
      item: unknown,
      {
        reason,
        index,
      }: { reason: "none" | "keyboard" | "pointer"; index: number },
    ) => {
      const virtualizer = virtualizerRef.current;
      if (!item || !virtualizer) return;

      const isStart = index === 0;
      const isEnd = index === virtualizer.options.count - 1;

      const shouldScroll =
        reason === "none" || (reason === "keyboard" && (isStart || isEnd));

      if (shouldScroll) {
        queueMicrotask(() => {
          virtualizer.scrollToIndex(index, {
            align: isEnd ? "start" : "end",
          });
        });
      }
    },
    // virtualizerRef is a stable ref object
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
}

export interface UseListVirtualizerOptions<T> {
  /**
   * Whether virtualization is enabled.
   * Typically tied to whether the list container is open/visible.
   * @default true
   */
  enabled?: boolean;

  /**
   * All items in the list (unfiltered).
   * Used by Base UI Autocomplete for proper aria-setsize.
   */
  items: T[];

  /**
   * The filtered items to display.
   * Can be the same as `items` if no filtering is applied (e.g., server-side filtering).
   */
  filteredItems: T[];

  /**
   * Estimated height of each item in pixels, or a function that returns
   * the estimate for each item. Used for initial layout before measurement.
   * @default 40
   */
  estimateSize?: number | ((index: number, item: T) => number);

  /**
   * Number of items to render outside the visible area.
   * Higher values = smoother scrolling, more memory.
   * @default 20
   */
  overscan?: number;

  /**
   * Padding at the start of the list in pixels.
   * Should match the list container's padding.
   * @default 8
   */
  paddingStart?: number;

  /**
   * Padding at the end of the list in pixels.
   * @default 8
   */
  paddingEnd?: number;

  /**
   * Ref to expose the virtualizer instance to a parent component.
   * When provided, the virtualizer is exposed via `useImperativeHandle`.
   * Use with `createHighlightHandler` for the `useFilteredItems` pattern.
   */
  virtualizerRef?: React.RefObject<ListVirtualizerInstance | null>;
}

export interface UseListVirtualizerReturn<T> {
  /**
   * Props to spread on the root component (Autocomplete.Root).
   * Includes: virtualized, items, filteredItems, onItemHighlighted
   */
  rootProps: {
    virtualized: true;
    items: T[];
    filteredItems: T[];
    onItemHighlighted: (
      item: T | null | undefined,
      details: { reason: "none" | "keyboard" | "pointer"; index: number }
    ) => void;
  };

  /**
   * Ref callback for the scroll container element.
   * Attach to a div wrapping the virtual items.
   */
  scrollRef: (element: HTMLDivElement | null) => void;

  /**
   * Ref callback for measuring individual items.
   * Attach to each list item for dynamic height support.
   */
  measureRef: (element: HTMLDivElement | null) => void;

  /**
   * Total height of all virtual items in pixels.
   * Use for the height of the placeholder container.
   */
  totalSize: number;

  /**
   * Array of virtual items to render.
   * Each contains: key, index, start, size
   */
  virtualItems: VirtualItem[];

  /**
   * Get the item at a virtual index.
   * Convenience method: filteredItems[virtualItem.index]
   */
  getItem: (virtualItem: { index: number }) => T | undefined;

  /**
   * Get inline styles for a virtual item.
   * Returns: { position, top, left, right, transform }
   */
  getItemStyle: (virtualItem: { start: number }) => React.CSSProperties;

  /**
   * Get aria attributes and props for a virtual item.
   * Returns: { 'aria-setsize', 'aria-posinset', 'data-index', index }
   */
  getItemProps: (virtualItem: { index: number }) => {
    "aria-setsize": number;
    "aria-posinset": number;
    "data-index": number;
    index: number;
  };
}

export function useListVirtualizer<T>(
  options: UseListVirtualizerOptions<T>
): UseListVirtualizerReturn<T> {
  const {
    enabled: _enabled = true,
    items,
    filteredItems,
    estimateSize = 40,
    overscan = 20,
    paddingStart = 8,
    paddingEnd = 8,
    virtualizerRef,
  } = options;

  const scrollElementRef = React.useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    // Don't pass `enabled` to virtualizer - let it always calculate sizes
    // to prevent height jumping during close animation
    count: filteredItems.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize:
      typeof estimateSize === "function"
        ? (index) => estimateSize(index, filteredItems[index])
        : () => estimateSize,
    overscan,
    paddingStart,
    paddingEnd,
    scrollPaddingStart: paddingStart,
    scrollPaddingEnd: paddingEnd,
  });

  // Expose virtualizer to parent when ref is provided
  React.useImperativeHandle(virtualizerRef, () => virtualizer, [virtualizer]);

  // Ref callback that stores the element and triggers measurement
  const scrollRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      scrollElementRef.current = element;
      if (element) {
        virtualizer.measure();
      }
    },
    [virtualizer]
  );

  // Handler for keyboard/pointer navigation scroll-to-index
  const onItemHighlighted = React.useCallback(
    (
      item: T | null | undefined,
      {
        reason,
        index,
      }: { reason: "none" | "keyboard" | "pointer"; index: number }
    ) => {
      if (item == null) return;

      const isStart = index === 0;
      const isEnd = index === filteredItems.length - 1;

      // Scroll on initial highlight or keyboard navigation at edges
      const shouldScroll =
        reason === "none" || (reason === "keyboard" && (isStart || isEnd));

      if (shouldScroll) {
        queueMicrotask(() => {
          virtualizer.scrollToIndex(index, {
            align: isEnd ? "start" : "end",
          });
        });
      }
    },
    [filteredItems.length, virtualizer]
  );

  const getItem = React.useCallback(
    (virtualItem: { index: number }) => filteredItems[virtualItem.index],
    [filteredItems]
  );

  const getItemStyle = React.useCallback(
    (virtualItem: { start: number }): React.CSSProperties => ({
      position: "absolute",
      top: 0,
      left: 0,
      right: 0, // Use right: 0 instead of width: 100% so margins work correctly
      // No explicit height - let content determine size for dynamic measurement
      transform: `translateY(${virtualItem.start}px)`,
    }),
    []
  );

  const getItemProps = React.useCallback(
    (virtualItem: { index: number }) => ({
      "aria-setsize": filteredItems.length,
      "aria-posinset": virtualItem.index + 1,
      "data-index": virtualItem.index,
      index: virtualItem.index,
    }),
    [filteredItems.length]
  );

  return {
    rootProps: {
      virtualized: true,
      items,
      filteredItems,
      onItemHighlighted,
    },
    scrollRef,
    measureRef: virtualizer.measureElement as (
      element: HTMLDivElement | null
    ) => void,
    totalSize: filteredItems.length > 0 ? virtualizer.getTotalSize() : 0,
    virtualItems: virtualizer.getVirtualItems(),
    getItem,
    getItemStyle,
    getItemProps,
  };
}
