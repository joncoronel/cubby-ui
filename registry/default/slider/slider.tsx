import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The inset thumb's box, in px, for the step-mark math. Keep in step with
// --edge-thumb-size on the inset variant.
const INSET_THUMB_SIZE = 18;
// How far the bar handle sits inside the fill's end, in px.
const BAR_HANDLE_INSET = 7;
// The least space, in px, between a range's two bar handles.
const BAR_HANDLE_GAP = 4;
// How close, in px, the bar handle can come to a label before it steps
// aside, and a mark to the handle or a label before it hides.
const BAR_LABEL_GAP = 6;
const BAR_MARK_GAP = 5;
// How far, in px, a press has to travel before it's a drag rather than a
// click on the track.
const DRAG_THRESHOLD = 3;
// The glide after a click on the track, and the settle onto a step after
// a drag. Keyboard moves stay instant.
const GLIDE_MS = 200;
// A SliderValue passed as a bar label takes the layer's text, so it turns
// the fill's foreground color with the rest.
const BAR_LABEL_VALUE =
  "**:data-[slot=slider-value]:text-inherit **:data-[slot=slider-value]:text-[length:inherit] **:data-[slot=slider-value]:[font-weight:inherit]";

const sliderVariants = cva(
  "relative w-full touch-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-60 data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col ",
  {
    variants: {
      variant: {
        default: "",
        inset: "[--edge-thumb-size:18px]",
        bar: "",
        squareThumb: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const sliderTrackVariants = cva(
  "bg-control-track flex flex-1 size-[inherit] min-size-[inherit] relative grow rounded-full data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-full data-[orientation=vertical]:min-h-full data-[orientation=vertical]:w-3",
  {
    variants: {
      variant: {
        default: "",
        // A tall track the thumb sits inside. The grey is a gradient set
        // inline, as on the bar. Its own layer, shared by the fill: the thumb
        // has one, and at fractional scales a layer snaps to whole pixels
        // where the page doesn't, which left the thumb's frame a pixel taller
        // than the fill and stray fill pixels past the track's edge.
        inset:
          "bg-transparent rounded-xs will-change-transform data-[orientation=horizontal]:h-6 data-[orientation=vertical]:w-6",
        // Tall enough to hold the labels. The grey is a gradient set inline,
        // left out under the fill; the clip rounds the fill's outer corners.
        // The thumb is invisible, so focus shows on the track.
        bar: "bg-transparent overflow-hidden rounded-sm data-[orientation=horizontal]:h-8 data-[orientation=vertical]:w-8 outline-0 outline-offset-2 outline-transparent outline-solid has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
        squareThumb: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const sliderIndicatorVariants = cva(
  "bg-(--slider-fill) absolute rounded-full shadow-[0_1px_3px_0_oklch(0.18_0_0_/_0.1)] data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
  {
    variants: {
      variant: {
        default: "",
        // Ends at the thumb's center, under the thumb, so only the outer end
        // is rounded.
        inset:
          "shadow-none data-[orientation=horizontal]:rounded-s-xs data-[orientation=horizontal]:rounded-e-none data-[orientation=vertical]:rounded-b-xs data-[orientation=vertical]:rounded-t-none",
        // Unused: the bar variant draws its own fill.
        bar: "",
        squareThumb: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// A borderless white knob like the Switch thumb: a hairline and a soft drop
// give it its edge, so it reads on the filled range and the bare track alike.
const sliderThumbVariants = cva(
  "bg-white relative block size-5 shrink-0 rounded-full shadow-[0_0_0_0.5px_oklch(0_0_0/0.08),0_1px_3px_0_oklch(0.18_0_0/0.2)] duration-200 hover:shadow-[0_0_0_0.5px_oklch(0_0_0/0.08),0_2px_8px_0_oklch(0.18_0_0/0.24)] outline-0 -outline-offset-1 outline-transparent outline-solid transition-[box-shadow,outline-width,outline-color] has-[:focus-visible]:z-10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring forced-colors:border forced-colors:border-[CanvasText]",
  {
    variants: {
      variant: {
        default: "",
        // The box is fill-colored, so the range runs on past the white handle
        // and frames it; the handle is a ::before inside the box's border. A
        // border, not an inset, because borders snap to whole device pixels:
        // an inset rounds differently top and bottom at fractional DPRs.
        inset: [
          "border-2 border-(--slider-fill) bg-(--slider-fill) rounded-xs shadow-none hover:shadow-none",
          "data-[orientation=horizontal]:h-full data-[orientation=horizontal]:w-(--edge-thumb-size)",
          "data-[orientation=vertical]:w-full data-[orientation=vertical]:h-(--edge-thumb-size)",
          "before:absolute before:inset-0 before:rounded-[calc(var(--radius-xs)-2px)] before:bg-white before:shadow-[0_1px_2px_0_oklch(0.18_0_0/0.15)] before:content-['']",
          // Press: the handle gives a little, felt more than seen. The thumb
          // gets its own layer, or the scaled handle repaints at a new subpixel
          // offset on every drag move and shimmers. The whole thumb, not the
          // handle alone, so the frame and handle snap together and stay
          // centered.
          "will-change-transform before:transition-[scale] before:duration-150 before:ease-out data-held:before:scale-95 motion-reduce:before:transition-none",
          "forced-colors:before:border forced-colors:before:border-[CanvasText]",
        ],
        // An invisible hit area; the handle the user sees is drawn in the
        // track's layers, where it can sit behind the pointer. It stays
        // centered on the value, as Base UI's drag offset assumes; the
        // handle inset beside it is covered in the render below.
        bar: "bg-transparent shadow-none hover:shadow-none has-[:focus-visible]:outline-0 forced-colors:border-0 data-[orientation=horizontal]:h-full data-[orientation=horizontal]:w-3.5 data-[orientation=vertical]:h-3.5 data-[orientation=vertical]:w-full",
        squareThumb:
          "h-5 w-2.5 rounded-[.125rem] data-[orientation=vertical]:h-2.5 data-[orientation=vertical]:w-5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// Filled range: the shared selection-control grey, or the brand fill.
const sliderColors = {
  neutral:
    "[--slider-fill:var(--emphasis)] [--slider-fill-foreground:var(--emphasis-foreground)]",
  primary:
    "[--slider-fill:var(--primary)] [--slider-fill-foreground:var(--primary-foreground)]",
};

// The values as Base UI holds them: clamped to the range, and in order.
function toValues(
  value: number | readonly number[],
  min: number,
  max: number,
): number[] {
  const values = Array.isArray(value) ? value : [value as number];
  return values
    .map((v) => Math.min(Math.max(v, min), max))
    .sort((a, b) => a - b);
}

type LabelReach = { size: number; start: number; end: number };

// How far the bar's labels reach in from each end of the track, so the
// handle and marks can step aside for them. Measured, since labels are any
// content and a live value changes width as it runs.
function useLabelReach(
  bar: boolean,
  vertical: boolean,
): {
  labelsRef: React.RefObject<HTMLDivElement | null>;
  labelReach: LabelReach | null;
  nearLabel: (px: number, gap: number) => boolean;
  measured: boolean;
} {
  const labelsRef = React.useRef<HTMLDivElement>(null);
  const [labelReach, setLabelReach] = React.useState<LabelReach | null>(null);
  React.useLayoutEffect(() => {
    const layer = labelsRef.current;
    if (!layer) return;
    const [startLabelEl, endLabelEl] = Array.from(
      layer.children,
    ) as HTMLElement[];

    const measure = (): void => {
      const box = layer.getBoundingClientRect();
      const rtl = getComputedStyle(layer).direction === "rtl";
      const reach = (el: HTMLElement, fromStart: boolean): number => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return 0;
        if (vertical)
          return fromStart ? box.bottom - r.top : r.bottom - box.top;
        return fromStart === rtl ? box.right - r.left : r.right - box.left;
      };
      const next = {
        size: vertical ? box.height : box.width,
        start: reach(startLabelEl, true),
        end: reach(endLabelEl, false),
      };
      setLabelReach((prev) =>
        prev &&
        prev.size === next.size &&
        prev.start === next.start &&
        prev.end === next.end
          ? prev
          : next,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    for (const el of [layer, startLabelEl, endLabelEl]) observer.observe(el);
    return () => observer.disconnect();
  }, [bar, vertical]);

  // Whether a point along the bar, in px, is within `gap` of a label.
  const nearLabel = (px: number, gap: number): boolean =>
    labelReach !== null &&
    ((labelReach.start > 0 && px < labelReach.start + gap) ||
      (labelReach.end > 0 && px > labelReach.size - labelReach.end - gap));
  // Set a frame after the first measure. Until then the server's HTML has no
  // dodging, and easing into it would animate on load.
  const [measured, setMeasured] = React.useState(false);
  React.useEffect(() => {
    if (!labelReach || measured) return;
    const frame = requestAnimationFrame(() => setMeasured(true));
    return () => cancelAnimationFrame(frame);
  }, [labelReach, measured]);

  return { labelsRef, labelReach, nearLabel, measured };
}

// thumbAlignment is left out: the variant sets it, and the drawing math
// follows the variant.
export interface SliderProps
  extends
    Omit<React.ComponentProps<typeof BaseSlider.Root>, "thumbAlignment">,
    VariantProps<typeof sliderVariants> {
  color?: "neutral" | "primary";
  /** Marks steps on the track; `"hover"` shows them only while in use. */
  showSteps?: boolean | "hover";
  /** The spacing between marks, in value units. Defaults to `step`. */
  markStep?: number;
  /** Text inside the track at its start. `bar` variant only. */
  startLabel?: React.ReactNode;
  /** Text inside the track at its end. `bar` variant only. */
  endLabel?: React.ReactNode;
  getAriaLabel?: ((index: number) => string) | null;
}

function Slider({
  className,
  children,
  defaultValue,
  value,
  onValueChange,
  min = 0,
  max = 100,
  variant,
  color = "neutral",
  showSteps = false,
  markStep,
  startLabel,
  endLabel,
  getAriaLabel,
  ...props
}: SliderProps) {
  // Uncontrolled sliders still need the live value to color step marks and
  // draw the bar variant's fill, so mirror it.
  const [uncontrolledValues, setUncontrolledValues] = React.useState(() =>
    defaultValue !== undefined ? toValues(defaultValue, min, max) : [min],
  );
  // Clamped on every render, so a new `min` or `max` pulls an uncontrolled
  // value in, as Base UI's own does.
  const snappedValues = toValues(value ?? uncontrolledValues, min, max);

  // While dragging, the thumb and fill follow the pointer itself, so coarse
  // steps drag as smoothly as fine ones. The value still snaps; the thumb
  // settles onto its step on release, and glides to a clicked spot.
  const trackRef = React.useRef<HTMLDivElement>(null);
  const pointerRef = React.useRef<{
    id: number;
    index: number;
    offset: number;
    x: number;
    y: number;
    moved: boolean;
    // The caller cancelled a change during this press; the thumb waits at
    // the kept value until one is accepted.
    rejected: boolean;
  } | null>(null);
  const stopPointerRef = React.useRef<(() => void) | null>(null);
  const glideFrame = React.useRef(0);
  // The thumb in hand, from press to release. Base UI's `data-dragging`
  // waits for movement and marks every thumb.
  const [held, setHeld] = React.useState<number | null>(null);
  // The thumb with keyboard focus, so the bar can mark its handle; the bar's
  // thumbs are invisible.
  const [focused, setFocused] = React.useState<number | null>(null);
  // Where each thumb is drawn while one is dragged: the held one at the
  // pointer, and any it pushes against it.
  const [drag, setDrag] = React.useState<{
    index: number;
    values: number[];
  } | null>(null);
  // The values shown mid-glide. Animated here, frame by frame, rather than
  // with CSS transitions, so the fill, grey, handles, and marks all move as
  // one, and Chrome has no composited clip-path to hand back at the end,
  // which could flash the old fill for a frame.
  const [glideValues, setGlideValues] = React.useState<number[] | null>(null);
  React.useEffect(
    () => () => {
      cancelAnimationFrame(glideFrame.current);
      stopPointerRef.current?.();
    },
    [],
  );

  const values = drag?.values ?? glideValues ?? snappedValues;
  // What's on screen and the value beneath it, for a glide to start from
  // and settle onto.
  const shownRef = React.useRef(values);
  const snappedRef = React.useRef(snappedValues);
  React.useLayoutEffect(() => {
    shownRef.current = values;
    snappedRef.current = snappedValues;
  });

  const isRange = values.length > 1;
  const inset = variant === "inset";
  const bar = variant === "bar";
  const vertical = props.orientation === "vertical";

  const percent = (v: number): number => ((v - min) / (max - min)) * 100;

  // Eases from what's shown to the value. It starts in the same render as
  // the value change, so the thumb never jumps ahead for a frame, and aims
  // at the live value each frame, so a pointer that wobbles a step before
  // release doesn't leave the glide to jump there at the end.
  function glide(to: number[]): void {
    cancelAnimationFrame(glideFrame.current);
    const from = shownRef.current;
    if (
      from.length !== to.length ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setGlideValues(null);
      return;
    }
    const start = performance.now();
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / GLIDE_MS);
      if (t === 1) {
        setGlideValues(null);
        return;
      }
      const eased = 1 - (1 - t) ** 4;
      const target = snappedRef.current;
      setGlideValues(from.map((v, i) => v + (target[i] - v) * eased));
      glideFrame.current = requestAnimationFrame(tick);
    };
    setGlideValues(from);
    glideFrame.current = requestAnimationFrame(tick);
  }

  function stopGliding(): void {
    cancelAnimationFrame(glideFrame.current);
    setGlideValues(null);
  }

  // Moves the held thumb to `to` as Base UI moves its value, without the
  // rounding to steps: pushing its neighbors along, which stay where pushed,
  // or stopping at them. Mirrors Base UI's getPushedThumbValues ("push") and
  // resolveThumbCollision ("none", and "swap" up to the swap).
  function placeDrag(from: number[], index: number, to: number): number[] {
    const gap = (props.step ?? 1) * (props.minStepsBetweenValues ?? 0);
    const next = from.slice();
    const last = next.length - 1;
    if ((props.thumbCollisionBehavior ?? "push") !== "push") {
      next[index] = Math.min(
        Math.max(to, index > 0 ? from[index - 1] + gap : min),
        index < last ? from[index + 1] - gap : max,
      );
      return next;
    }
    next[index] = Math.min(
      Math.max(to, min + index * gap),
      max - (last - index) * gap,
    );
    for (let i = index + 1; i <= last; i++) {
      next[i] = Math.max(from[i], next[i - 1] + gap);
    }
    for (let i = index - 1; i >= 0; i--) {
      next[i] = Math.min(from[i], next[i + 1] - gap);
    }
    return next;
  }

  // The pointer's distance along the track from its start, in px, and how
  // far a thumb travels, as Base UI measures them: an edge-aligned thumb
  // travels the track minus its own size.
  function trackPosition(
    clientX: number,
    clientY: number,
  ): { pos: number; travel: number; edge: number } | null {
    const track = trackRef.current;
    if (!track) return null;
    const rect = track.getBoundingClientRect();
    const rtl = getComputedStyle(track).direction === "rtl";
    const edge = inset ? INSET_THUMB_SIZE / 2 : 0;
    return {
      pos: vertical
        ? rect.bottom - clientY
        : rtl
          ? rect.right - clientX
          : clientX - rect.left,
      travel: (vertical ? rect.height : rect.width) - edge * 2,
      edge,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    if (event.button !== 0 || props.disabled) return;
    const start = trackPosition(event.clientX, event.clientY);
    if (!start) return;

    // The thumb under the pointer, or the nearest one, picked exactly as
    // Base UI's startPressing does, so the drawn drag and the value move the
    // same thumb: a pressed thumb at the max yields to the first one there,
    // and on the track a tie goes to the later thumb. The offset below keeps
    // the thumb from jumping to center under the pointer.
    const thumb = (event.target as HTMLElement).closest(
      '[data-slot="slider-thumb"]',
    );
    const thumbAt = (v: number): number =>
      start.edge + (percent(v) / 100) * start.travel;
    let index = 0;
    if (thumb) {
      index = Number(thumb.getAttribute("data-index")) || 0;
      while (index > 0 && snappedValues[index - 1] === max) index--;
    } else {
      shownRef.current.forEach((v, i) => {
        if (
          Math.abs(thumbAt(v) - start.pos) <=
          Math.abs(thumbAt(shownRef.current[index]) - start.pos)
        ) {
          index = i;
        }
      });
    }
    setHeld(index);
    pointerRef.current = {
      id: event.pointerId,
      index,
      offset: thumb ? start.pos - thumbAt(shownRef.current[index]) : 0,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      rejected: false,
    };

    // Only the pointer that pressed drives the drag, so a second finger
    // elsewhere neither moves nor ends it.
    const doc = event.currentTarget.ownerDocument;
    const move = (e: PointerEvent): void => {
      const pointer = pointerRef.current;
      if (!pointer || e.pointerId !== pointer.id) return;
      if (!pointer.moved) {
        if (
          Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) <=
          DRAG_THRESHOLD
        ) {
          return;
        }
        pointer.moved = true;
        stopGliding();
      }
      if (pointer.rejected) return;
      const now = trackPosition(e.clientX, e.clientY);
      if (!now) return;
      const fraction = Math.min(
        1,
        Math.max(0, (now.pos - pointer.offset - now.edge) / now.travel),
      );
      const to = min + fraction * (max - min);
      const { index } = pointer;
      // A swap hands the drag to another thumb; start again from the values.
      setDrag((prev) => ({
        index,
        values: placeDrag(
          prev?.index === index ? prev.values : snappedRef.current,
          index,
          to,
        ),
      }));
    };
    const stop = (): void => {
      doc.removeEventListener("pointermove", move);
      doc.removeEventListener("pointerup", end);
      doc.removeEventListener("pointercancel", end);
      stopPointerRef.current = null;
    };
    const end = (e: PointerEvent): void => {
      if (e.pointerId !== pointerRef.current?.id) return;
      stop();
      const moved = pointerRef.current?.moved;
      pointerRef.current = null;
      setHeld(null);
      if (moved) {
        setDrag(null);
        glide(snappedRef.current);
      }
    };

    stopPointerRef.current?.();
    doc.addEventListener("pointermove", move);
    doc.addEventListener("pointerup", end);
    doc.addEventListener("pointercancel", end);
    stopPointerRef.current = stop;
  }

  // The thumbs and fill are placed here rather than by Base UI, which places
  // them at the snapped value, so they can follow a drag or glide. At rest the
  // two agree, except on the inset: Base UI places an edge-aligned thumb by a
  // percentage it measured, which lands a little off this.
  const insetTravel = (p: number): string =>
    `(100% - ${INSET_THUMB_SIZE}px) * ${p / 100}`;
  const dragPosition = (p: number): string =>
    inset ? `calc(${INSET_THUMB_SIZE / 2}px + ${insetTravel(p)})` : `${p}%`;
  // Positions an element along the slider's axis.
  const along = (position: string): React.CSSProperties =>
    vertical ? { bottom: position } : { insetInlineStart: position };
  const first = percent(values[0]);
  const last = percent(values[values.length - 1]);

  // The track's grey stops where the fill and thumbs take over, rather than
  // running beneath them, where it would rim their anti-aliased edges. On
  // the bar it tucks a pixel under the fill's ends. On the inset it tucks
  // under the thumbs' rounded corners, the only part of them that doesn't
  // cover the track edge to edge, except where a thumb's corners meet the
  // track's own at either end.
  //
  // The bar's fill rounds its ends like the track (--fill-radius, set once
  // measured), so the grey tucks under those corners instead. An end on the
  // track's own edge reaches past it, leaving the track to round it alone.
  const fillStartsInside = isRange && first > 0;
  const fillEndsInside = last < 100;
  const trackStyle = bar
    ? ({
        "--fill-start": fillStartsInside
          ? `${first}%`
          : "calc(var(--radius-sm) * -1)",
        "--fill-end": fillEndsInside
          ? `${last}%`
          : "calc(100% + var(--radius-sm))",
        "--grey-until": fillStartsInside
          ? `calc(${first}% + max(1px, var(--fill-radius)))`
          : "0px",
        "--grey-from": fillEndsInside
          ? `calc(${last}% - max(1px, var(--fill-radius)))`
          : "100%",
      } as React.CSSProperties)
    : inset
      ? ({
          "--grey-until":
            isRange && first > 0
              ? `calc(var(--radius-xs) + ${insetTravel(first)})`
              : "0px",
          "--grey-from":
            last < 100
              ? `calc(${INSET_THUMB_SIZE}px - var(--radius-xs) + ${insetTravel(last)})`
              : "100%",
        } as React.CSSProperties)
      : undefined;

  const { labelsRef, labelReach, nearLabel, measured } = useLabelReach(
    bar,
    vertical,
  );

  // The handle sits just inside the fill's end, but never past the track's
  // edge, so at the minimum it waits at the start with no fill behind it. In
  // a range, the two handles give up their inset as the range narrows,
  // keeping apart until they sit on the fill's ends, so they never cross or
  // leave it. Returns the CSS position, and the same in px for a measured
  // track.
  const barHandle = (
    index: number,
  ): { position: string; at: (size: number) => number } => {
    const p = percent(values[index]);
    if (!isRange) {
      return {
        position: `max(${BAR_HANDLE_INSET}px, calc(${p}% - ${BAR_HANDLE_INSET}px))`,
        at: (size) =>
          Math.max(BAR_HANDLE_INSET, (p * size) / 100 - BAR_HANDLE_INSET),
      };
    }
    const half = (last - first) / 2;
    const sign = index === 0 ? 1 : -1;
    return {
      position: `calc(${p}% ${index === 0 ? "+" : "-"} clamp(0px, ${half}% - ${BAR_HANDLE_GAP / 2}px, ${BAR_HANDLE_INSET}px))`,
      at: (size) =>
        (p * size) / 100 +
        sign *
          Math.min(
            BAR_HANDLE_INSET,
            Math.max(0, (half * size) / 100 - BAR_HANDLE_GAP / 2),
          ),
    };
  };
  const barHandlePx =
    bar && labelReach
      ? values.map((_, index) => barHandle(index).at(labelReach.size))
      : [];
  // A range's bar thumbs narrow as the values close, so each stops at the
  // midpoint and neither takes a press on the other's handle. The handles
  // stop short of the midpoint, so each stays inside its own thumb. Stacked
  // on one value, both keep the full width, so a press lands on the top
  // thumb, the one used last, as Base UI decides between stacked thumbs.
  const barGapPx = labelReach ? ((last - first) * labelReach.size) / 100 : 0;
  const barRangeThumbPx =
    bar && isRange && labelReach
      ? barGapPx === 0
        ? 16
        : Math.max(4, Math.min(16, barGapPx))
      : null;
  // The fill's ends grow into the track's rounding as it widens, at a
  // quarter of its width, so a narrow fill keeps a square end instead of
  // reading as a small capsule, and matches the track from 32px on.
  const fillPx = labelReach
    ? ((last - (isRange ? first : 0)) * labelReach.size) / 100
    : null;
  const fillRadius =
    fillPx === null
      ? "var(--radius-sm)"
      : `min(var(--radius-sm), ${fillPx / 4}px)`;

  // Drawn in both layers like the labels, so the handle turns the fill's
  // foreground color exactly where the fill covers it. Near a label it
  // shrinks and fades out of the text's way.
  const barContent = (handleClass: string): React.ReactElement => (
    <>
      <span>{startLabel}</span>
      <span>{endLabel}</span>
      {values.map((_, index) => {
        const { position } = barHandle(index);
        const px = barHandlePx[index];
        const dodge = px !== undefined && nearLabel(px, BAR_LABEL_GAP);
        return (
          <span
            key={index}
            data-dodge={dodge ? "" : undefined}
            data-held={held === index ? "" : undefined}
            data-focused={focused === index ? "" : undefined}
            className={cn(
              "absolute rounded-full",
              // Its own layer, or it repaints at a new subpixel offset on
              // every drag move and shimmers.
              "will-change-transform",
              measured &&
                "transition-[scale,opacity] duration-150 ease-out motion-reduce:transition-none",
              vertical
                ? "left-1/2 h-0.5 w-3.5 -translate-x-1/2 translate-y-1/2"
                : "top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2",
              // Press: the held bar reaches a little further, as if picked
              // up. Keyboard focus does the same, so a range shows which
              // handle the arrow keys move.
              dodge
                ? cn("opacity-25", vertical ? "scale-x-75" : "scale-y-75")
                : vertical
                  ? "data-focused:scale-x-[1.15] data-held:scale-x-[1.15]"
                  : "data-focused:scale-y-[1.15] data-held:scale-y-[1.15]",
              handleClass,
            )}
            style={along(position)}
          />
        );
      })}
    </>
  );

  const steps = React.useMemo(() => {
    if (!showSteps) return [];
    const step = markStep && markStep > 0 ? markStep : (props.step ?? 1);
    const stepCount = Math.floor((max - min) / step) + 1;
    return Array.from({ length: stepCount }, (_, i) => min + i * step);
  }, [showSteps, markStep, props.step, min, max]);

  const handleValueChange: SliderProps["onValueChange"] = (next, details) => {
    onValueChange?.(next, details);
    if (details.isCanceled) {
      if (pointerRef.current) {
        pointerRef.current.rejected = true;
        setDrag(null);
      }
      return;
    }
    if (pointerRef.current) pointerRef.current.rejected = false;
    if (value === undefined) setUncontrolledValues(toValues(next, min, max));
    if (pointerRef.current && details.activeThumbIndex >= 0) {
      pointerRef.current.index = details.activeThumbIndex;
      setHeld(details.activeThumbIndex);
    }
    if (details.reason === "track-press") glide(toValues(next, min, max));
    else if (details.reason === "keyboard") stopGliding();
  };

  const fillStart = isRange ? dragPosition(first) : "0px";
  const fillSize = isRange
    ? inset
      ? `calc(${insetTravel(last - first)})`
      : `${last - first}%`
    : dragPosition(last);
  const indicatorStyle: React.CSSProperties = {
    ...along(fillStart),
    ...(vertical ? { height: fillSize } : { width: fillSize }),
    // At the minimum the inset's fill lies wholly under the thumb, its
    // rounded end on the thumb's own, and the two anti-aliased curves stack
    // into a fringe of fill around the thumb.
    ...(inset && !isRange && last === 0 && { visibility: "hidden" }),
  };

  return (
    <BaseSlider.Root
      data-slot="slider"
      data-color={color}
      defaultValue={defaultValue}
      value={value}
      onValueChange={handleValueChange}
      min={min}
      max={max}
      className={cn(
        "group/slider",
        sliderColors[color],
        sliderVariants({ variant }),
        className,
      )}
      // Drags along the slider's axis are the slider's, so a Base UI drawer
      // or toast doesn't swipe; across it, a drawer still can.
      data-base-ui-swipe-ignore={vertical ? "y" : "x"}
      {...props}
      thumbAlignment={inset ? "edge" : "center"}
    >
      {children}
      <BaseSlider.Control
        data-slot="slider-control"
        onPointerDown={handlePointerDown}
        // Base UI focuses the pressed thumb. After a tap, the browser's
        // stand-in mousedown on the track would blur it again.
        onMouseDown={(event) => event.preventDefault()}
        className="flex flex-1 items-center data-[orientation=horizontal]:py-1 data-[orientation=vertical]:min-h-full data-[orientation=vertical]:flex-col data-[orientation=vertical]:justify-center data-[orientation=vertical]:px-1"
      >
        <BaseSlider.Track
          ref={trackRef}
          data-slot="slider-track"
          style={
            {
              ...trackStyle,
              ...(bar && { "--fill-radius": fillRadius }),
            } as React.CSSProperties
          }
          className={cn(
            sliderTrackVariants({ variant }),
            (bar || inset) &&
              (vertical
                ? "bg-[linear-gradient(to_top,var(--color-control-track)_var(--grey-until),transparent_var(--grey-until)_var(--grey-from),var(--color-control-track)_var(--grey-from))]"
                : "bg-[linear-gradient(to_right,var(--color-control-track)_var(--grey-until),transparent_var(--grey-until)_var(--grey-from),var(--color-control-track)_var(--grey-from))] rtl:bg-[linear-gradient(to_left,var(--color-control-track)_var(--grey-until),transparent_var(--grey-until)_var(--grey-from),var(--color-control-track)_var(--grey-from))]"),
          )}
        >
          {bar ? (
            <>
              <div
                ref={labelsRef}
                aria-hidden
                data-slot="slider-labels"
                className={cn(
                  // Muted-foreground falls under 4.5:1 on the light track.
                  "text-foreground/80 pointer-events-none absolute inset-0 flex justify-between text-[0.8125rem] leading-none font-medium",
                  BAR_LABEL_VALUE,
                  vertical
                    ? "flex-col-reverse items-center py-2.5"
                    : "items-center px-3",
                )}
              >
                {barContent("bg-(--slider-fill) forced-colors:bg-[CanvasText]")}
              </div>
              {/* The fill is a full-size layer clipped to the range, with the
                  labels and handle again in the fill's foreground, so they
                  change color exactly where the fill crosses them. Its own
                  layer: with the handle on one inside it, Chrome can drop the
                  clip's rounded corners until something repaints the track,
                  such as the marks fading in. */}
              <div
                aria-hidden
                data-slot="slider-indicator"
                className={cn(
                  "pointer-events-none absolute inset-0 flex justify-between bg-(--slider-fill) text-[0.8125rem] leading-none font-medium text-(--slider-fill-foreground) will-change-transform",
                  "forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]",
                  BAR_LABEL_VALUE,
                  vertical
                    ? "flex-col-reverse items-center py-2.5 [clip-path:inset(calc(100%-var(--fill-end))_0_var(--fill-start)_0_round_var(--fill-radius))]"
                    : "items-center px-3 [clip-path:inset(0_calc(100%-var(--fill-end))_0_var(--fill-start)_round_var(--fill-radius))] rtl:[clip-path:inset(0_var(--fill-start)_0_calc(100%-var(--fill-end))_round_var(--fill-radius))]",
                )}
              >
                {barContent(
                  "bg-(--slider-fill-foreground) forced-colors:bg-[HighlightText]",
                )}
              </div>
            </>
          ) : (
            <BaseSlider.Indicator
              data-slot="slider-indicator"
              style={indicatorStyle}
              className={cn(
                sliderIndicatorVariants({ variant }),
                // A range's fill starts and ends under the thumbs, so it's
                // square, or its corners and the thumb's leave a notch. Also
                // under orientation, to beat the inset's rounded start.
                isRange &&
                  "rounded-none data-[orientation=horizontal]:rounded-none data-[orientation=vertical]:rounded-none",
              )}
            />
          )}

          {steps.map((step, index) => {
            // Centered thumbs and the bar handle cover the end marks, so skip
            // them.
            if (!inset && (index === 0 || index === steps.length - 1)) {
              return null;
            }

            const filled = isRange
              ? step >= values[0] && step <= values[values.length - 1]
              : step <= values[0];
            // Bar marks hide under the labels and beside the handle, where
            // they'd read as a second handle.
            const markPx = labelReach
              ? (percent(step) * labelReach.size) / 100
              : undefined;
            const covered =
              bar &&
              markPx !== undefined &&
              (nearLabel(markPx, BAR_MARK_GAP) ||
                barHandlePx.some((px) => Math.abs(px - markPx) < BAR_MARK_GAP));

            return (
              <div
                key={step}
                data-slot="slider-step"
                data-filled={filled ? "" : undefined}
                className={cn(
                  "pointer-events-none absolute rounded-full",
                  // Hover-only marks also show while dragging, with keyboard
                  // focus, and on touch screens with any focus, which a tap
                  // gives the thumb until a tap elsewhere. Focus is matched on
                  // the track with the mark itself as the target, not with
                  // `group-has`, which makes every insertion on the page
                  // restyle it.
                  (!bar || measured) &&
                    "transition-opacity duration-150 ease-out",
                  covered
                    ? "opacity-0"
                    : showSteps === "hover" &&
                        "opacity-0 group-hover/slider:opacity-100 group-data-dragging/slider:opacity-100 pointer-coarse:[[data-slot=slider-track]:has(:focus)>&]:opacity-100 [[data-slot=slider-track]:has(:focus-visible)>&]:opacity-100",
                  vertical
                    ? "left-1/2 -translate-x-1/2 translate-y-1/2"
                    : "top-1/2 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2",
                  inset && (vertical ? "h-0.5 w-2" : "h-2 w-0.5"),
                  bar && (vertical ? "h-0.5 w-2.5" : "h-2.5 w-0.5"),
                  inset || bar
                    ? "bg-[color-mix(in_oklab,var(--foreground)_22%,transparent)] data-filled:bg-[color-mix(in_oklab,var(--slider-fill-foreground)_45%,transparent)]"
                    : // A 4px dot drawn as a gradient in a larger box. A
                      // small rounded box snaps to whole device pixels at
                      // fractional scales and can come out oval; the
                      // gradient stays round wherever its box lands.
                      "size-2 bg-[radial-gradient(circle,var(--mark)_1.7px,transparent_2.3px)] [--mark:var(--color-border)] data-filled:[--mark:color-mix(in_oklab,var(--slider-fill-foreground)_45%,transparent)]",
                )}
                style={along(dragPosition(percent(step)))}
              />
            );
          })}

          {values.map((_, index) => (
            <BaseSlider.Thumb
              data-slot="slider-thumb"
              data-orientation={vertical ? "vertical" : "horizontal"}
              key={index}
              index={index}
              getAriaLabel={getAriaLabel}
              // The inset thumb fills the track's height, so it's placed by
              // its edges rather than centered: Base UI's -50% translate
              // lands on a half device pixel at some zooms, and the thumb's
              // own layer then draws half a pixel off the fill.
              style={
                inset
                  ? {
                      ...along(`calc(${insetTravel(percent(values[index]))})`),
                      [vertical ? "left" : "top"]: 0,
                      translate: "none",
                    }
                  : {
                      ...along(dragPosition(percent(values[index]))),
                      ...(barRangeThumbPx !== null &&
                        (vertical
                          ? { height: barRangeThumbPx }
                          : { width: barRangeThumbPx })),
                    }
              }
              onFocus={(event) => {
                if (event.target.matches(":focus-visible")) setFocused(index);
              }}
              onBlur={() => setFocused(null)}
              data-held={held === index ? "" : undefined}
              // cn() merges the variant's overrides (bar's bg-transparent,
              // squareThumb's size) over the base classes; cva only joins.
              className={cn(
                sliderThumbVariants({ variant }),
                // A lone bar handle sits up to 7px to either side of its
                // value, so its hit area widens both ways.
                bar &&
                  !isRange &&
                  "data-[orientation=horizontal]:w-7 data-[orientation=vertical]:h-7",
              )}
            />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}

function SliderValue({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseSlider.Value>) {
  return (
    <BaseSlider.Value
      data-slot="slider-value"
      className={cn(
        "text-foreground text-sm font-medium tabular-nums",
        className,
      )}
      {...props}
    >
      {children}
    </BaseSlider.Value>
  );
}

function SliderLabel({ className, ...props }: BaseSlider.Label.Props) {
  return (
    <BaseSlider.Label
      data-slot="slider-label"
      className={cn(
        "text-foreground text-sm leading-5 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-60 peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Slider, SliderValue, SliderLabel };
