"use client";

import * as React from "react";
import { Button } from "@/registry/default/button/button";
import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

type Phase = "idle" | "connecting" | "uploading" | "done";

const LABELS: Record<Phase, string> = {
  idle: "quarterly-report.pdf",
  connecting: "Connecting…",
  uploading: "Uploading quarterly-report.pdf",
  done: "Uploaded quarterly-report.pdf",
};

export default function ProgressLifecycle() {
  const [step, setStep] = React.useState<Exclude<Phase, "done">>("idle");
  const [value, setValue] = React.useState(0);

  // "done" is derived, so the upload loop only ever touches the value
  const phase: Phase = step === "uploading" && value >= 100 ? "done" : step;

  React.useEffect(() => {
    if (phase === "connecting") {
      const timeout = setTimeout(() => setStep("uploading"), 1200);
      return () => clearTimeout(timeout);
    }
    if (phase === "uploading") {
      const timer = setInterval(() => {
        setValue((prev) => Math.min(100, prev + Math.random() * 18 + 4));
      }, 400);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const start = () => {
    setValue(0);
    setStep("connecting");
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <ProgressRoot
        value={phase === "connecting" ? null : value}
        variant={phase === "done" ? "success" : "default"}
      >
        <ProgressLabel>{LABELS[phase]}</ProgressLabel>
        <ProgressValue>
          {(formatted) => (phase === "done" ? "Done" : formatted)}
        </ProgressValue>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </ProgressRoot>
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={start}
        disabled={phase === "connecting" || phase === "uploading"}
      >
        {phase === "done" ? "Upload again" : "Upload"}
      </Button>
    </div>
  );
}
