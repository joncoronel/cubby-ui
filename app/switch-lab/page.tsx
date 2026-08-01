"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";
import { Switch } from "@/registry/default/switch/switch";

/**
 * Scratch comparison page for the switch thumb-gap rendering options.
 * Not part of the registry or the docs — delete once a direction is picked.
 *
 * The complaint: at the smaller sizes the thumb does not look evenly inset on
 * all four sides. Cause is that the track width and the thumb travel are
 * derived by multiplying by 1.8 / 0.8 / 0.45, which only lands on whole pixels
 * for circle/default. Everything else puts the thumb's leading edge mid-pixel,
 * so the gap smears horizontally while the vertical gaps stay crisp.
 */

type Shape = "circle" | "pill";
type Size = "xs" | "sm" | "default";

const SIZES: Size[] = ["xs", "sm", "default"];
const THUMB_PX: Record<Size, number> = { xs: 14, sm: 16, default: 20 };
const SHAPE_MATH: Record<Shape, { aspect: number; ratio: number }> = {
  circle: { aspect: 1, ratio: 0.8 },
  pill: { aspect: 1.8, ratio: 0.45 },
};

// Option A, hand-computed: every dimension rounded to a whole pixel.
const INTEGER: Record<
  Shape,
  Record<Size, { h: number; w: number; travel: number }>
> = {
  circle: {
    xs: { h: 14, w: 14, travel: 11 },
    sm: { h: 16, w: 16, travel: 13 },
    default: { h: 20, w: 20, travel: 16 },
  },
  pill: {
    xs: { h: 14, w: 25, travel: 11 },
    sm: { h: 16, w: 29, travel: 13 },
    default: { h: 20, w: 36, travel: 16 },
  },
};

// Kumo rings with a shade of the track itself, not a neutral over the page
// (bg-blue-500/ring-blue-600 in light, bg-blue-600/ring-blue-500 in dark), so
// the ring reads as the track's own edge rather than as a focus ring.
const RING_CLASSES = cn(
  "ring-2",
  "data-unchecked:ring-switch-track",
  "data-checked:ring-primary",
  "dark:data-checked:ring-primary",
);

const trackBase =
  "inline-flex shrink-0 items-center rounded-full outline-none cursor-pointer " +
  "data-unchecked:bg-switch-track data-checked:bg-primary " +
  "transition-colors duration-100 motion-reduce:transition-none " +
  "focus-visible:outline-ring/50 focus-visible:outline-2 focus-visible:outline-offset-2";

const thumbBase =
  "pointer-events-none block rounded-full bg-white " +
  "shadow-[0_1px_1px_0_oklch(0.18_0_0/0.1)] " +
  "ease-out-expo transition-all duration-200 motion-reduce:transition-none ";

type VariantProps = {
  shape: Shape;
  size: Size;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
};

/** 1. What ships today. */
function Current({ shape, size, checked, onCheckedChange }: VariantProps) {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      shape={shape}
      size={size}
    />
  );
}

/** 2. Option A via explicit whole-pixel values (cva compoundVariants shape). */
function IntegerCva({ shape, size, checked, onCheckedChange }: VariantProps) {
  const { h, w, travel } = INTEGER[shape][size];
  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(trackBase, "p-0.5")}
      style={{ height: h + 4, width: w + travel + 4 }}
    >
      <BaseSwitch.Thumb
        className={thumbBase}
        style={{
          height: h,
          width: w,
          translate: checked ? `${travel}px` : "0px",
        }}
      />
    </BaseSwitch.Root>
  );
}

/** 3. Option A via CSS round() — keeps shape and size orthogonal. */
function IntegerRound({ shape, size, checked, onCheckedChange }: VariantProps) {
  const { aspect, ratio } = SHAPE_MATH[shape];
  const vars = {
    "--thumb-size": `${THUMB_PX[size]}px`,
    "--thumb-aspect": aspect,
    "--travel-ratio": ratio,
    "--thumb-w": "round(calc(var(--thumb-size) * var(--thumb-aspect)), 1px)",
    "--travel": "round(calc(var(--thumb-w) * var(--travel-ratio)), 1px)",
  } as React.CSSProperties;

  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        trackBase,
        "p-0.5",
        "h-[calc(var(--thumb-size)+4px)] w-[calc(var(--thumb-w)+var(--travel)+4px)]",
      )}
      style={vars}
    >
      <BaseSwitch.Thumb
        className={cn(thumbBase, "h-(--thumb-size) w-(--thumb-w)")}
        style={{ translate: checked ? "var(--travel)" : "0px" }}
      />
    </BaseSwitch.Root>
  );
}

/**
 * 4. Option B — Kumo-style: no gap, thumb fills the track, ring outside.
 * Thumb is the same size as every other row; the track is sized to the thumb
 * and the ring adds the outer 2px, so the painted footprint matches too.
 */
