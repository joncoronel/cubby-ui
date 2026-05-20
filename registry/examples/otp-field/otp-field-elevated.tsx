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

export default function OtpFieldElevated() {
  const defaultId = React.useId();
  const elevatedId = React.useId();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>On a Card surface</CardTitle>
        <CardDescription>
          Use <code>variant=&quot;elevated&quot;</code> on{" "}
          <code>OTPFieldInput</code> when the field sits inside a Card, Dialog,
          or popover.
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
          <Label htmlFor={elevatedId}>Elevated</Label>
          <OTPField id={elevatedId} length={OTP_LENGTH}>
            {Array.from({ length: OTP_LENGTH }, (_, index) => (
              <OTPFieldInput
                key={index}
                variant="elevated"
                aria-label={`Character ${index + 1} of ${OTP_LENGTH}`}
              />
            ))}
          </OTPField>
        </div>
      </CardContent>
    </Card>
  );
}
