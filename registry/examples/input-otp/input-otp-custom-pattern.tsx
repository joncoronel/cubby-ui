"use client";

import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/default/input-otp/input-otp";

export default function InputOtpCustomPattern() {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-2">
      <InputOTP
        maxLength={4}
        value={value}
        onChange={setValue}
        pattern="^[0-9]+$"
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
      <p className="text-sm text-muted-foreground">
        Enter numbers only. Value: {value}
      </p>
    </div>
  );
}