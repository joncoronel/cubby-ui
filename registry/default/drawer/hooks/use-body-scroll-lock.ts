import * as React from "react";

/**
 * Lock body scroll when drawer is open
 * This prevents background content from scrolling on mobile and stops
 * URL bar from collapsing/expanding on touch gestures
 */
export function useBodyScrollLock(enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;
    const body = document.body;
    const html = document.documentElement;

    // Store original styles

    const originalOverflow = body.style.overflow;

    const originalHtmlStyles = {
      overscrollBehavior: html.style.overscrollBehavior,
    };

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    html.style.overscrollBehavior = "none";

    return () => {
      // Restore original styles
      body.style.overflow = originalOverflow;
      html.style.overscrollBehavior = originalHtmlStyles.overscrollBehavior;
    };
  }, [enabled]);
}
