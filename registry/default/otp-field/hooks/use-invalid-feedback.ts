"use client";

import * as React from "react";

export interface UseInvalidFeedbackOptions {
  /**
   * Duration in ms before the shake animation clears.
   * @default 400
   */
  duration?: number;
}

export interface UseInvalidFeedbackReturn {
  /**
   * Returns the invalid animation className for a given input index,
   * or `undefined` when no feedback is active. Merge with `cn()`.
   *
   * @example
   * ```tsx
   * <OTPFieldInput className={invalidFeedback.getInvalidClassName(index)} />
   * ```
   */
  getInvalidClassName: (index: number) => string | undefined;

  /**
   * Call in each input's `onFocus` to track which slot is active.
   *
   * @example
   * ```tsx
   * <OTPFieldInput onFocus={() => invalidFeedback.setFocusedIndex(index)} />
   * ```
   */
  setFocusedIndex: (index: number) => void;

  /**
   * Clears invalid feedback when the value changes.
   * Wire to OTPField's `onValueChange`.
   *
   * @example
   * ```tsx
   * <OTPField onValueChange={invalidFeedback.handleValueChange} />
   * ```
   */
  handleValueChange: () => void;

  /**
   * Triggers invalid feedback animation and status message.
   * Wire to OTPField's `onValueInvalid`.
   *
   * @example
   * ```tsx
   * <OTPField onValueInvalid={invalidFeedback.handleValueInvalid} />
   * ```
   */
  handleValueInvalid: (value: string) => void;

  /**
   * Screen reader status message. Render inside an `aria-live` region.
   *
   * @example
   * ```tsx
   * <span aria-live="polite" className="sr-only">
   *   {invalidFeedback.statusMessage}
   * </span>
   * ```
   */
  statusMessage: string;
}

const SHAKE_CLASS_A =
  "animate-otp-field-shake-a focus:outline-destructive/80 motion-reduce:animate-none";
const SHAKE_CLASS_B =
  "animate-otp-field-shake-b focus:outline-destructive/80 motion-reduce:animate-none";

/**
 * Hook that manages shake animation and screen reader feedback
 * for invalid OTP input.
 *
 * @example
 * ```tsx
 * const invalidFeedback = useInvalidFeedback();
 *
 * <OTPField
 *   length={6}
 *   validationType="none"
 *   sanitizeValue={sanitizeTierCode}
 *   onValueChange={invalidFeedback.handleValueChange}
 *   onValueInvalid={invalidFeedback.handleValueInvalid}
 * >
 *   {Array.from({ length: 6 }, (_, index) => (
 *     <OTPFieldInput
 *       key={index}
 *       className={invalidFeedback.getInvalidClassName(index)}
 *       onFocus={() => invalidFeedback.setFocusedIndex(index)}
 *     />
 *   ))}
 * </OTPField>
 * <span aria-live="polite" className="sr-only">
 *   {invalidFeedback.statusMessage}
 * </span>
 * ```
 */
export function useInvalidFeedback(
  options: UseInvalidFeedbackOptions = {},
): UseInvalidFeedbackReturn {
  const { duration = 400 } = options;

  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const [invalidPulse, setInvalidPulse] = React.useState(0);
  const [statusMessage, setStatusMessage] = React.useState("");
  const invalidTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const skipClearOnNextValueChangeRef = React.useRef(false);

  React.useEffect(() => {
    return () => {
      if (invalidTimeoutRef.current != null) {
        clearTimeout(invalidTimeoutRef.current);
      }
    };
  }, []);

  function handleValueChange() {
    if (skipClearOnNextValueChangeRef.current) {
      skipClearOnNextValueChangeRef.current = false;
      return;
    }

    if (invalidTimeoutRef.current != null) {
      clearTimeout(invalidTimeoutRef.current);
      invalidTimeoutRef.current = null;
    }
    setInvalidPulse(0);
    setStatusMessage("");
  }

  function handleValueInvalid(value: string) {
    skipClearOnNextValueChangeRef.current = true;
    setInvalidPulse((current) => current + 1);
    setStatusMessage(`Unsupported characters were ignored from ${value}.`);

    if (invalidTimeoutRef.current != null) {
      clearTimeout(invalidTimeoutRef.current);
    }

    invalidTimeoutRef.current = setTimeout(() => {
      invalidTimeoutRef.current = null;
      setInvalidPulse(0);
    }, duration);
  }

  const activeInvalidIndex = invalidPulse > 0 ? focusedIndex : -1;
  const invalidClassName =
    invalidPulse === 0
      ? undefined
      : invalidPulse % 2 === 0
        ? SHAKE_CLASS_B
        : SHAKE_CLASS_A;

  const getInvalidClassName = React.useCallback(
    (index: number) =>
      activeInvalidIndex === index ? invalidClassName : undefined,
    [activeInvalidIndex, invalidClassName],
  );

  return {
    getInvalidClassName,
    setFocusedIndex,
    handleValueChange,
    handleValueInvalid,
    statusMessage,
  };
}
