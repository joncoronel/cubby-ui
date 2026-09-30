"use client";

import * as React from "react";
import { TextMorph } from "@/registry/default/text-morph/text-morph";

const MAX_DIGITS = 12;
const formatter = new Intl.NumberFormat("en-US");

/** Where the caret goes in `text` to sit after `count` digits. */
function afterDigits(text: string, count: number): number {
  let seen = 0;
  for (let i = 0; i < text.length && seen < count; i++) {
    if (/\d/.test(text[i])) seen++;
    if (seen === count) return i + 1;
  }
  return count === 0 ? 0 : text.length;
}

export default function TextMorphEditable() {
  const input = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState("1,234");
  const [caret, setCaret] = React.useState<number>();

  // Regrouping rewrites the field, which throws its caret to the end: put it
  // back after the same digits.
  React.useLayoutEffect(() => {
    const field = input.current;
    if (caret === undefined || !field || document.activeElement !== field) {
      return;
    }
    field.setSelectionRange(caret, caret);
  }, [value, caret]);

  return (
    // Clipped at the sides, so a long value runs off the edge instead of
    // overflowing: a scrollbar appearing around it would move the whole line,
    // and every glyph would restart its animation from there.
    <label className="flex w-full max-w-xl cursor-text items-baseline gap-1 overflow-x-clip text-4xl leading-12 font-medium tabular-nums">
      <span aria-hidden="true" className="text-muted-foreground">
        $
      </span>
      <span className="relative min-w-0 flex-1">
        {/* Top-aligned: an inline-block on its baseline stretches its line to
            the new height at once as it grows. */}
        <TextMorph
          value={value}
          cursorIndex={caret}
          className="inline-block align-top"
        />
        {/* The real field, over the number: it takes the typing, selection
            and caret, and only its text is invisible. */}
        <input
          ref={input}
          aria-label="Amount in dollars"
          name="amount"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={value}
          onChange={(event) => {
            const typed = event.target.value;
            const digits = typed.replace(/\D/g, "").slice(0, MAX_DIGITS);
            const next = digits ? formatter.format(BigInt(digits)) : "";
            const before = typed
              .slice(0, event.target.selectionStart ?? typed.length)
              .replace(/\D/g, "").length;
            setCaret(afterDigits(next, before));
            setValue(next);
          }}
          className="caret-foreground placeholder:text-muted-foreground selection:bg-primary/25 absolute inset-0 w-full bg-transparent p-0 text-transparent outline-none"
        />
      </span>
    </label>
  );
}
