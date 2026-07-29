import { useCallback, useEffect, useRef } from "react";

const MIN_FADE_DURATION = 0.15;
const MAX_FADE_DURATION = 0.27;

/**
 * Tracks the inner element's height and writes it onto the outer element, plus
 * a size-adaptive `--fade-duration`.
 *
 * `onResize` runs after each write with the measured height and the outer
 * element. Consumers driving their own height animation use it to retarget when
 * content resizes mid-flight. It's held in a ref, so passing an inline function
 * won't tear down and rebuild the observer on every render. Pass a stable
 * callback if it reads state: the ref syncs in a passive effect (after paint)
 * while the observer fires before it, so an inline closure can be a render late.
 */
export function useAnimatedHeight(
  onResize?: (height: number, outer: HTMLElement) => void,
) {
  const outerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const previousHeight = useRef(0);

  // Held in a ref rather than `useEffectEvent`: the observer is attached from a
  // callback ref, and an effect event closed over inside that `useCallback`
  // trips the React Compiler's memoization check (it wants the event in the
  // deps, which effect events must never go in). Refs are recognized as stable,
  // so this keeps the observer from rebuilding on every render.
  const onResizeRef = useRef(onResize);
  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  const innerRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const outer = outerRef.current;
      if (!outer) return;
      // Use the layout border-box height, not `getBoundingClientRect`. The
      // bounding rect includes ancestor transforms (e.g. a parent popover's
      // open-time `scale-95` → `scale-100`), which previously caused this
      // hook to write the *scaled* height onto the outer element on first
      // observation — under-sizing the container until a later layout
      // change happened to trigger another ResizeObserver tick.
      const entry = entries[0];
      const height =
        entry.borderBoxSize?.[0]?.blockSize ??
        (entry.target as HTMLElement).offsetHeight;
      if (height > 0) {
        const diff = Math.abs(height - previousHeight.current);
        previousHeight.current = height;
        const fadeDuration = Math.min(
          Math.max(diff / 500, MIN_FADE_DURATION),
          MAX_FADE_DURATION,
        );

        outer.style.height = `${height}px`;
        outer.style.setProperty("--fade-duration", `${fadeDuration}s`);
        onResizeRef.current?.(height, outer);
      }
    });

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { outerRef, innerRef };
}
