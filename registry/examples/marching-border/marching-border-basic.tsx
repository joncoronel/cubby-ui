"use client";

import * as React from "react";
import { MarchingBorder } from "@/registry/default/marching-border/marching-border";
import { Button } from "@/registry/default/button/button";

export default function MarchingBorderBasic() {
  const [editing, setEditing] = React.useState(true);

  return (
    <div className="flex w-[360px] flex-col items-start gap-3">
      <div className="bg-card text-foreground relative w-full rounded-xl border p-4 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">Bundle: Reading list</h3>
          <p className="text-muted-foreground text-sm">
            3 unsaved changes. Confirm to publish, or discard to revert.
          </p>
        </div>
        {editing && <MarchingBorder className="text-primary" />}
      </div>

      <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}>
        {editing ? "Confirm changes" : "Edit"}
      </Button>
    </div>
  );
}
