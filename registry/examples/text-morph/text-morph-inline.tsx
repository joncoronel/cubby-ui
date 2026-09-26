"use client";

import * as React from "react";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import { Button } from "@/registry/default/button/button";

const TARGETS = ["production-eu", "staging", "preview-4821", "dev"];

export default function TextMorphInline() {
  const [index, setIndex] = React.useState(0);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-base">
        Deploying to{" "}
        <TextMorph
          value={TARGETS[index]}
          className="font-mono text-sm font-medium"
        />{" "}
        in the next window.
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIndex((i) => (i + 1) % TARGETS.length)}
      >
        Change target
      </Button>
    </div>
  );
}
