import * as React from "react";

import {
  findNestedDialog,
  findParentDialog,
  measureHeightStable,
} from "../lib/nested-dialog-utils";

/**
 * Options for useNestedDialogHeight hook
 */
export interface UseNestedDialogHeightOptions {
  /**
   * Whether to enable nested dialog height synchronization
   * @default true
   */
  enabled?: boolean;
}

/**
 * Return value from useNestedDialogHeight hook
 */
export interface UseNestedDialogHeightReturn {
  /**
   * Ref callback to attach to the dialog popup element
   * Pass this to the ref prop of BaseDialog.Popup
   */
  popupRefCallback: (node: HTMLDivElement | null) => void;

  /**
   * Inline style for smooth height transitions
   * Pass this to the style prop of BaseDialog.Popup
   */
  heightStyle: React.CSSProperties | undefined;
}

/**
 * Hook for managing nested dialog height synchronization
 *
 * This hook provides zero-overhead height synchronization for nested dialogs.
 * It only activates when nesting is actually detected (when Base UI adds the
 * `data-nested-dialog-open` attribute to the parent dialog).
 *
 * Features:
 * - Lazy activation: stays dormant until nesting is detected
 * - Smooth transitions: animates height changes with requestAnimationFrame
 * - Multi-level support: propagates height changes to all ancestor dialogs
 * - Portal-aware: works with React Portals by using DOM order instead of hierarchy
 *
 * @param options - Configuration options
 * @returns Object with ref callback and height style
 *
 * @example
 * ```tsx
 * function DialogContent({ children, ...props }) {
 *   const { popupRefCallback, heightStyle } = useNestedDialogHeight();
 *
 *   return (
 *     <BaseDialog.Popup
 *       ref={popupRefCallback}
 *       style={heightStyle}
 *       {...props}
 *     >
 *       {children}
 *     </BaseDialog.Popup>
 *   );
 * }
 * ```
 */
