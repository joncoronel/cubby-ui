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
 *
 * A controlled parent may reject a change by not re-rendering. Asking for the
 * same value again in a later event still notifies it, so a validating parent
 * gets a fresh chance to accept; a repeat within the same tick does not.
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
  // The value as last rendered, which the eager ref above can run ahead of.
  const renderedRef = React.useRef(current);
  // Set while a controlled change notified in this tick is still unanswered.
  const notifiedRef = React.useRef(false);
  React.useEffect(() => {
    onChangeRef.current = onValueChange;
    currentRef.current = current;
    renderedRef.current = current;
  });

  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = currentRef.current;
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      if (isControlled) {
        // A parent that rejected `prev` never re-rendered, so the ref still
        // holds it: skip it only while it is shown or was just sent.
        if (
          Object.is(resolved, prev) &&
          (Object.is(resolved, renderedRef.current) || notifiedRef.current)
        )
          return;
        // The parent owns the state, but advance the ref eagerly so a second
        // functional setValue in the same tick composes on this one instead of
        // clobbering it. The ref re-syncs from the prop at the next commit.
        currentRef.current = resolved;
        notifiedRef.current = true;
        queueMicrotask(() => {
          notifiedRef.current = false;
        });
        onChangeRef.current?.(resolved);
      } else {
        if (Object.is(resolved, prev)) return;
        currentRef.current = resolved;
        setUncontrolled(resolved);
        onChangeRef.current?.(resolved);
      }
    },
    [isControlled],
  );

  return [current, setValue];
}
