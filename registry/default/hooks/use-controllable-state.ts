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
 * Functional updates are safe in both modes: uncontrolled updates resolve
 * through React's own `setState(prev => ...)` queue (so multiple updates in
 * one event tick compose instead of clobbering each other), and controlled
 * updates resolve against the value from the current render.
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
  React.useEffect(() => {
    onChangeRef.current = onValueChange;
  });

  // In uncontrolled mode, notify after commit whenever the state actually
  // changed. This keeps `onValueChange` out of the setState updater (which
  // must stay pure) while still composing batched functional updates.
  const prevUncontrolledRef = React.useRef(uncontrolled);
  React.useEffect(() => {
    if (!Object.is(prevUncontrolledRef.current, uncontrolled)) {
      prevUncontrolledRef.current = uncontrolled;
      onChangeRef.current?.(uncontrolled);
    }
  }, [uncontrolled]);

  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      if (isControlled) {
        const resolved =
          typeof next === "function"
            ? (next as (prev: T) => T)(value as T)
            : next;
        if (!Object.is(resolved, value)) {
          onChangeRef.current?.(resolved);
        }
      } else {
        setUncontrolled(next);
      }
    },
    [isControlled, value],
  );

  return [current, setValue];
}
