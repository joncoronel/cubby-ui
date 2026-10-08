"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

// Quiet period after the group last resized before layout changes ease again.
const SETTLE_DELAY = 150;

function assignRef<T>(ref: React.Ref<T> | undefined, value: T): void {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

const OrientationContext =
  React.createContext<ResizablePrimitive.Orientation>("horizontal");

export type ResizablePanelGroupProps = ResizablePrimitive.GroupProps;

function ResizablePanelGroup({
  className,
  elementRef,
  orientation = "horizontal",
  style,
  ...props
}: ResizablePanelGroupProps) {
  const localRef = React.useRef<HTMLDivElement | null>(null);
  const ref = React.useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      assignRef(elementRef, node);
    },
    [elementRef],
  );

  // Requested layout changes (collapse, reset, keyboard, setLayout) ease;
  // forced ones (mount, window resize) must not, or panels trail behind.
  // `data-settled` marks a group that has held its size, and is set on the
  // DOM directly so React never reconciles it away.
  React.useEffect(() => {
    const node = localRef.current;
    if (!node) return;

    let timeout: number | undefined;
    const observer = new ResizeObserver(() => {
      delete node.dataset.settled;
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        node.dataset.settled = "";
      }, SETTLE_DELAY);
    });
    observer.observe(node);

    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return (
    <OrientationContext.Provider value={orientation}>
      <ResizablePrimitive.Group
        data-slot="resizable-panel-group"
        data-orientation={orientation}
        orientation={orientation}
        elementRef={ref}
        // The library's inline 100% height/width beats any class; clearing it
        // lets `size-full` and a caller's `h-*` apply.
        style={{ height: undefined, width: undefined, ...style }}
        className={cn(
          "size-full",
          // Never during a drag, which must track the pointer 1:1. Written as
          // a root :has() with a direct-child target: Tailwind's not-has +
          // star variants restyle the whole page on any DOM change (TODO.md).
          "motion-safe:[&[data-settled]:not(:has(>[data-separator=active]))>[data-panel]]:[transition:flex-grow_var(--resizable-duration,320ms)_var(--ease-out-expo)]",
          className,
        )}
        {...props}
      />
    </OrientationContext.Provider>
  );
}

export type ResizablePanelProps = ResizablePrimitive.PanelProps;

// `className` and `style` land on the inner scroll container. Its inline
// `overflow: auto` is overridden to clip on the resize axis instead of growing
// a scrollbar, while still scrolling on the other.
function ResizablePanel({ style, ...props }: ResizablePanelProps) {
  const orientation = React.useContext(OrientationContext);

  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      style={{
        overflow: orientation === "horizontal" ? "hidden auto" : "auto hidden",
        ...style,
      }}
      {...props}
    />
  );
}

// States come from the library's `data-separator`, so hit-testing uses its
// wide hit area rather than the painted 1px. `aria-orientation` is the line's
// own axis: a horizontal group draws vertical lines.
const resizableHandleVariants = cva(
  [
    "group/handle relative flex shrink-0 items-center justify-center outline-none",
    "aria-[orientation=vertical]:w-px aria-[orientation=horizontal]:h-px",
  ],
  {
    variants: {
      variant: {
        line: "bg-border",
        grip: "bg-border",
        // Gutter between card-like panels; resize it with a `w-*` / `h-*` class.
        gap: "aria-[orientation=vertical]:w-2 aria-[orientation=horizontal]:h-2",
      },
    },
    defaultVariants: {
      variant: "line",
    },
  },
);

// Shows after a short delay on hover, so sweeping past doesn't flicker, and at
// once on press. `--reach` drives the scale so no state depends on class order.
// A clicked handle keeps focus for arrow keys and reports `focus`, not `hover`,
// so the bar stays up for it too.
const resizableIndicatorVariants = cva(
  [
    "pointer-events-none absolute opacity-0",
    "transition-[opacity,scale,background-color] duration-150 ease-out motion-reduce:transition-none",
    "group-data-[separator=hover]/handle:opacity-100 group-data-[separator=hover]/handle:delay-100 group-data-[separator=hover]/handle:[--reach:1]",
    "group-data-[separator=focus]/handle:opacity-100 group-data-[separator=focus]/handle:[--reach:1]",
    "group-data-[separator=active]/handle:bg-primary group-data-[separator=active]/handle:opacity-100 group-data-[separator=active]/handle:[--reach:1]",
    "group-focus-visible/handle:bg-primary group-focus-visible/handle:opacity-100 group-focus-visible/handle:[--reach:1]",
    "group-data-[separator=disabled]/handle:hidden",
  ],
  {
    variants: {
      variant: {
        // Full-length bar growing out of the hairline.
        line: [
          "bg-foreground/25 [--reach:0.34]",
          "group-aria-[orientation=vertical]/handle:inset-y-0 group-aria-[orientation=vertical]/handle:w-[3px] group-aria-[orientation=vertical]/handle:scale-x-(--reach)",
          "group-aria-[orientation=horizontal]/handle:inset-x-0 group-aria-[orientation=horizontal]/handle:h-[3px] group-aria-[orientation=horizontal]/handle:scale-y-(--reach)",
        ],
        // A short pill floating in the gutter.
        gap: [
          "bg-foreground/20 rounded-full [--reach:0.75] scale-(--reach)",
          "group-aria-[orientation=vertical]/handle:h-8 group-aria-[orientation=vertical]/handle:w-1",
          "group-aria-[orientation=horizontal]/handle:h-1 group-aria-[orientation=horizontal]/handle:w-8",
        ],
      },
    },
  },
);

