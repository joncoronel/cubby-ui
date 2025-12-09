"use client";

import { useState } from "react";
import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

export default function ProgressDynamic() {
  const [progress, setProgress] = useState(20);

  const handleProgress = () => {
    setProgress((prev) => Math.min(prev + 20, 100));
  };

  const handleReset = () => {
    setProgress(0);
  };

  return (
    <div className="space-y-4">
      <ProgressRoot value={progress} animated className="w-[400px]">
        <div className="flex items-center justify-between">
          <ProgressLabel>Upload Progress</ProgressLabel>
          <ProgressValue format={(v) => `${v}%`} />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </ProgressRoot>

      <div className="flex gap-2">
        <button
          onClick={handleProgress}
          disabled={progress >= 100}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          +20%
        </button>
        <button
          onClick={handleReset}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md px-4 py-2 text-sm font-medium"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
