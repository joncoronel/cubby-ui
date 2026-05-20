"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/default/input-otp/input-otp";
import { Label } from "@/registry/default/label/label";

export default function InputOtpElevated() {
  const [defaultValue, setDefaultValue] = useState("");
  const [elevatedValue, setElevatedValue] = useState("");

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>On a Card surface</CardTitle>
        <CardDescription>
          Use <code>variant=&quot;elevated&quot;</code> on{" "}
          <code>InputOTPSlot</code> when the field sits inside a Card, Dialog,
          or popover.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Default</Label>
          <InputOTP
            maxLength={6}
            value={defaultValue}
            onChange={setDefaultValue}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Elevated</Label>
          <InputOTP
            maxLength={6}
            value={elevatedValue}
            onChange={setElevatedValue}
          >
            <InputOTPGroup>
              <InputOTPSlot variant="elevated" index={0} />
              <InputOTPSlot variant="elevated" index={1} />
              <InputOTPSlot variant="elevated" index={2} />
              <InputOTPSlot variant="elevated" index={3} />
              <InputOTPSlot variant="elevated" index={4} />
              <InputOTPSlot variant="elevated" index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </CardContent>
    </Card>
  );
}
