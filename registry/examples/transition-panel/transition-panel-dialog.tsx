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
  OTPField,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSeparator,
} from "@/registry/default/otp-field/otp-field";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldErrorSlot,
  FieldLabel,
} from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";
import { Button } from "@/registry/default/button/button";
import { QRCode } from "@/registry/default/qr-code/qr-code";

type Step = "scan" | "verify" | "recovery";

const MANUAL_CODE = "JBSW Y3DP EHPK 3PXP";
const CORRECT_CODE = "123456";

// otpauth URI the QR encodes — built from the same secret shown as the manual
// code so the two stay in sync. A real app would generate the secret server-side.
const OTP_SECRET = MANUAL_CODE.replace(/\s/g, "");
const OTP_AUTH_URI = `otpauth://totp/Cubby%20UI:alex@example.com?secret=${OTP_SECRET}&issuer=Cubby%20UI`;

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

export default function TransitionPanelDialog() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>("scan");
  const [code, setCode] = React.useState("");
  const [showError, setShowError] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Reset to a clean state whenever the dialog opens, so re-opening always
  // starts at the first step. Resetting on open (not close) avoids a flash of
  // step one while the dialog plays its close animation.
  const handleOpenChange = React.useCallback((next: boolean) => {
    if (next) {
      setStep("scan");
      setCode("");
      setShowError(false);
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
      <Button onClick={() => handleOpenChange(true)}>
        Set up authenticator
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={false} className="sm:max-w-[390px]">
          <DialogTitle className="sr-only">
            Set up authenticator app
          </DialogTitle>
          <DialogDescription className="sr-only">
            Scan the QR code, verify a six-digit code, then save your recovery
            codes.
          </DialogDescription>

          <TransitionPanel activeKey={step} transition="fade">
            <TransitionPanelView viewKey="scan" className="px-6 pt-8 pb-6">
              <div className="flex flex-col items-center text-center">
                <HugeiconsIcon
                  icon={LockIcon}
                  className="size-6"
                  strokeWidth={2}
                />
                <h2 className="mt-4 text-lg font-semibold tracking-tight">
                  Set Up Authenticator App
                </h2>
                <p className="text-muted-foreground mt-2 text-sm text-balance">
                  Scan this QR code with your authenticator app like Google
                  Authenticator, 1Password, Authy, etc.
                </p>
                <div className="mt-6">
                  <QRCode
                    value={OTP_AUTH_URI}
                    size={192}
                    aria-label="Authenticator setup QR code"
                  />
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
              <Form
                onFormSubmit={() => {
                  if (code === CORRECT_CODE) {
                    setStep("recovery");
                  } else {
                    setShowError(true);
                  }
                }}
                className="flex flex-col items-center text-center"
              >
                <HugeiconsIcon
                  icon={LockIcon}
                  className="size-6"
                  strokeWidth={2}
                />
                <h2 className="mt-4 text-lg font-semibold tracking-tight">
                  Set Up Authenticator App
                </h2>
                {/* Field is a flex column to center its contents. The error
                    slot needs `min-h-0` so its interpolate-size height tween
                    isn't clamped by the flex item's automatic min-height. */}
                <Field
                  name="code"
                  invalid={showError}
                  className="mt-2 flex flex-col items-center"
                >
                  <FieldLabel className="sr-only">Verification code</FieldLabel>
                  <FieldDescription className="text-balance">
                    Enter the 6-digit code from your authenticator app to verify
                    setup.
                  </FieldDescription>
                  <OTPField
                    value={code}
                    onValueChange={(value) => {
                      setCode(value);
                      setShowError(false);
                    }}
                    length={6}
                    inputMode="numeric"
                  >
                    <OTPFieldGroup>
                      {Array.from({ length: 3 }, (_, index) => (
                        <OTPFieldInput variant="elevated" key={index} />
                      ))}
                    </OTPFieldGroup>
                    <OTPFieldSeparator />
                    <OTPFieldGroup>
                      {Array.from({ length: 3 }, (_, index) => (
                        <OTPFieldInput variant="elevated" key={index + 3} />
                      ))}
                    </OTPFieldGroup>
                  </OTPField>
                  <FieldErrorSlot className="min-h-0">
                    <FieldError match={showError} className="pt-2">
                      That code isn&apos;t right. Try again.
                    </FieldError>
                  </FieldErrorSlot>
                </Field>
                <div className="mt-6 flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep("scan");
                      setShowError(false);
                    }}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={code.length < 6}>
                    Verify
                  </Button>
                </div>
              </Form>
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
