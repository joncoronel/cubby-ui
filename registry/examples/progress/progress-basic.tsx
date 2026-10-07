"use client";

import * as React from "react";
import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

export default function ProgressBasic() {
  const [value, setValue] = React.useState(12);

  // Advance in uneven steps, then start over, like a real upload
  React.useEffect(() => {
    const timer = setInterval(() => {
      setValue((prev) =>
        prev >= 100 ? 0 : Math.min(100, prev + Math.random() * 14),
      );
    }, 700);
    return () => clearInterval(timer);
  }, []);

  return (
    <ProgressRoot value={value} className="max-w-sm">
      <ProgressLabel>Uploading assets</ProgressLabel>
      <ProgressValue />
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressRoot>
  );
}
