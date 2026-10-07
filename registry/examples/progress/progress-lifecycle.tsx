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
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (phase === "connecting") {
      const timeout = setTimeout(() => setPhase("uploading"), 1200);
      return () => clearTimeout(timeout);
    }
    if (phase === "uploading") {
      const timer = setInterval(() => {
        setValue((prev) => {
          const next = Math.min(100, prev + Math.random() * 18 + 4);
          if (next >= 100) setPhase("done");
          return next;
        });
      }, 400);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const start = () => {
    setValue(0);
    setPhase("connecting");
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
