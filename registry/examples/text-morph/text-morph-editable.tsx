"use client";

import * as React from "react";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import { Input } from "@/registry/default/input/input";

export default function TextMorphEditable() {
  const [value, setValue] = React.useState("1200");
  const [caret, setCaret] = React.useState<number>();

  return (
    <div className="flex w-64 flex-col gap-4">
      <Input
        aria-label="Amount"
        inputMode="numeric"
        value={value}
        onChange={(event) => {
          setCaret(event.target.selectionStart ?? undefined);
          setValue(event.target.value);
        }}
      />
      <p className="font-display text-3xl font-semibold tabular-nums">
        $<TextMorph value={value || "0"} cursorIndex={caret} />
      </p>
    </div>
  );
}