export function useNestedDialogHeight(
  options: UseNestedDialogHeightOptions = {},
): UseNestedDialogHeightReturn {
  const { enabled = true } = options;

  // Height state for smooth transitions
  const [height, setHeight] = React.useState<number | null>(null);

  // Refs for cleanup and state management
  const observerRef = React.useRef<MutationObserver | null>(null);
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const eventHandlerRef = React.useRef<EventListener | null>(null);
  const targetHeightRef = React.useRef<number | null>(null);

  // Track whether full sync system is activated (lazy initialization)
  const isActiveRef = React.useRef(false);

  /**
   * Handle custom height change events from descendant dialogs
   */
  const handleHeightChangeEvent = React.useCallback(
    (e: Event, node: HTMLElement) => {
      const customEvent = e as CustomEvent<number>;
      customEvent.stopPropagation();

      const newHeight = customEvent.detail;

      // Skip redundant updates if already animating to this height
      if (
        targetHeightRef.current !== null &&
        Math.abs(targetHeightRef.current - newHeight) < 1
      ) {
        return;
      }

      const currentHeight = node.offsetHeight;
      targetHeightRef.current = newHeight;

      // Animate to the new height
      setHeight(currentHeight);
      requestAnimationFrame(() => {
        setHeight(newHeight);

        // Propagate to parent dialogs
        const parent = findParentDialog(node);
        if (parent) {
          parent.dispatchEvent(
            new CustomEvent("nested-dialog-height-change", {
              detail: newHeight,
              bubbles: false,
            }),
          );
        }
      });
    },
    [],
  );

  /**
   * Activate full synchronization system
   * Called lazily when nesting is first detected
   */
  const activateFullSync = React.useCallback(
    (node: HTMLElement) => {
      // Setup custom event listener for propagation
      const handler = (e: Event) => {
        handleHeightChangeEvent(e, node);
      };

      eventHandlerRef.current = handler as EventListener;
      node.addEventListener("nested-dialog-height-change", handler);
    },
    [handleHeightChangeEvent],
  );

  /**
   * Handle nested dialog opening
   * Measures the child dialog and animates this dialog to match
   */
  const handleNestedDialogOpen = React.useCallback(
    async (node: HTMLElement) => {
      const currentHeight = node.offsetHeight;
      const nestedDialog = findNestedDialog(node);

      if (!nestedDialog) return;

      // Wait for nested dialog to fully render and stabilize
      const targetHeight = await measureHeightStable(nestedDialog);
      targetHeightRef.current = targetHeight;

      // Animate to target height
      setHeight(currentHeight);
      requestAnimationFrame(() => {
        setHeight(targetHeight);

        // Propagate to parent dialogs
        const parent = findParentDialog(node);
        if (parent) {
          parent.dispatchEvent(
            new CustomEvent("nested-dialog-height-change", {
              detail: targetHeight,
              bubbles: false,
            }),
          );
        }
      });
    },
    [],
  );

  /**
   * Handle nested dialog closing
   * Animates this dialog back to its natural height
   */
  const handleNestedDialogClose = React.useCallback((node: HTMLElement) => {
    // Capture current height
    const currentHeight = node.offsetHeight;

    // Temporarily remove height to measure natural size
    const originalHeight = node.style.height;
    node.style.height = "auto";
    const naturalHeight = node.offsetHeight;
    node.style.height = originalHeight;

    // Store the target height we're animating to
    targetHeightRef.current = naturalHeight;

    // Set current height in state (converts from auto to px)
    setHeight(currentHeight);

    // Next frame: animate to natural height
    requestAnimationFrame(() => {
      setHeight(naturalHeight);

      // Notify parent dialogs of height change
      const parent = findParentDialog(node);
      if (parent) {
        parent.dispatchEvent(
          new CustomEvent("nested-dialog-height-change", {
            detail: naturalHeight,
            bubbles: false,
          }),
        );
      }
    });

    // After transition completes, remove explicit height
    const handleTransitionEnd = (e: TransitionEvent) => {
      // Only handle height transitions on this element
      if (e.propertyName === "height" && e.target === node) {
        setHeight(null);
        targetHeightRef.current = null;
        node.removeEventListener("transitionend", handleTransitionEnd);
      }
    };

    node.addEventListener("transitionend", handleTransitionEnd);
  }, []);

  /**
   * Setup minimal mutation observer
   * Watches for data-nested-dialog-open attribute changes
   */
  const setupMinimalObserver = React.useCallback(
    (node: HTMLElement) => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.attributeName === "data-nested-dialog-open") {
            // Nesting detected! Activate full synchronization (lazy)
            if (!isActiveRef.current) {
              isActiveRef.current = true;
              activateFullSync(node);
            }

            // Handle height changes
            if (node.hasAttribute("data-nested-dialog-open")) {
              handleNestedDialogOpen(node);
            } else {
              handleNestedDialogClose(node);
            }
          }
        }
      });

      observer.observe(node, { attributes: true });
      observerRef.current = observer;
    },
    [activateFullSync, handleNestedDialogOpen, handleNestedDialogClose],
  );

  /**
   * Ref callback for the dialog popup element
   */
  const popupRefCallback = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!enabled) return;

      // Cleanup previous observer and event listener
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (nodeRef.current && eventHandlerRef.current) {
        nodeRef.current.removeEventListener(
          "nested-dialog-height-change",
          eventHandlerRef.current,
        );
        eventHandlerRef.current = null;
      }

      // Reset state
      isActiveRef.current = false;
      targetHeightRef.current = null;
      setHeight(null);

      if (!node) {
        nodeRef.current = null;
        return;
      }

      nodeRef.current = node;

      // Setup minimal observer (always active, but lightweight)
      setupMinimalObserver(node);
    },
    [enabled, setupMinimalObserver],
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (nodeRef.current && eventHandlerRef.current) {
        nodeRef.current.removeEventListener(
          "nested-dialog-height-change",
          eventHandlerRef.current,
        );
      }
    };
  }, []);

  // Return style only when height is set (with GPU compositing hints for better performance)
  const heightStyle =
    height !== null
      ? {
          height: `${height}px`,
          // GPU compositing hint to improve performance
          willChange: "height" as const,
        }
      : undefined;

  return {
    popupRefCallback,
    heightStyle,
  };
}
