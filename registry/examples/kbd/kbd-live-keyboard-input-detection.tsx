"use client";

import * as React from "react";
import { Kbd } from "@/registry/default/kbd/kbd";

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

// `code` is the KeyboardEvent.key value; `keys` is how the cap reads.
const MODIFIERS = [
  { code: "Shift", keys: ["shift"] },
  { code: "Control", keys: ["ctrl"] },
  { code: "Alt", keys: ["alt"] },
  { code: "Meta", keys: ["meta"] },
];

const MODIFIER_CODES = new Set(MODIFIERS.map((modifier) => modifier.code));

function normalize(key: string): string {
  return key.length === 1 ? key.toUpperCase() : key;
}

export default function KbdLiveKeyboardInputDetection() {
  const [held, setHeld] = React.useState<Set<string>>(() => new Set());

  React.useEffect(() => {
    const isMac = /mac|iphone|ipad/i.test(navigator.userAgent);
    const handleKeyDown = (event: KeyboardEvent): void => {
      const key = normalize(event.key);
      setHeld((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
    };
    const handleKeyUp = (event: KeyboardEvent): void => {
      const key = normalize(event.key);
      setHeld((prev) => {
        // macOS fires no keyup for a letter released while Cmd is held, so
        // letting go of Cmd releases everything but the other modifiers.
        // Other platforms report every release, so they skip this.
        if (isMac && key === "Meta") {
          return new Set(
            [...prev].filter((k) => k !== "Meta" && MODIFIER_CODES.has(k)),
          );
        }
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };
    // A key released while the window is blurred never fires keyup.
    const handleBlur = (): void => setHeld(new Set());

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-1.5">
      {ROWS.map((row) => (
        <div key={row[0]} className="flex gap-1.5">
          {row.map((key) => (
            <Kbd key={key} size="lg" pressed={held.has(key)}>
              {key}
            </Kbd>
          ))}
        </div>
      ))}
      <div className="mt-1.5 flex gap-1.5">
        {MODIFIERS.map((modifier) => (
          <Kbd
            key={modifier.code}
            size="lg"
            keys={modifier.keys}
            pressed={held.has(modifier.code)}
          />
        ))}
        <Kbd size="lg" pressed={held.has(" ")} className="w-24">
          Space
        </Kbd>
      </div>
    </div>
  );
}
