"use client";

import * as React from "react";
import {
  ProgressRoot,
  ProgressCircle,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

interface Attachment {
  id: string;
  name: string;
  size: string;
  /** Ticks spent queued before the upload starts. */
  delay: number;
}

const ATTACHMENTS: Attachment[] = [
  { id: "brief", name: "launch-brief.pdf", size: "2.4 MB", delay: 0 },
  { id: "deck", name: "investor-deck.key", size: "18.1 MB", delay: 3 },
  { id: "notes", name: "call-notes.md", size: "12 KB", delay: 6 },
];

export default function ProgressCircleAttachments() {
  const [tick, setTick] = React.useState(0);

  // Uploads start in turn, finish, then the list resets
  React.useEffect(() => {
    const timer = setInterval(() => setTick((t) => (t >= 24 ? 0 : t + 1)), 450);
    return () => clearInterval(timer);
  }, []);

  return (
    <ul className="divide-border flex w-full max-w-sm flex-col divide-y">
      {ATTACHMENTS.map((file) => {
        const elapsed = tick - file.delay;
        const value = elapsed < 0 ? null : Math.min(100, elapsed * 14);
        const done = value === 100;

        return (
          <li key={file.id} className="py-3">
            <ProgressRoot value={value} variant={done ? "success" : "default"}>
              <ProgressCircle size={18} />
              <ProgressLabel className="min-w-0 truncate">
                {file.name}
              </ProgressLabel>
              <ProgressValue className="ml-auto">
                {(formatted) => (done ? file.size : formatted)}
              </ProgressValue>
              {value === null && (
                <span className="text-muted-foreground ml-auto text-sm">
                  Queued
                </span>
              )}
            </ProgressRoot>
          </li>
        );
      })}
    </ul>
  );
}