function NoGap({ shape, size, checked, onCheckedChange }: VariantProps) {
  const { h } = INTEGER[shape][size];
  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(trackBase, "p-0", RING_CLASSES)}
      style={{ height: h, width: h * 2 }}
    >
      <BaseSwitch.Thumb
        className={thumbBase}
        style={{ height: h, width: h, translate: checked ? `${h}px` : "0px" }}
      />
    </BaseSwitch.Root>
  );
}

/**
 * 5. The border idea — thumb is the same size as rows 1-3 and flush against a
 * 2px border that supplies the ring. Same outer box as option A, and with the
 * border colored to match the track fill it is pixel-identical to rows 2-3;
 * the point of the border is that the ring can be colored independently.
 */
function BorderedRing({ shape, size, checked, onCheckedChange }: VariantProps) {
  const { h, w, travel } = INTEGER[shape][size];
  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        trackBase,
        // Border sits over the track fill, so a translucent shade of the
        // substrate reads as the same "one step darker" edge Kumo rings with.
        "border-2 border-transparent p-0",
      )}
      style={{ height: h + 4, width: w + travel + 4 }}
    >
      <BaseSwitch.Thumb
        className={thumbBase}
        style={{
          height: h,
          width: w,
          translate: checked ? `${travel}px` : "0px",
        }}
      />
    </BaseSwitch.Root>
  );
}

const APPROACHES = [
  { key: "current", label: "1. Current", Component: Current },
  { key: "cva", label: "2. A — integer (cva)", Component: IntegerCva },
  { key: "round", label: "3. A — integer (round())", Component: IntegerRound },
  { key: "nogap", label: "4. B — no gap (Kumo)", Component: NoGap },
  { key: "border", label: "5. Border as the ring", Component: BorderedRing },
] as const;

/**
 * Reports the rendered box so fractional geometry is visible, not inferred.
 * Measured after the thumb transition settles — sampling immediately catches
 * the thumb mid-travel and reports the resting position instead.
 */
function Measured({
  checked,
  shape,
  children,
}: {
  checked: boolean;
  shape: Shape;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    const id = setTimeout(() => {
      const root = ref.current?.querySelector<HTMLElement>("[role=switch]");
      const thumb = root?.firstElementChild as HTMLElement | undefined;
      if (!root || !thumb) return;
      const r = root.getBoundingClientRect();
      const t = thumb.getBoundingClientRect();
      const travel = getComputedStyle(thumb).translate.split(" ")[0];
      const whole = (n: number) => Number.isInteger(+n.toFixed(3));
      const gapL = t.left - r.left;
      const gapR = r.right - t.right;
      const clean =
        whole(r.width) && whole(r.height) && whole(gapL) && whole(gapR);
      setText(
        `${+r.width.toFixed(2)}x${+r.height.toFixed(2)} · travel ${travel} · gap L ${+gapL.toFixed(2)} R ${+gapR.toFixed(2)} · ${clean ? "whole px" : "FRACTIONAL"}`,
      );
    }, 260);
    return () => clearTimeout(id);
  }, [checked, shape]);

  return (
    <div className="flex items-center gap-4" ref={ref}>
      {children}
      <code className="text-muted-foreground text-[11px] tabular-nums">
        {text}
      </code>
    </div>
  );
}

export default function SwitchLabPage() {
  const [checked, setChecked] = React.useState(false);
  const [shape, setShape] = React.useState<Shape>("circle");

  return (
    <div className="min-h-screen p-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold">Switch gap rendering</h1>
          <p className="text-muted-foreground text-sm">
            View at 100% browser zoom — zooming changes the device pixel ratio
            and re-rasterizes everything, which hides the effect being compared.
            Options 2 and 3 should be pixel-identical; if they are not, round()
            is not producing the hand-computed values.
          </p>
          <div className="flex items-center gap-3 text-sm">
            <button
              className="border-border hover:bg-surface-hover rounded-md border px-3 py-1.5"
              onClick={() => setChecked((c) => !c)}
              type="button"
            >
              Toggle all ({checked ? "on" : "off"})
            </button>
            <button
              className="border-border hover:bg-surface-hover rounded-md border px-3 py-1.5"
              onClick={() =>
                setShape((s) => (s === "circle" ? "pill" : "circle"))
              }
              type="button"
            >
              Shape: {shape}
            </button>
          </div>
        </header>

        {SIZES.map((size) => (
          <section
            className="border-border flex flex-col gap-4 rounded-lg border p-6"
            key={size}
          >
            <h2 className="text-sm font-medium">
              size={size}{" "}
              <span className="text-muted-foreground font-normal">
                (thumb {THUMB_PX[size]}px)
              </span>
            </h2>
            <div className="flex flex-col gap-4">
              {APPROACHES.map(({ key, label, Component }) => (
                <div className="flex items-center gap-4" key={key}>
                  <span className="text-muted-foreground w-48 shrink-0 text-xs">
                    {label}
                  </span>
                  <Measured checked={checked} shape={shape}>
                    <Component
                      checked={checked}
                      onCheckedChange={setChecked}
                      shape={shape}
                      size={size}
                    />
                  </Measured>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
