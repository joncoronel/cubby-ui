import * as React from "react";

export interface UseVirtualKeyboardOptions {
  /** Whether keyboard handling is enabled */
  enabled?: boolean;
}

export interface UseVirtualKeyboardReturn {
  /** Current keyboard height in pixels (0 when closed) */
  keyboardHeight: number;
  /** Whether the virtual keyboard is currently visible */
  isKeyboardVisible: boolean;
}

/**
 * Hook to detect virtual keyboard visibility and height using the Visual Viewport API.
 *
 * On mobile devices, when a virtual keyboard appears, it reduces the visual viewport height.
 * This hook tracks that change so components can adjust their layout accordingly.
 */
export function useVirtualKeyboard({
  enabled = true,
}: UseVirtualKeyboardOptions = {}): UseVirtualKeyboardReturn {
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);

  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    // Store initial viewport height to compare against
    let initialHeight = visualViewport.height;

    const handleResize = () => {
      // The keyboard height is the difference between the initial viewport height
      // and the current viewport height
      const currentHeight = visualViewport.height;
      const heightDiff = initialHeight - currentHeight;

      // Only consider it a keyboard if the difference is significant (> 100px)
      // This avoids false positives from address bar hiding, etc.
      const isKeyboard = heightDiff > 100;

      setKeyboardHeight(isKeyboard ? heightDiff : 0);
      setIsKeyboardVisible(isKeyboard);
    };

    // Also handle scroll to keep track when keyboard scrolls content
    const handleScroll = () => {
      // Re-check on scroll as the viewport may have changed
      handleResize();
    };

    // Update initial height on orientation change
    const handleOrientationChange = () => {
      // Wait a bit for the viewport to settle
      setTimeout(() => {
        initialHeight = visualViewport.height;
        handleResize();
      }, 100);
    };

    visualViewport.addEventListener("resize", handleResize);
    visualViewport.addEventListener("scroll", handleScroll);
    window.addEventListener("orientationchange", handleOrientationChange);

    // Initial check
    handleResize();

    return () => {
      visualViewport.removeEventListener("resize", handleResize);
      visualViewport.removeEventListener("scroll", handleScroll);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [enabled]);

  return {
    keyboardHeight,
    isKeyboardVisible,
  };
}
