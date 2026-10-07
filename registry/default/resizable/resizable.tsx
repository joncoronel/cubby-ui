"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

// How long a group must go without changing size before layout changes
// animate again. Long enough to cover a window drag's trailing events.
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

  // Layout changes the user asks for (collapse, expand, double-click reset,
  // keyboard steps, setLayout) ease into place. Changes the browser forces do
  // not: on mount the library swaps the SSR flex-basis for its own flex-grow,
  // and a pixel-constrained panel recomputes on every frame of a window
  // resize. Easing either would trail behind. So `data-settled` is only set
  // once the group has held its size for a moment, and dropped the instant it
  // changes. Written to the DOM directly so React never reconciles it away.
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
        // The library sizes the group with an inline `height: 100%` and
        // `width: 100%`, which no class can beat. Clearing them hands sizing to
        // `size-full` below, so `className="h-64"` works like anywhere else.
        style={{ height: undefined, width: undefined, ...style }}
        className={cn(
          "size-full",
          // The flex-grow the library writes inline is the only thing that
          // moves. A drag must track the pointer 1:1, so it never eases.
          "motion-safe:data-settled:not-has-[>[data-separator=active]]:*:data-panel:[transition:flex-grow_var(--resizable-duration,320ms)_var(--ease-out-expo)]",
          className,
        )}
        {...props}
      />
    </OrientationContext.Provider>
  );
}

export type ResizablePanelProps = ResizablePrimitive.PanelProps;

// `className` and `style` land on the panel's inner scroll container, not the
// flex item. The library makes that container `overflow: auto`, so content
// squeezed along the resize axis grew a scrollbar. It clips on that axis
// instead, since the user chose the size, and still scrolls on the other.
// The library writes the overflow inline, so it's overridden through `style`.
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

// Every state reads the `data-separator` attribute the library maintains
// (inactive, hover, active, focus, disabled), so pointer hit-testing stays
// with the library and its forgiving hit area, not the painted 1px.
// `aria-orientation` is the line's own axis: a horizontal group draws vertical
// lines.
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
        // A gutter between panels that are cards of their own. Override the
        // width with a `w-*` / `h-*` class.
        gap: "aria-[orientation=vertical]:w-2 aria-[orientation=horizontal]:h-2",
      },
    },
    defaultVariants: {
      variant: "line",
    },
  },
);

// The bar that answers the pointer. It waits a beat before showing on hover,
// so sweeping the cursor across a layout doesn't flicker every line it
// crosses, but appears at once on press and leaves at once. Its growth is a
// variable rather than competing scale classes: every live state writes
// `--reach`, so none of them depends on stylesheet order to beat the rest.
//
// A plain click focuses the handle (so arrow keys work next), and while
// focused the library reports `focus` instead of `hover`. The bar stays up
// for that state, so a clicked handle doesn't go blank under the cursor.
// Keyboard focus is focus-visible and paints primary on top.
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
        // Full-length bar, three times the hairline, growing out of it.
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

// A raised pill sitting on the line. The edge is a real border, not the
// surface ladder's rim: a rim that faint disappears against a dark page.
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

// Cells resize on both axes, so they clip on both, like panels do on theirs.
// The library writes `overflow: auto` inline, so it's overridden through
// `style`. Put a scroll container inside a cell that needs one.
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

  // Gridline forwards only className, style, disabled, elementRef and
  // children to its element, so the data attributes go on through the ref.
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
