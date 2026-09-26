"use client";

import * as React from "react";
import { MorphText } from "@/components/docs/morph-text";
import { PACKAGE_MANAGERS, type PackageManager } from "./use-package-manager";

/**
 * A shell command whose package-manager words morph when the reader
 * switches tabs: `npx` becomes `pnpm dlx`, and the words every manager
 * shares slide over as the ones before them resize. Each part keeps the
 * syntax color Shiki gives it (the github-light/dark themes), so it reads
 * exactly like the highlighted block.
 */

type Tone = "command" | "arg" | "flag";

const TONES: Record<Tone, string> = {
  command: "light-dark(#6F42C1, #B392F0)",
  arg: "light-dark(#032F62, #9ECBFF)",
  flag: "light-dark(#005CC5, #79B8FF)",
};

type Part = { text: string; tone: Tone; morph: boolean };

const toneOf = (word: string): Tone => (word.startsWith("-") ? "flag" : "arg");

/**
 * The command as parts that line up across package managers: the command
 * word, the words between it and the ending every manager shares (as an
 * argument part and a flag part, one of them empty), then that shared
 * ending, which never changes.
 */
export function commandParts(
  commands: Record<PackageManager, string>,
  pm: PackageManager,
): Part[] {
  const all = PACKAGE_MANAGERS.map((p) => commands[p].split(" "));
  const first = all[0];
  let shared = 0;
  while (
    all.every(
      (words) =>
        words.length - shared > 1 &&
        words[words.length - 1 - shared] === first[first.length - 1 - shared],
    )
  ) {
    shared++;
  }

  const words = commands[pm].split(" ");
  const middle = words.slice(1, words.length - shared);
  const middleText = middle.length > 0 ? ` ${middle.join(" ")}` : "";
  const flag = middle.length > 0 && toneOf(middle[0]) === "flag";
  return [
    { text: words[0], tone: "command", morph: true },
    { text: flag ? "" : middleText, tone: "arg", morph: true },
    { text: flag ? middleText : "", tone: "flag", morph: true },
    ...words
      .slice(words.length - shared)
      .map((word) => ({ text: ` ${word}`, tone: toneOf(word), morph: false })),
  ];
}

export function CommandMorph({
  parts,
  animate,
}: {
  parts: Part[];
  /** Morph on change; off for changes the reader didn't make. */
  animate: boolean;
}): React.ReactElement {
  return (
    <code>
      <span className="line">
        {parts.map((part, i) => (
          <span key={i} style={{ color: TONES[part.tone] }}>
            {part.morph ? (
              <MorphText feedback disabled={!animate}>
                {part.text}
              </MorphText>
            ) : (
              part.text
            )}
          </span>
        ))}
      </span>
    </code>
  );
}
