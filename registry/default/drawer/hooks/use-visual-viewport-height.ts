import * as React from "react";

export interface UseVisualViewportHeightOptions {
  /** Whether tracking is enabled */
  enabled?: boolean;
}

/**
 * Hook to track the visual viewport height using the Visual Viewport API.
 *
 * On mobile devices, the visual viewport height changes when the URL bar
 * collapses/expands. This hook provides real-time tracking of the actual
 * visible viewport height, which can be used to size elements that need
 * to fill the visible area regardless of URL bar state.
 *
 * @returns The current visual viewport height in pixels, or null if not available
 */
export function useVisualViewportHeight({
  enabled = true,
}: UseVisualViewportHeightOptions = {}): number | null {
  const [height, setHeight] = React.useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    return window.visualViewport?.height ?? null;
  });

  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const handleResize = () => {
      setHeight(visualViewport.height);
    };

    // Set initial value
    handleResize();

    visualViewport.addEventListener("resize", handleResize);
    return () => visualViewport.removeEventListener("resize", handleResize);
  }, [enabled]);

  return height;
}
