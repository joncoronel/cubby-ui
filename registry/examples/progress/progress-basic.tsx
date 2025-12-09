"use client";

import { useState, useEffect } from "react";
import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
} from "@/registry/default/progress/progress";

export default function ProgressBasic() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0; // Reset to 0 when complete
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <ProgressRoot value={progress} animated className="w-[400px]">
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressRoot>
  );
}
