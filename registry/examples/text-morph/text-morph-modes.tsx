"use client";

import * as React from "react";
import {
  TextMorph,
  type TextMorphMode,
} from "@/registry/default/text-morph/text-morph";
import { Button } from "@/registry/default/button/button";

const LABELS = ["Draft saved", "Changes saved", "Not saved yet", "All saved"];

export default function TextMorphModes() {
  const [index, setIndex] = React.useState(0);
  const [mode, setMode] = React.useState<TextMorphMode>("morph");

  // Each button moves to the next label in its own mode, so both play on
  // the same text.
  const next = (nextMode: TextMorphMode): void => {
    setMode(nextMode);
    setIndex((i) => (i + 1) % LABELS.length);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <TextMorph value={LABELS[index]} options={{ mode }} className="text-lg" />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => next("morph")}>
          Morph
        </Button>
        <Button size="sm" variant="outline" onClick={() => next("roll")}>
          Roll
        </Button>
      </div>
    </div>
  );
}
