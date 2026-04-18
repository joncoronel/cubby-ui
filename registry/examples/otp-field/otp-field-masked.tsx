"use client";

import * as React from "react";
import {
  OTPField,
  OTPFieldInput,
} from "@/registry/default/otp-field/otp-field";

const CODE_LENGTH = 6;

export default function OtpFieldMasked() {
  const id = React.useId();
  const descriptionId = `${id}-description`;

  return (
    <div className="flex w-full max-w-80 flex-col items-start gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        Access code
      </label>
      <OTPField
        id={id}
        length={CODE_LENGTH}
        mask
        aria-describedby={descriptionId}
      >
        {Array.from({ length: CODE_LENGTH }, (_, index) => (
          <OTPFieldInput
            key={index}
            aria-label={`Character ${index + 1} of ${CODE_LENGTH}`}
          />
        ))}
      </OTPField>
      <p id={descriptionId} className="text-muted-foreground m-0 text-sm">
        Use <code className="font-mono">mask</code> to obscure the code on
        shared screens.
      </p>
    </div>
  );
}
