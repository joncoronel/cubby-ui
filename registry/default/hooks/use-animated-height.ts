import { useCallback, useEffect, useRef } from "react";

const MIN_FADE_DURATION = 0.15;
const MAX_FADE_DURATION = 0.27;

export function useAnimatedHeight() {
  const outerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const previousHeight = useRef(0);

  const innerRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const outer = outerRef.current;
      if (!outer) return;
      const height = entries[0].target.getBoundingClientRect().height;
      if (height > 0) {
        const diff = Math.abs(height - previousHeight.current);
        previousHeight.current = height;
        const fadeDuration = Math.min(
          Math.max(diff / 500, MIN_FADE_DURATION),
          MAX_FADE_DURATION,
        );

        outer.style.height = `${height}px`;
        outer.style.setProperty("--fade-duration", `${fadeDuration}s`);
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
