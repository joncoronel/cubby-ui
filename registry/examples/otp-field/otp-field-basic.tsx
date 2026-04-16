"use client";

import * as React from "react";
import {
  OTPField,
  OTPFieldInput,
} from "@/registry/default/otp-field/otp-field";

const OTP_LENGTH = 6;

export default function OtpFieldBasic() {
  const id = React.useId();
  const descriptionId = `${id}-description`;

  return (
    <div className="flex w-full max-w-80 flex-col items-start gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        Verification code
      </label>
      <OTPField
        id={id}
        length={OTP_LENGTH}
        aria-describedby={descriptionId}
      >
        {Array.from({ length: OTP_LENGTH }, (_, index) => (
          <OTPFieldInput
            key={index}
            aria-label={`Character ${index + 1} of ${OTP_LENGTH}`}
          />
        ))}
      </OTPField>
      <p id={descriptionId} className="text-muted-foreground m-0 text-sm">
        Enter the 6-character code we sent to your device.
      </p>
    </div>
  );
}
