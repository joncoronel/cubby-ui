"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockIcon, File01Icon } from "@hugeicons/core-free-icons";
import {
  TransitionPanel,
  TransitionPanelView,
} from "@/registry/default/transition-panel/transition-panel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/registry/default/dialog/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/registry/default/input-otp/input-otp";
import { Button } from "@/registry/default/button/button";

type Step = "scan" | "verify" | "recovery";

const MANUAL_CODE = "JBSW Y3DP EHPK 3PXP";

const RECOVERY_CODES = [
  "a1b2c-3d4e5",
  "f6g7h-8i9j0",
  "k1l2m-3n4o5",
  "p6q7r-8s9t0",
  "u1v2w-3x4y5",
  "z6a7b-8c9d0",
  "e1f2g-3h4i5",
  "j6k7l-8m9n0",
];

// Decorative QR placeholder — a deterministic pattern with three finder
// squares so it reads as a QR code without pulling in a generator dependency.
function QrPlaceholder() {
  const SIZE = 25;
  const inBox = (x: number, y: number, ox: number, oy: number) =>
    x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
  const finder = (x: number, y: number, ox: number, oy: number) => {
    const lx = x - ox;
    const ly = y - oy;
    const ring = lx === 0 || ly === 0 || lx === 6 || ly === 6;
    const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
    return ring || core;
  };

  const cells: React.ReactElement[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let on: boolean;
      if (inBox(x, y, 0, 0)) on = finder(x, y, 0, 0);
      else if (inBox(x, y, SIZE - 7, 0)) on = finder(x, y, SIZE - 7, 0);
      else if (inBox(x, y, 0, SIZE - 7)) on = finder(x, y, 0, SIZE - 7);
      else on = (x * 3 + y * 7 + x * y) % 3 === 0;
      if (on) {
        cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="text-foreground size-48 [shape-rendering:crispEdges]"
      fill="currentColor"
      role="img"
      aria-label="Authenticator setup QR code"
    >
      {cells}
    </svg>
  );
}

export default function TransitionPanelDialog() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>("scan");
  const [code, setCode] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  // Reset to a clean state whenever the dialog opens, so re-opening always
  // starts at the first step. Resetting on open (not close) avoids a flash of
  // step one while the dialog plays its close animation.
  const handleOpenChange = React.useCallback((next: boolean) => {
    if (next) {
      setStep("scan");
      setCode("");
      setCopied(false);
    }
    setOpen(next);
  }, []);

  const handleCopy = React.useCallback(() => {
    navigator.clipboard?.writeText(RECOVERY_CODES.join("\n"));
    setCopied(true);
  }, []);

  React.useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <>
      <Button onClick={() => handleOpenChange(true)}>Set up authenticator</Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={false} className="sm:max-w-[390px]">
          <DialogTitle className="sr-only">Set up authenticator app</DialogTitle>
          <DialogDescription className="sr-only">
            Scan the QR code, verify a six-digit code, then save your recovery
            codes.
          </DialogDescription>

          <TransitionPanel activeKey={step} transition="fade">
            <TransitionPanelView viewKey="scan" className="px-6 pt-8 pb-6">
              <div className="flex flex-col items-center text-center">
                <HugeiconsIcon icon={LockIcon} className="size-6" strokeWidth={2} />
                <h2 className="mt-4 text-lg font-semibold tracking-tight">
                  Set Up Authenticator App
                </h2>
                <p className="text-muted-foreground mt-2 text-sm text-balance">
                  Scan this QR code with your authenticator app like Google
                  Authenticator, 1Password, Authy, etc.
                </p>
                <div className="mt-6">
                  <QrPlaceholder />
                </div>
                <p className="text-muted-foreground mt-6 text-sm">
                  Or enter this code manually
                </p>
                <p className="mt-1 font-mono text-sm font-medium tracking-wider">
                  {MANUAL_CODE}
                </p>
                <Button className="mt-6" onClick={() => setStep("verify")}>
                  Continue
                </Button>
              </div>
            </TransitionPanelView>

            <TransitionPanelView viewKey="verify" className="px-6 pt-8 pb-6">
              <div className="flex flex-col items-center text-center">
                <HugeiconsIcon icon={LockIcon} className="size-6" strokeWidth={2} />
                <h2 className="mt-4 text-lg font-semibold tracking-tight">
                  Set Up Authenticator App
                </h2>
                <p className="text-muted-foreground mt-2 text-sm text-balance">
                  Enter the 6-digit code from your authenticator app to verify
                  setup.
                </p>
                <div className="mt-6">
                  <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="mt-6 flex justify-center gap-2">
                  <Button variant="outline" onClick={() => setStep("scan")}>
                    Back
                  </Button>
                  <Button
                    disabled={code.length < 6}
                    onClick={() => setStep("recovery")}
                  >
                    Verify
                  </Button>
                </div>
              </div>
            </TransitionPanelView>

            <TransitionPanelView viewKey="recovery" className="px-6 pt-8 pb-6">
              <div className="flex flex-col items-center text-center">
                <HugeiconsIcon
                  icon={File01Icon}
                  className="size-6"
                  strokeWidth={2}
                />
                <h2 className="mt-4 text-lg font-semibold tracking-tight">
                  Save your recovery codes
                </h2>
                <p className="text-muted-foreground mt-2 text-sm text-balance">
                  Store these somewhere safe. Each code can be used once if you
                  lose access to your authenticator app.
                </p>
                <div className="bg-muted mt-6 grid w-full grid-cols-2 gap-x-6 gap-y-2 rounded-xl p-4 font-mono text-sm">
                  {RECOVERY_CODES.map((recoveryCode) => (
                    <span key={recoveryCode}>{recoveryCode}</span>
                  ))}
                </div>
                <div className="mt-6 flex justify-center gap-2">
                  <Button variant="outline" onClick={handleCopy}>
                    {copied ? "Copied!" : "Copy codes"}
                  </Button>
                  <Button onClick={() => handleOpenChange(false)}>Done</Button>
                </div>
              </div>
            </TransitionPanelView>
          </TransitionPanel>
        </DialogContent>
      </Dialog>
    </>
  );
}
