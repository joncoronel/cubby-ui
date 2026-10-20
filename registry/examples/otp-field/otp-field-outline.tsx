"use client";

import * as React from "react";
import { Label } from "@/registry/default/label/label";
import {
  OTPField,
  OTPFieldInput,
} from "@/registry/default/otp-field/otp-field";

const OTP_LENGTH = 6;

export default function OtpFieldOutline() {
  const id = React.useId();

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>Verification code</Label>
      <OTPField id={id} length={OTP_LENGTH}>
        {Array.from({ length: OTP_LENGTH }, (_, index) => (
          <OTPFieldInput
            key={index}
            variant="outline"
            aria-label={`Character ${index + 1} of ${OTP_LENGTH}`}
          />
        ))}
      </OTPField>
    </div>
  );
}
