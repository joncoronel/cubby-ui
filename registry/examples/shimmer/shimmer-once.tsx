"use client";

import * as React from "react";
import { Button } from "@/registry/default/button/button";

export default function ShimmerOnce() {
  const [runId, setRunId] = React.useState(0);

  return (
    <div className="flex h-32 w-full flex-col items-center justify-center gap-4 text-sm">
      <p
        key={runId}
        className="shimmer shimmer-once shimmer-duration-1100 text-muted-foreground"
      >
        Response generated.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setRunId((id) => id + 1)}
      >
        Replay
      </Button>
    </div>
  );
}
