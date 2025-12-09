"use client";

import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/default/input-otp/input-otp";

export default function InputOtpCustomStyling() {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-2">
      <InputOTP
        maxLength={4}
        value={value}
        onChange={setValue}
        className="gap-2"
      >
        <InputOTPGroup className="gap-2">
          <InputOTPSlot index={0} className="rounded-md border-2" />
          <InputOTPSlot index={1} className="rounded-md border-2" />
          <InputOTPSlot index={2} className="rounded-md border-2" />
          <InputOTPSlot index={3} className="rounded-md border-2" />
        </InputOTPGroup>
      </InputOTP>
      <p className="text-sm text-muted-foreground">Value: {value}</p>
    </div>
  );
}