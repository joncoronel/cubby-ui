"use client";

import * as React from "react";
import {
  OTPField,
  OTPFieldInput,
} from "@/registry/default/otp-field/otp-field";
import { useInvalidFeedback } from "@/registry/default/otp-field/hooks/use-invalid-feedback";

const CODE_LENGTH = 6;

function sanitizeTierCode(value: string) {
  return value.replace(/[^0-3]/g, "");
}

export default function OtpFieldCustomSanitization() {
  const id = React.useId();
  const descriptionId = `${id}-description`;
  const invalidFeedback = useInvalidFeedback();

  return (
    <div className="flex w-full max-w-80 flex-col items-start gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        Tier code
      </label>
      <OTPField
        id={id}
        length={CODE_LENGTH}
        validationType="none"
        inputMode="numeric"
        sanitizeValue={sanitizeTierCode}
        onValueChange={invalidFeedback.handleValueChange}
        onValueInvalid={invalidFeedback.handleValueInvalid}
        aria-describedby={descriptionId}
      >
        {Array.from({ length: CODE_LENGTH }, (_, index) => (
          <OTPFieldInput
            key={index}
            className={invalidFeedback.getInvalidClassName(index)}
            aria-label={`Character ${index + 1} of ${CODE_LENGTH}`}
            onFocus={() => invalidFeedback.setFocusedIndex(index)}
          />
        ))}
      </OTPField>
      <p id={descriptionId} className="text-muted-foreground m-0 text-sm">
        Digits <code className="font-mono">0-3</code> only.
      </p>
      <span aria-live="polite" className="sr-only">
        {invalidFeedback.statusMessage}
      </span>
    </div>
  );
}
