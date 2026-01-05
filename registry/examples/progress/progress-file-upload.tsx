"use client";

import { useState } from "react";
import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

export default function ProgressFileUpload() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const simulateUpload = () => {
    setIsUploading(true);
    setProgress(0);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsUploading(false);
          return 100;
        }
        // Simulate variable upload speeds
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 200);
  };

  return (
    <div className="space-y-4">
      <ProgressRoot value={progress} animated className="w-[400px]">
        <div className="flex items-center justify-between">
          <ProgressLabel>
            {progress === 100 ? "Upload Complete" : "Uploading document.pdf"}
          </ProgressLabel>
          <ProgressValue format={(v) => `${Math.round(v ?? 0)}%`} />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </ProgressRoot>

      <button
        onClick={simulateUpload}
        disabled={isUploading}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Start Upload"}
      </button>
    </div>
  );
}
