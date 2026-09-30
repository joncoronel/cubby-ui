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
   * The shake className for the field, or `undefined` when no feedback is
   * active. Pass it to `OTPField`: the focused slot and the focus ring shake
   * together.
   *
   * @example
   * ```tsx
   * <OTPField className={invalidFeedback.className} />
   * ```
   */
  className: string | undefined;

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

// Alternated so a repeat invalid entry restarts the animation.
const SHAKE_CLASS_A = "otp-field-shake-a";
const SHAKE_CLASS_B = "otp-field-shake-b";

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
 *   normalizeValue={normalizeTierCode}
 *   className={invalidFeedback.className}
 *   onValueChange={invalidFeedback.handleValueChange}
 *   onValueInvalid={invalidFeedback.handleValueInvalid}
 * >
 *   {Array.from({ length: 6 }, (_, index) => (
 *     <OTPFieldInput key={index} />
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

  const className =
    invalidPulse === 0
      ? undefined
      : invalidPulse % 2 === 0
        ? SHAKE_CLASS_B
        : SHAKE_CLASS_A;

  return {
    className,
    handleValueChange,
    handleValueInvalid,
    statusMessage,
  };
}
