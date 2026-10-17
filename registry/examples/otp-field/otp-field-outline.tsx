"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import { Label } from "@/registry/default/label/label";
import {
  OTPField,
  OTPFieldInput,
} from "@/registry/default/otp-field/otp-field";

const OTP_LENGTH = 6;

export default function OtpFieldOutline() {
  const defaultId = React.useId();
  const outlineId = React.useId();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Default and outline</CardTitle>
        <CardDescription>
          Both read on a Card. <code>outline</code> takes the outline
          Button&apos;s fill and edge.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={defaultId}>Default</Label>
          <OTPField id={defaultId} length={OTP_LENGTH}>
            {Array.from({ length: OTP_LENGTH }, (_, index) => (
              <OTPFieldInput
                key={index}
                aria-label={`Character ${index + 1} of ${OTP_LENGTH}`}
              />
            ))}
          </OTPField>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={outlineId}>Outline</Label>
          <OTPField id={outlineId} length={OTP_LENGTH}>
            {Array.from({ length: OTP_LENGTH }, (_, index) => (
              <OTPFieldInput
                key={index}
                variant="outline"
                aria-label={`Character ${index + 1} of ${OTP_LENGTH}`}
              />
            ))}
          </OTPField>
        </div>
      </CardContent>
    </Card>
  );
}
