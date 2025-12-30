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
 * Helper to check if element is an input that would trigger a virtual keyboard.
 */
function isInput(element: HTMLElement | null): boolean {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    element.isContentEditable
  );
}

/**
 * Detect Firefox mobile which natively handles keyboard repositioning.
 * We skip our custom transform on Firefox to avoid double-repositioning.
 */
const isFirefoxMobile =
  typeof navigator !== "undefined" &&
  /Firefox/i.test(navigator.userAgent) &&
  /Android|Mobile/i.test(navigator.userAgent);

/**
 * Hook to detect virtual keyboard visibility and height using the Visual Viewport API.
 *
 * On mobile devices, when a virtual keyboard appears, it reduces the visual viewport height.
 * This hook tracks that change so components can adjust their layout accordingly.
 *
 * Simplified approach:
 * - Keyboard is visible if viewport is significantly smaller (>100px) AND an input is focused
 * - No complex toggle state that can get out of sync
 */
export function useVirtualKeyboard({
  enabled = true,
}: UseVirtualKeyboardOptions = {}): UseVirtualKeyboardReturn {
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  React.useEffect(() => {
    // Firefox mobile natively handles keyboard repositioning, so we skip
    // our custom detection to avoid double-repositioning the drawer
    if (!enabled || typeof window === "undefined" || isFirefoxMobile) return;

    // Enable Virtual Keyboard API to get env(keyboard-inset-*) CSS variables
    // This tells the browser that we'll handle the virtual keyboard geometry ourselves
    if ("virtualKeyboard" in navigator) {
      (navigator as Navigator & { virtualKeyboard: { overlaysContent: boolean } })
        .virtualKeyboard.overlaysContent = true;
    }

    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const handleResize = () => {
      const focusedElement = document.activeElement as HTMLElement;
      const isInputFocused = isInput(focusedElement);

      // If no input is focused, keyboard can't be open for our purposes
      if (!isInputFocused) {
        setKeyboardHeight(0);
        return;
      }

      const visualViewportHeight = visualViewport.height;
      const totalHeight = window.innerHeight;
      const diff = totalHeight - visualViewportHeight;

      // Keyboard is visible if viewport is significantly smaller (>100px threshold)
      // This avoids false positives from address bar changes
      if (diff > 100) {
        setKeyboardHeight(diff);
      } else {
        setKeyboardHeight(0);
      }
    };

    visualViewport.addEventListener("resize", handleResize);

    // Initial check in case keyboard is already open
    handleResize();

    return () => visualViewport.removeEventListener("resize", handleResize);
  }, [enabled]);

  return {
    keyboardHeight,
    isKeyboardVisible: keyboardHeight > 0,
  };
}
