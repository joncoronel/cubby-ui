"use client";

import * as React from "react";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import { Input } from "@/registry/default/input/input";

export default function TextMorphEditable() {
  const [value, setValue] = React.useState("$1,234.50");
  const [caret, setCaret] = React.useState<number>();

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Input
        aria-label="Amount"
        name="amount"
        autoComplete="off"
        value={value}
        onChange={(event) => {
          setCaret(event.target.selectionStart ?? undefined);
          setValue(event.target.value);
        }}
      />
      {/* Clipped at the sides, so a long value runs off the edge instead of
          overflowing: a scrollbar appearing around it would move the whole
          line, and every glyph would restart its animation from there. */}
      <p className="overflow-x-clip text-2xl leading-9 font-medium">
        {/* Top-aligned: an inline-block on its baseline stretches its line to
            the new height at once as it grows. */}
        <TextMorph
          value={value}
          cursorIndex={caret}
          className="inline-block align-top"
        />
      </p>
    </div>
  );
}
