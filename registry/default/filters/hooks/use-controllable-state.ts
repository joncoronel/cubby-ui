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
 * tuple, mirroring the pattern Radix and Base UI use internally. Supports
 * functional updates in both modes.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onValueChange,
}: UseControllableStateParams<T>): [
  T,
  (next: T | ((prev: T) => T)) => void,
] {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue);
  const current = isControlled ? (value as T) : uncontrolled;

  // Mirror the latest render values into refs (in an effect, never during
  // render) so the stable `setValue` callback can read them at event time.
  const currentRef = React.useRef(current);
  const isControlledRef = React.useRef(isControlled);
  const onChangeRef = React.useRef(onValueChange);
  React.useEffect(() => {
    currentRef.current = current;
    isControlledRef.current = isControlled;
    onChangeRef.current = onValueChange;
  });

  const setValue = React.useCallback((next: T | ((prev: T) => T)) => {
    const previous = currentRef.current;
    const resolved =
      typeof next === "function" ? (next as (prev: T) => T)(previous) : next;
    if (Object.is(resolved, previous)) return;
    if (!isControlledRef.current) {
      setUncontrolled(resolved);
    }
    onChangeRef.current?.(resolved);
  }, []);

  return [current, setValue];
}
