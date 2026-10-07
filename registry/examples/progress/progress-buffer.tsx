"use client";

import * as React from "react";
import {
  ProgressRoot,
  ProgressTrack,
  ProgressBuffer,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

const DURATION = 200;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ProgressBufferExample() {
  const [played, setPlayed] = React.useState(38);
  const [loaded, setLoaded] = React.useState(92);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setPlayed((prev) => (prev >= DURATION ? 0 : prev + 1));
      setLoaded((prev) =>
        prev >= DURATION ? 40 : Math.min(DURATION, prev + 2.5),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const buffer = Math.max(played, loaded);

  return (
    <ProgressRoot
      value={played}
      buffer={buffer}
      max={DURATION}
      size="sm"
      className="max-w-sm"
      getAriaValueText={(_, value) =>
        `${formatTime(value ?? 0)} of ${formatTime(DURATION)}`
      }
    >
      <ProgressLabel>Field recording, take 3</ProgressLabel>
      <ProgressValue>
        {(_, value) => `${formatTime(value ?? 0)} / ${formatTime(DURATION)}`}
      </ProgressValue>
      <ProgressTrack>
        <ProgressBuffer />
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressRoot>
  );
}