// A real border, not the surface rim, which vanishes against a dark page.
const resizableGripClassName = cn(
  "pointer-events-none relative shrink-0 rounded-full border",
  "bg-surface-3 border-foreground/15 shadow-(--surface-shadow-3)",
  "transition-[background-color,border-color] duration-150 ease-out motion-reduce:transition-none",
  "group-aria-[orientation=vertical]/handle:h-6 group-aria-[orientation=vertical]/handle:w-2",
  "group-aria-[orientation=horizontal]/handle:h-2 group-aria-[orientation=horizontal]/handle:w-6",
  "group-data-[separator=active]/handle:bg-primary group-data-[separator=active]/handle:border-primary",
  "group-focus-visible/handle:bg-primary group-focus-visible/handle:border-primary",
  "group-data-[separator=disabled]/handle:opacity-60",
);

type ResizableHandleVariant = NonNullable<
  VariantProps<typeof resizableHandleVariants>["variant"]
>;

function ResizableHandleContent({
  variant,
  children,
}: {
  variant: ResizableHandleVariant;
  children?: React.ReactNode;
}) {
  return (
    <>
      <span
        data-slot="resizable-handle-indicator"
        aria-hidden
        className={resizableIndicatorVariants({
          variant: variant === "gap" ? "gap" : "line",
        })}
      />
      {variant === "grip" && (
        <span
          data-slot="resizable-handle-grip"
          aria-hidden
          className={resizableGripClassName}
        />
      )}
      {children}
    </>
  );
}

export type ResizableHandleProps = ResizablePrimitive.SeparatorProps &
  VariantProps<typeof resizableHandleVariants>;

function ResizableHandle({
  variant,
  className,
  children,
  ...props
}: ResizableHandleProps) {
  const resolvedVariant = variant ?? "line";

  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      data-variant={resolvedVariant}
      className={cn(
        resizableHandleVariants({ variant: resolvedVariant }),
        className,
      )}
      {...props}
    >
      <ResizableHandleContent variant={resolvedVariant}>
        {children}
      </ResizableHandleContent>
    </ResizablePrimitive.Separator>
  );
}

export type ResizableGridProps = ResizablePrimitive.GridProps;

function ResizableGrid({ className, style, ...props }: ResizableGridProps) {
  return (
    <ResizablePrimitive.Grid
      data-slot="resizable-grid"
      // Same inline sizing as the group; see ResizablePanelGroup.
      style={{ height: undefined, width: undefined, ...style }}
      className={cn("size-full", className)}
      {...props}
    />
  );
}

export type ResizableCellProps = ResizablePrimitive.CellProps;

// Cells resize on both axes, so they clip on both. Inline, like the library's
// `overflow: auto` it replaces.
function ResizableCell({ style, ...props }: ResizableCellProps) {
  return (
    <ResizablePrimitive.Cell
      data-slot="resizable-cell"
      style={{ overflow: "hidden", ...style }}
      {...props}
    />
  );
}

export type ResizableGridlineProps = ResizablePrimitive.GridlineProps &
  VariantProps<typeof resizableHandleVariants>;

function ResizableGridline({
  variant,
  className,
  children,
  elementRef,
  ...props
}: ResizableGridlineProps) {
  const resolvedVariant = variant ?? "line";

  // Gridline drops unknown props, so the data attributes go on via the ref.
  const ref = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        node.dataset.slot = "resizable-gridline";
        node.dataset.variant = resolvedVariant;
      }
      assignRef(elementRef, node);
    },
    [elementRef, resolvedVariant],
  );

  return (
    <ResizablePrimitive.Gridline
      {...(props as ResizablePrimitive.GridlineProps)}
      elementRef={ref}
      className={cn(
        resizableHandleVariants({ variant: resolvedVariant }),
        // Gridlines are stretched by the grid, not the flex row.
        "aria-[orientation=horizontal]:w-auto aria-[orientation=vertical]:h-auto",
        className,
      )}
    >
      <ResizableHandleContent variant={resolvedVariant}>
        {children}
      </ResizableHandleContent>
    </ResizablePrimitive.Gridline>
  );
}

export {
  ResizableCell,
  ResizableGrid,
  ResizableGridline,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  resizableHandleVariants,
};

export {
  useDefaultGridLayout,
  useDefaultLayout,
  useGridRef,
  useGroupRef,
  usePanelRef,
} from "react-resizable-panels";

export type {
  GridImperativeHandle,
  GridLayout,
  GroupImperativeHandle,
  Layout,
  PanelImperativeHandle,
  PanelSize,
} from "react-resizable-panels";
