"use client";

import * as React from "react";

interface UseControllableStateParams<T> {
  /** Controlled value. When defined, the hook is in controlled mode. */
  value?: T;
  /** Initial value for uncontrolled mode. */
  defaultValue: T;
  onValueChange?: (value: T) => void;
}

/**
 * Merges controlled and uncontrolled state into a single `[value, setValue]`
 * tuple, mirroring the pattern Radix and Base UI use internally.
 *
 * `onValueChange` fires synchronously in both modes. Functional updates are
 * safe in both modes: they resolve against an eagerly-advanced ref, so
 * multiple `setValue` calls in one event tick compose. `setValue` is
 * referentially stable across renders.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onValueChange,
}: UseControllableStateParams<T>): [T, (next: T | ((prev: T) => T)) => void] {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue);
  const current = isControlled ? (value as T) : uncontrolled;

  const onChangeRef = React.useRef(onValueChange);
  // Mirrors `current`. Re-synced after every commit; eagerly advanced by
  // setValue so multiple calls in one event tick compose.
  const currentRef = React.useRef(current);
  React.useEffect(() => {
    onChangeRef.current = onValueChange;
    currentRef.current = current;
  });

  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = currentRef.current;
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      if (Object.is(resolved, prev)) return;
      if (isControlled) {
        // The parent owns the state, but advance the ref eagerly so a second
        // functional setValue in the same tick composes on this one instead of
        // clobbering it. The ref re-syncs from the prop at the next commit,
        // which also corrects it if the parent rejected the change.
        currentRef.current = resolved;
        onChangeRef.current?.(resolved);
      } else {
        currentRef.current = resolved;
        setUncontrolled(resolved);
        onChangeRef.current?.(resolved);
      }
    },
    [isControlled],
  );

  return [current, setValue];
}
