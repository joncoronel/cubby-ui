"use client";

import * as React from "react";
import {
  ProgressRoot,
  ProgressCircle,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

export default function ProgressCircleExample() {
  const [value, setValue] = React.useState(18);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setValue((prev) =>
        prev >= 100 ? 0 : Math.min(100, prev + Math.random() * 16),
      );
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-10">
      <ProgressRoot value={value} aria-label="Rendering video">
        <ProgressCircle size={64}>
          <ProgressValue />
        </ProgressCircle>
      </ProgressRoot>

      <div className="flex flex-col gap-4">
        <ProgressRoot value={value}>
          <ProgressCircle size={20} />
          <ProgressLabel>Rendering video</ProgressLabel>
        </ProgressRoot>
        <ProgressRoot value={null}>
          <ProgressCircle size={20} />
          <ProgressLabel>Waiting for worker</ProgressLabel>
        </ProgressRoot>
      </div>
    </div>
  );
}
