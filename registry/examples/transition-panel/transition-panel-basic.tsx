"use client";

import * as React from "react";
import {
  TransitionPanel,
  TransitionPanelView,
} from "@/registry/default/transition-panel/transition-panel";
import { Button } from "@/registry/default/button/button";
import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";

type Step = "email" | "code" | "done";

export default function TransitionPanelBasic() {
  const [step, setStep] = React.useState<Step>("email");

  return (
    <TransitionPanel
      activeKey={step}
      className="w-[360px] rounded-xl border bg-card shadow-sm"
    >
      <TransitionPanelView viewKey="email">
        <div className="space-y-3 p-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Sign in</h3>
            <p className="text-muted-foreground text-sm">
              Enter your email to receive a code.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tp-email">Email</Label>
            <Input id="tp-email" type="email" placeholder="you@example.com" />
          </div>
          <Button className="w-full" onClick={() => setStep("code")}>
            Continue
          </Button>
        </div>
      </TransitionPanelView>

      <TransitionPanelView viewKey="code">
        <div className="space-y-3 p-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Check your email</h3>
            <p className="text-muted-foreground text-sm">
              We sent a 6-digit code. Paste it below.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tp-code">Verification code</Label>
            <Input id="tp-code" inputMode="numeric" placeholder="123456" />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep("email")}
            >
              Back
            </Button>
            <Button className="flex-1" onClick={() => setStep("done")}>
              Verify
            </Button>
          </div>
        </div>
      </TransitionPanelView>

      <TransitionPanelView viewKey="done">
        <div className="space-y-3 p-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">You&apos;re in</h3>
            <p className="text-muted-foreground text-sm">
              Welcome back. Heading to your dashboard.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setStep("email")}
          >
            Start over
          </Button>
        </div>
      </TransitionPanelView>
    </TransitionPanel>
  );
}
