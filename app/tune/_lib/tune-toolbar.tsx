"use client";

import * as React from "react";
import { DialStore } from "dialkit";
import { useTheme } from "next-themes";
import { Button } from "@/registry/default/button/button";
import { Slider } from "@/registry/default/slider/slider";
import { Toggle } from "@/registry/default/toggle/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/registry/default/toolbar/toolbar";
import type { ScrubPhase } from "./use-css-scrub";

const SPEEDS = [1, 0.25, 0.1] as const;

export type TuneState = {
  /** Drop every override and dial-driven prop to see the shipped component. */
  original: boolean;
  /** Ignore outside presses so clicking the dial panel doesn't close popups. */
  keepOpen: boolean;
  rate: number;
  freeze: boolean;
  phase: ScrubPhase;
  time: number;
};

const INITIAL: TuneState = {
  original: false,
  keepOpen: true,
  rate: 1,
  freeze: false,
  phase: "enter",
  time: 0,
};

/**
 * Page-level playback controls, kept out of DialKit so its Copy output and
 * saved versions hold only component values.
 */
export function useTuneState(): [
  TuneState,
  React.Dispatch<React.SetStateAction<TuneState>>,
] {
  return React.useState(INITIAL);
}

type TuneToolbarProps = {
  state: TuneState;
  setState: React.Dispatch<React.SetStateAction<TuneState>>;
  /** DialKit panel id, reset alongside the toolbar. */
  panelId: string;
  /** Source file the overrides belong to, named in the copied text. */
  file: string;
  /** The page's emitted override CSS; empty when every dial is at default. */
  css: string;
  /**
   * Dial-driven props that left the component default, keyed by component
   * name: `{ PopoverContent: { sideOffset: 12 } }`. Copied as new defaults.
   */
  props?: Record<string, Record<string, unknown>>;
  onReplay: () => void;
  /** Show the keep-open toggle (popups only). */
  keepOpen?: boolean;
  scrubMax?: number;
};

export function TuneToolbar({
  state,
  setState,
  panelId,
  file,
  css,
  props = {},
  onReplay,
  keepOpen = false,
  scrubMax = 1000,
}: TuneToolbarProps): React.ReactElement {
  const { resolvedTheme, setTheme } = useTheme();
  const [copied, setCopied] = React.useState(false);

  function set<K extends keyof TuneState>(key: K, value: TuneState[K]): void {
    setState((current) => ({ ...current, [key]: value }));
  }

  const propLines = Object.entries(props).flatMap(([component, values]) => {
    const entries = Object.entries(values);
    if (entries.length === 0) return [];
    return [
      `/* ${component} prop defaults */`,
      ...entries.map(([key, value]) => `${key}: ${JSON.stringify(value)}`),
    ];
  });
  const hasChanges = Boolean(css) || propLines.length > 0;

  async function copy(): Promise<void> {
    const sections = [
      `/* Tuned changes for ${file}. Apply CSS as Tailwind classes and props as new defaults. */`,
      css,
      propLines.join("\n"),
    ];
    await navigator.clipboard.writeText(
      `${sections.filter(Boolean).join("\n\n")}\n`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function reset(): void {
    DialStore.resetValues(panelId);
    setState((current) => ({ ...INITIAL, keepOpen: current.keepOpen }));
  }

  return (
    <Toolbar className="fixed bottom-4 left-1/2 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap justify-center">
      <ToolbarGroup>
        <Button size="xs" variant="ghost" onClick={onReplay}>
          Replay
        </Button>
        <ToggleGroup
          size="sm"
          aria-label="Playback speed"
          value={[String(state.rate)]}
          onValueChange={(value) => {
            if (value[0]) set("rate", Number(value[0]));
          }}
        >
          {SPEEDS.map((rate) => (
            <ToggleGroupItem
              key={rate}
              value={String(rate)}
              className="text-xs"
            >
              {rate}×
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <Toggle
          size="sm"
          className="text-xs"
          pressed={state.freeze}
          onPressedChange={(pressed) => set("freeze", pressed)}
        >
          Freeze
        </Toggle>
        {state.freeze && (
          <>
            <ToggleGroup
              size="sm"
              aria-label="Scrub phase"
              value={[state.phase]}
              onValueChange={(value) => {
                if (value[0]) set("phase", value[0] as ScrubPhase);
              }}
            >
              <ToggleGroupItem value="enter" className="text-xs">
                Enter
              </ToggleGroupItem>
              <ToggleGroupItem value="exit" className="text-xs">
                Exit
              </ToggleGroupItem>
            </ToggleGroup>
            <Slider
              aria-label="Scrub time"
              className="w-32"
              min={0}
              max={scrubMax}
              value={state.time}
              onValueChange={(value) =>
                set("time", Array.isArray(value) ? (value[0] ?? 0) : value)
              }
            />
            <span className="text-muted-foreground w-12 text-right text-xs tabular-nums">
              {state.time}ms
            </span>
          </>
        )}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <Toggle
          size="sm"
          className="text-xs"
          pressed={state.original}
          onPressedChange={(pressed) => set("original", pressed)}
        >
          Original
        </Toggle>
        {keepOpen && (
          <Toggle
            size="sm"
            className="text-xs"
            pressed={state.keepOpen}
            onPressedChange={(pressed) => set("keepOpen", pressed)}
          >
            Keep open
          </Toggle>
        )}
        <Button
          size="xs"
          variant="ghost"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? "Light" : "Dark"}
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <Button size="xs" variant="ghost" onClick={reset}>
          Reset
        </Button>
        <Button size="xs" disabled={!hasChanges} onClick={copy}>
          {copied ? "Copied" : "Copy changes"}
        </Button>
      </ToolbarGroup>
    </Toolbar>
  );
}
