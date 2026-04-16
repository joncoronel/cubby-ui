"use client";

import * as React from "react";
import {
  OTPField,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSeparator,
} from "@/registry/default/otp-field/otp-field";

const OTP_LENGTH = 6;

export default function OtpFieldGrouped() {
  const id = React.useId();

  return (
    <div className="flex w-full max-w-80 flex-col items-start gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        Verification code
      </label>
      <OTPField id={id} length={OTP_LENGTH}>
        <OTPFieldGroup>
          {Array.from({ length: 3 }, (_, index) => (
            <OTPFieldInput
              key={index}
              aria-label={`Character ${index + 1} of ${OTP_LENGTH}`}
            />
          ))}
        </OTPFieldGroup>
        <OTPFieldSeparator />
        <OTPFieldGroup>
          {Array.from({ length: 3 }, (_, index) => (
            <OTPFieldInput
              key={index + 3}
              aria-label={`Character ${index + 4} of ${OTP_LENGTH}`}
            />
          ))}
        </OTPFieldGroup>
      </OTPField>
    </div>
  );
}
