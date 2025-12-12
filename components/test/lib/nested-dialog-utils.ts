/**
 * Utility functions for nested dialog height synchronization
 *
 * These utilities help manage height coordination between nested dialogs when
 * they are rendered through React Portals (which breaks DOM parent-child relationships).
 */

/**
 * Find parent dialog by DOM order
 *
 * Since dialogs are portaled to document.body, they are siblings in the DOM
 * rather than parent-child. The parent is the dialog that appears immediately
 * before the current one in DOM order.
 *
 * @param currentNode - The current dialog element
 * @returns The parent dialog element, or null if this is the root dialog
 */
export function findParentDialog(
  currentNode: HTMLElement,
): HTMLElement | null {
  const allDialogs = Array.from(
    document.querySelectorAll('[role="dialog"]'),
  );
  const currentIndex = allDialogs.indexOf(currentNode);
  return currentIndex > 0
    ? (allDialogs[currentIndex - 1] as HTMLElement)
    : null;
}

/**
 * Find nested (child) dialog
 *
 * Finds the most recently added dialog that doesn't have the nesting attribute.
 * Uses reverse() to find the last dialog in DOM order (most recently opened).
 *
 * @param currentNode - The current dialog element
 * @returns The nested dialog element, or undefined if no child dialog exists
 */
export function findNestedDialog(
  currentNode: HTMLElement,
): HTMLElement | undefined {
  const allDialogs = document.querySelectorAll('[role="dialog"]');
  return Array.from(allDialogs)
    .reverse()
    .find(
      (p) =>
        p !== currentNode && !p.hasAttribute("data-nested-dialog-open"),
    ) as HTMLElement | undefined;
}

/**
 * Measure element height with layout stability
 *
 * Uses double requestAnimationFrame to ensure the element is fully rendered
 * and styled before measurement. This prevents measuring height before
 * CSS transitions or layout calculations are complete.
 *
 * @param element - The element to measure
 * @returns Promise that resolves with the element's offsetHeight
 */
export function measureHeightStable(element: HTMLElement): Promise<number> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve(element.offsetHeight);
      });
    });
  });
}
