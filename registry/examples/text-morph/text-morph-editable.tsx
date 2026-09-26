"use client";

import * as React from "react";
import {
  MODE_DEFAULTS,
  TextMorph,
  faster,
} from "@/registry/default/text-morph/text-morph";
import { Input } from "@/registry/default/input/input";

// Keystrokes come faster than the default timing, so the same look runs on
// half the clock.
const TYPING = faster(MODE_DEFAULTS.morph, 0.5);

export default function TextMorphEditable() {
  const [value, setValue] = React.useState("1200");
  const [caret, setCaret] = React.useState<number>();

  return (
    <div className="flex w-64 flex-col gap-4">
      <Input
        aria-label="Amount"
        name="amount"
        autoComplete="off"
        inputMode="numeric"
        value={value}
        onChange={(event) => {
          setCaret(event.target.selectionStart ?? undefined);
          setValue(event.target.value);
        }}
      />
      <p className="font-display text-3xl font-semibold tabular-nums">
        $
        <TextMorph value={value || "0"} cursorIndex={caret} options={TYPING} />
      </p>
    </div>
  );
}
