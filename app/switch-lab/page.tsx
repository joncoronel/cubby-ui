"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

/**
 * Scratch comparison page for how the thumb's 2px inset is produced.
 * Not part of the registry or the docs — delete once a direction is picked.
 *
 * All four rows are geometrically identical: same painted size, same thumb,
 * same 2px inset, same travel. The only variable is the mechanism, so anything
 * visible on screen is down to how the browser rasterizes it.
 *
 *   1. ring      what ships today — thumb fills the box, inset is a box-shadow
 *   2. padding   thumb inset by padding, centred by flex, moved by translate
 *   3. absolute  Fluid Functionalism — absolutely positioned thumb, offset and
 *                moved entirely by transform
 *   4. margin    HeroUI — centred by flex, moved by margin-inline-start, so the
 *                horizontal position is a layout value rather than a transform
 */

type Size = "xs" | "sm" | "default";

const GEOMETRY: Record<Size, { thumb: number; travel: number }> = {
  xs: { thumb: 14, travel: 11 },
  sm: { thumb: 16, travel: 13 },
  default: { thumb: 20, travel: 16 },
};

const INSET = 2;

const radiusFor = (box: number, squircle: boolean) =>
  squircle ? box * 0.5 : 9999;

// corner-shape is newer than React's CSSProperties typings.
const corner = (squircle: boolean) =>
  ({ cornerShape: squircle ? "squircle" : "round" }) as React.CSSProperties;

type MechProps = {
  size: Size;
  squircle: boolean;
  checked: boolean;
  duration: number;
  onCheckedChange: (v: boolean) => void;
};

/** Colour and motion shared by every mechanism, so only structure differs. */
const trackStyle = (
  checked: boolean,
  duration: number,
): React.CSSProperties => ({
  background: checked ? "var(--primary)" : "var(--switch-track)",
  transitionProperty: "background-color, box-shadow",
  transitionDuration: `${duration}ms`,
});

const thumbStyle = (
  thumb: number,
  squircle: boolean,
  moveProp: string,
): React.CSSProperties =>
  ({
    height: thumb,
    width: thumb,
    background: "#fff",
    borderRadius: radiusFor(thumb, squircle),
    ...corner(squircle),
    boxShadow: "0 1px 1px 0 oklch(0.18 0 0 / 0.1)",
    transitionProperty: moveProp,
    transitionDuration: "200ms",
    transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)",
  }) as React.CSSProperties;

const rootClasses = "shrink-0 cursor-pointer outline-none";

/** 1. Ring — the shipped approach. */
function Ring({
  size,
  squircle,
  checked,
  duration,
  onCheckedChange,
}: MechProps) {
  const { thumb, travel } = GEOMETRY[size];
  const color = checked ? "var(--primary)" : "var(--switch-track)";
  return (
    <BaseSwitch.Root
      checked={checked}
      className={cn(rootClasses, "inline-flex items-center")}
      onCheckedChange={onCheckedChange}
      style={{
        ...trackStyle(checked, duration),
        height: thumb,
        width: thumb + travel,
        margin: INSET,
        borderRadius: radiusFor(thumb, squircle),
        ...corner(squircle),
        boxShadow: `0 0 0 ${INSET}px ${color}`,
      }}
    >
      <BaseSwitch.Thumb
        style={{
          ...thumbStyle(thumb, squircle, "translate"),
          translate: checked ? `${travel}px` : "0px",
        }}
      />
    </BaseSwitch.Root>
  );
}

/** 2. Padding — thumb inset by padding, centred by flex. */
function Padding({
  size,
  squircle,
  checked,
  duration,
  onCheckedChange,
}: MechProps) {
  const { thumb, travel } = GEOMETRY[size];
  return (
    <BaseSwitch.Root
      checked={checked}
      className={cn(rootClasses, "inline-flex items-center")}
      onCheckedChange={onCheckedChange}
      style={{
        ...trackStyle(checked, duration),
        boxSizing: "border-box",
        padding: INSET,
        height: thumb + INSET * 2,
        width: thumb + travel + INSET * 2,
        borderRadius: radiusFor(thumb + INSET * 2, squircle),
        ...corner(squircle),
      }}
    >
      <BaseSwitch.Thumb
        style={{
          ...thumbStyle(thumb, squircle, "translate"),
          translate: checked ? `${travel}px` : "0px",
        }}
      />
    </BaseSwitch.Root>
  );
}

