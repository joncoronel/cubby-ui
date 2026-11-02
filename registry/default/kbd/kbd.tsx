"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const kbdVariants = cva(
  // Set in the UI face: the base layer gives `kbd` the mono font, which made
  // keys read as code. No variant takes a border: edges are inset shadows,
  // as on surfaces, so they follow the radius and every variant lines up.
  // No text color either: a key wears the ink of the text around it, so it
  // reads in muted copy, a tooltip or a primary button alike.
  "inline-flex shrink-0 items-center justify-center gap-0.5 font-sans font-medium whitespace-nowrap transition-[background-color,box-shadow,translate] duration-100 ease-out data-pressed:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-4.5 min-w-4.5 rounded-xs px-1 text-[0.6875rem] [&_svg]:size-3",
        md: "h-5 min-w-5 rounded-xs px-1.5 text-xs [&_svg]:size-3",
        lg: "h-6 min-w-6 rounded-sm px-2 text-[0.8125rem] [&_svg]:size-3.5",
      },
      variant: {
        // Keycap: a translucent fill of the current ink, so one key reads on
        // any plate it lands on, plus a 1px lip (shade below on a light plate,
        // lit rim above on a dark one) that sets it apart from an inline code
        // chip. The inverse surface is the other theme, so it flips the lip
        // and takes its own chip step (--muted, 10%). On a button's solid
        // fill 7% vanishes, so a key there takes twice the step.
        default: [
          "bg-[color-mix(in_oklab,currentColor_var(--kbd-fill),transparent)] shadow-(--kbd-lip) data-pressed:bg-[color-mix(in_oklab,currentColor_calc(var(--kbd-fill)_+_4%),transparent)] data-pressed:shadow-none",
          "[--kbd-fill:7%] in-data-[slot=button]:[--kbd-fill:14%] [--kbd-lip:inset_0_-1px_0_oklch(0_0_0/0.08)] dark:[--kbd-lip:inset_0_1px_0_oklch(1_0_0/0.06)]",
          "[[data-surface=inverse]_&]:[--kbd-fill:10%] [[data-surface=inverse]_&]:[--kbd-lip:inset_0_1px_0_oklch(1_0_0/0.06)] dark:[[data-surface=inverse]_&]:[--kbd-lip:inset_0_-1px_0_oklch(0_0_0/0.08)]",
        ],
        outline:
          "bg-(--outline) inset-ring inset-ring-(--outline-border) data-pressed:bg-(--outline-active)",
        ghost: "data-pressed:bg-(--surface-active)",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

type Platform = "mac" | "windows";

type KeyLegend = { mac: string; windows: string; label?: string };

// Named keys a `keys` array can use. `label` names the symbol legend for
// screen readers.
const KEY_LEGENDS: Record<string, KeyLegend> = {
  mod: { mac: "⌘", windows: "Ctrl", label: "Command" },
  cmd: { mac: "⌘", windows: "Ctrl", label: "Command" },
  command: { mac: "⌘", windows: "Ctrl", label: "Command" },
  meta: { mac: "⌘", windows: "Win", label: "Command" },
  ctrl: { mac: "⌃", windows: "Ctrl", label: "Control" },
  control: { mac: "⌃", windows: "Ctrl", label: "Control" },
  alt: { mac: "⌥", windows: "Alt", label: "Option" },
  option: { mac: "⌥", windows: "Alt", label: "Option" },
  shift: { mac: "⇧", windows: "Shift", label: "Shift" },
  capslock: { mac: "⇪", windows: "Caps Lock", label: "Caps Lock" },
  enter: { mac: "↵", windows: "Enter", label: "Return" },
  return: { mac: "↵", windows: "Enter", label: "Return" },
  backspace: { mac: "⌫", windows: "Backspace", label: "Delete" },
  delete: { mac: "⌫", windows: "Del", label: "Delete" },
  tab: { mac: "⇥", windows: "Tab", label: "Tab" },
  esc: { mac: "Esc", windows: "Esc" },
  escape: { mac: "Esc", windows: "Esc" },
  space: { mac: "Space", windows: "Space" },
  up: { mac: "↑", windows: "↑", label: "Up arrow" },
  down: { mac: "↓", windows: "↓", label: "Down arrow" },
  left: { mac: "←", windows: "←", label: "Left arrow" },
  right: { mac: "→", windows: "→", label: "Right arrow" },
};

const subscribe = () => () => {};

function getPlatform(): Platform {
  // `navigator.platform` is deprecated; prefer userAgentData.platform
  // (Chromium) with the userAgent string as the universal fallback.
  const uaData = (
    navigator as Navigator & { userAgentData?: { platform?: string } }
  ).userAgentData;
  const hint = uaData?.platform ?? navigator.userAgent;
  return /mac|iphone|ipad/i.test(hint) ? "mac" : "windows";
}

// The server renders Mac legends; a key that mounts on the client (menus,
// dialogs, tooltips) reads the real platform on its first render.
function usePlatform(): Platform {
  return React.useSyncExternalStore(subscribe, getPlatform, () => "mac");
}

function renderKey(key: string, platform: Platform): React.ReactNode {
  const legend = KEY_LEGENDS[key.toLowerCase()];
  if (!legend) return key.length === 1 ? key.toUpperCase() : key;

  const glyph = legend[platform];
  // Only a one-glyph symbol needs a spoken name; "Ctrl" says itself.
  if (!legend.label || glyph.length > 1) return glyph;
  return (
    <>
      <span aria-hidden="true">{glyph}</span>
      <span className="sr-only">{legend.label}</span>
    </>
  );
}

export type KbdProps = React.ComponentProps<"kbd"> &
  VariantProps<typeof kbdVariants> & {
    /** Keys of one shortcut, drawn on a single cap. Named keys like `mod`,
     * `shift` and `enter` become the platform's legend. */
    keys?: string[];
    /** Placed between `keys`. Defaults to none on Mac and `+` elsewhere. */
    separator?: React.ReactNode;
    platform?: Platform | "auto";
    /** Draws the key pushed down, as when it's held. */
    pressed?: boolean;
  };

function Kbd({
  className,
  size,
  variant,
  keys,
  separator,
  platform = "auto",
  pressed = false,
  children,
  ...props
}: KbdProps) {
  const detectedPlatform = usePlatform();
  const resolvedPlatform = platform === "auto" ? detectedPlatform : platform;
  const resolvedSeparator =
    separator ?? (resolvedPlatform === "mac" ? null : "+");

  return (
    <kbd
      data-slot="kbd"
      data-pressed={pressed || undefined}
      className={cn(kbdVariants({ size, variant }), className)}
      {...props}
    >
      {keys
        ? keys.map((key, index) => (
            <React.Fragment key={`${index}-${key}`}>
              {index > 0 && resolvedSeparator !== null && (
                <span aria-hidden="true" className="opacity-60">
                  {resolvedSeparator}
                </span>
              )}
              {renderKey(key, resolvedPlatform)}
            </React.Fragment>
          ))
        : children}
    </kbd>
  );
}

// Nested `kbd` is the HTML spelling of a combination: the outer element is
// the shortcut, each inner one a key. Text in a `span` (`+`, "then") stays
// quiet, like the separator inside a key.
function KbdGroup({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn(
        "inline-flex items-center gap-1 font-sans text-xs [&>span]:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Kbd, KbdGroup, kbdVariants };
