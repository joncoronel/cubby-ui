"use client";

import * as React from "react";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import { Button } from "@/registry/default/button/button";

const LABELS = ["Draft saved", "Changes saved", "Not saved yet", "All saved"];

export default function TextMorphModes() {
  const [index, setIndex] = React.useState(0);
  const label = LABELS[index];

  return (
    <div className="flex flex-col items-center gap-6">
      <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-3 text-lg">
        <dt className="text-muted-foreground text-sm">morph</dt>
        <dd>
          <TextMorph value={label} options={{ mode: "morph" }} />
        </dd>
        <dt className="text-muted-foreground text-sm">roll</dt>
        <dd>
          <TextMorph value={label} options={{ mode: "roll" }} />
        </dd>
      </dl>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIndex((i) => (i + 1) % LABELS.length)}
      >
        Change label
      </Button>
    </div>
  );
}