/** 3. Absolute + transform — the Fluid Functionalism structure. */
function Absolute({
  size,
  squircle,
  checked,
  duration,
  onCheckedChange,
}: MechProps) {
  const { thumb, travel } = GEOMETRY[size];
  return (
    <BaseSwitch.Root
      checked={checked}
      className={cn(rootClasses, "relative inline-block")}
      onCheckedChange={onCheckedChange}
      style={{
        ...trackStyle(checked, duration),
        height: thumb + INSET * 2,
        width: thumb + travel + INSET * 2,
        borderRadius: radiusFor(thumb + INSET * 2, squircle),
        ...corner(squircle),
      }}
    >
      <BaseSwitch.Thumb
        style={{
          ...thumbStyle(thumb, squircle, "transform"),
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate(${INSET + (checked ? travel : 0)}px, ${INSET}px)`,
        }}
      />
    </BaseSwitch.Root>
  );
}

/** 4. Margin — the HeroUI structure; horizontal position is a layout value. */
function Margin({
  size,
  squircle,
  checked,
  duration,
  onCheckedChange,
}: MechProps) {
  const { thumb, travel } = GEOMETRY[size];
  return (
    <BaseSwitch.Root
      checked={checked}
      className={cn(rootClasses, "inline-flex items-center overflow-hidden")}
      onCheckedChange={onCheckedChange}
      style={{
        ...trackStyle(checked, duration),
        boxSizing: "border-box",
        height: thumb + INSET * 2,
        width: thumb + travel + INSET * 2,
        borderRadius: radiusFor(thumb + INSET * 2, squircle),
        ...corner(squircle),
      }}
    >
      <BaseSwitch.Thumb
        style={{
          ...thumbStyle(thumb, squircle, "margin"),
          marginInlineStart: INSET + (checked ? travel : 0),
        }}
      />
    </BaseSwitch.Root>
  );
}

const MECHANISMS = [
  { key: "ring", label: "1. ring (shipped)", Component: Ring },
  { key: "padding", label: "2. padding + translate", Component: Padding },
  {
    key: "absolute",
    label: "3. absolute + transform (FF)",
    Component: Absolute,
  },
  { key: "margin", label: "4. margin (HeroUI)", Component: Margin },
] as const;

/** Confirms the four really are the same size, so the eye is the only judge. */
function Painted({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    const id = setTimeout(() => {
      const el = ref.current?.querySelector<HTMLElement>("[role=switch]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const m = parseFloat(getComputedStyle(el).marginTop) || 0;
      setText(
        `${+(r.width + m * 2).toFixed(2)} x ${+(r.height + m * 2).toFixed(2)}`,
      );
    }, 260);
    return () => clearTimeout(id);
  });

  return (
    <div className="flex items-center gap-3" ref={ref}>
      {children}
      <code className="text-muted-foreground text-[11px] tabular-nums">
        {text}
      </code>
    </div>
  );
}

export default function SwitchLabPage() {
  const [checked, setChecked] = React.useState(false);
  const [squircle, setSquircle] = React.useState(false);
  const [duration, setDuration] = React.useState(100);

  const btn =
    "border-border hover:bg-surface-hover rounded-md border px-3 py-1.5 text-sm";

  return (
    <div className="min-h-screen p-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="text-xl font-semibold">Switch inset mechanisms</h1>
          <p className="text-muted-foreground text-sm">
            All four rows are geometrically identical — same painted size, same
            thumb, same 2px inset, same travel. Only the mechanism differs, so
            anything you can see is a rasterization difference. View at 100%
            browser zoom: zooming changes the device pixel ratio and re-renders
            everything, which hides the effect being compared.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className={btn}
              onClick={() => setChecked((c) => !c)}
              type="button"
            >
              Toggle all ({checked ? "on" : "off"})
            </button>
            <button
              className={btn}
              onClick={() => setSquircle((s) => !s)}
              type="button"
            >
              Corners: {squircle ? "squircle" : "round"}
            </button>
            {[100, 400, 1000, 3000].map((d) => (
              <button
                className={cn(btn, duration === d && "bg-surface-selected")}
                key={d}
                onClick={() => setDuration(d)}
                type="button"
              >
                {d}ms
              </button>
            ))}
          </div>
        </header>

        {(Object.keys(GEOMETRY) as Size[]).map((size) => (
          <section
            className="border-border flex flex-col gap-4 rounded-lg border p-6"
            key={size}
          >
            <h2 className="text-sm font-medium">
              size={size}{" "}
              <span className="text-muted-foreground font-normal">
                (thumb {GEOMETRY[size].thumb}px, travel {GEOMETRY[size].travel}
                px)
              </span>
            </h2>
            {MECHANISMS.map(({ key, label, Component }) => (
              <div className="flex items-center gap-4" key={key}>
                <span className="text-muted-foreground w-52 shrink-0 text-xs">
                  {label}
                </span>
                <Painted>
                  <Component
                    checked={checked}
                    duration={duration}
                    onCheckedChange={setChecked}
                    size={size}
                    squircle={squircle}
                  />
                </Painted>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
