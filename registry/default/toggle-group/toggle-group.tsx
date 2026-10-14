"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";

import { cn } from "@/lib/utils";
import { Separator } from "@/registry/default/separator/separator";
import {
  isIconOnly,
  Toggle,
  type ToggleProps,
} from "@/registry/default/toggle/toggle";

// A shell, as in Button Group, whose items latch. Insets are item borders,
// 2px facing the shell's edge and 1px facing a neighbour; `of` counts items
// only, so separators don't move the ends. Plate corners are the shell's
// minus the 2px edge border.
const toggleGroupVariants = cva(
  [
    "relative isolate flex w-fit items-stretch rounded-(--toggle-group-radius) data-[orientation=vertical]:flex-col",
    // Never narrower than its items; overflow is the container's to handle.
    "min-w-max",
    "[--toggle-group-item-radius:max(0px,calc(var(--toggle-group-radius)-2px))]",
    // Small corners between neighbors, so pressed runs read as one control
    "[--toggle-group-inner-radius:min(3px,var(--toggle-group-item-radius))]",
    // Label-color tints: hover 10%, press 14%, pressed 16%. Override the
    // selected variables to recolor.
    "[--toggle-group-highlight:color-mix(in_oklab,currentColor_10%,transparent)] [--toggle-group-press:color-mix(in_oklab,currentColor_14%,transparent)]",
    "[--toggle-group-selected-bg:color-mix(in_oklab,currentColor_16%,transparent)] [--toggle-group-selected-fg:var(--foreground)]",
    // A row is the ladder height and items stretch to fill it.
    "data-[orientation=horizontal]:h-(--toggle-group-h) data-[orientation=horizontal]:[&>[data-slot=toggle-group-item]]:aspect-square",
    "data-[orientation=horizontal]:[&>[data-slot=toggle-group-item]]:border-y-2 data-[orientation=horizontal]:[&>:nth-child(1_of_[data-slot=toggle-group-item])]:border-s-2 data-[orientation=horizontal]:[&>:nth-last-child(1_of_[data-slot=toggle-group-item])]:border-e-2",
    // A column is at least the ladder width; every item gets the row's
    // paint height.
    "data-[orientation=vertical]:min-w-(--toggle-group-h) data-[orientation=vertical]:[&>[data-slot=toggle-group-item]]:box-content data-[orientation=vertical]:[&>[data-slot=toggle-group-item]]:h-[calc(var(--toggle-group-h)-4px)]",
    "data-[orientation=vertical]:[&>[data-slot=toggle-group-item]]:border-x-2 data-[orientation=vertical]:[&>:nth-child(1_of_[data-slot=toggle-group-item])]:border-t-2 data-[orientation=vertical]:[&>:nth-last-child(1_of_[data-slot=toggle-group-item])]:border-b-2",
    // A square hit area over the whole box, corners included, so hover
    // never drops between items. Beside a separator it reaches the line.
    "[&>[data-slot=toggle-group-item]]:after:absolute [&>[data-slot=toggle-group-item]]:after:content-[''] [&>[data-slot=toggle-group-item]]:after:-inset-x-px [&>[data-slot=toggle-group-item]]:after:-inset-y-0.5 data-[orientation=vertical]:[&>[data-slot=toggle-group-item]]:after:-inset-x-0.5 data-[orientation=vertical]:[&>[data-slot=toggle-group-item]]:after:-inset-y-px",
    "data-[orientation=horizontal]:[&>[data-slot=toggle-group-item]:has(+[data-slot=toggle-group-separator])]:after:-end-[5px] data-[orientation=horizontal]:[&>[data-slot=toggle-group-separator]+[data-slot=toggle-group-item]]:after:-start-[5px] data-[orientation=vertical]:[&>[data-slot=toggle-group-item]:has(+[data-slot=toggle-group-separator])]:after:-bottom-[5px] data-[orientation=vertical]:[&>[data-slot=toggle-group-separator]+[data-slot=toggle-group-item]]:after:-top-[5px]",
    // Icon-only items: the paint is square, whatever each side's border.
    "[&>[data-slot=toggle-group-item][data-icon-only]]:box-content [&>[data-slot=toggle-group-item][data-icon-only]]:aspect-square data-[orientation=vertical]:[&>[data-slot=toggle-group-item][data-icon-only]]:h-auto",
    "data-disabled:opacity-60 data-disabled:[&>*]:opacity-100",
  ],
  {
    variants: {
      variant: {
        outline: "bg-card outline outline-border",
        soft: "bg-secondary",
        ghost: "",
      },
      // Button's height ladder (one step taller below sm); corners step with it.
      size: {
        sm: "[--toggle-group-h:--spacing(9)] sm:[--toggle-group-h:--spacing(8)] [--toggle-group-radius:calc(var(--radius)-2px)]",
        default:
          "[--toggle-group-h:--spacing(10)] sm:[--toggle-group-h:--spacing(9)] [--toggle-group-radius:var(--radius)]",
        lg: "[--toggle-group-h:--spacing(11)] sm:[--toggle-group-h:--spacing(10)] [--toggle-group-radius:calc(var(--radius)+2px)]",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  },
);

type ToggleGroupSize = NonNullable<
  VariantProps<typeof toggleGroupVariants>["size"]
>;

type ToggleGroupContextValue = {
  size: ToggleGroupSize;
  orientation: "horizontal" | "vertical";
};

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: "default",
  orientation: "horizontal",
});

export type ToggleGroupProps = BaseToggleGroup.Props &
  VariantProps<typeof toggleGroupVariants>;

function ToggleGroup({
  className,
  variant,
  size,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupProps) {
  const resolvedSize = size ?? "default";
  const context = React.useMemo(
    () => ({ size: resolvedSize, orientation }),
    [resolvedSize, orientation],
  );

  return (
    <BaseToggleGroup
      data-slot="toggle-group"
      data-variant={variant ?? "outline"}
      data-size={resolvedSize}
      orientation={orientation}
      className={cn(toggleGroupVariants({ variant, size }), className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={context}>
        {children}
      </ToggleGroupContext.Provider>
    </BaseToggleGroup>
  );
}

const itemClasses = cn(
  "h-auto min-w-auto self-stretch border border-transparent text-sm sm:h-auto sm:min-w-auto",
  // Icon-only items drop their padding, so they're square.
  "data-icon-only:px-0",
  // Box corners are the plate's + 2px; the focus ring sits on the plate.
  "rounded-[calc(var(--toggle-group-item-radius)+2px)] before:rounded-(--toggle-group-item-radius) focus-visible:outline-transparent focus-visible:before:outline-2 focus-visible:before:-outline-offset-2 focus-visible:before:outline-ring/50 focus-visible:z-10",
  "[--tgl-bg-hover:var(--toggle-group-highlight)] [--tgl-bg-active:var(--toggle-group-press)] [--tgl-bg-selected:var(--toggle-group-selected-bg)]",
  // Label color
  "text-muted-foreground data-pressed:text-(--toggle-group-selected-fg) hover:not-data-pressed:text-foreground",
  // Instant hover, so a sweep never shows two items half-lit. The press
  // tint and pressed fill still fade (Toggle's 100ms).
  "[transition-duration:100ms,100ms,100ms,100ms,0ms] before:[transition-duration:0ms,100ms,100ms] active:before:[transition-duration:100ms] data-pressed:before:[transition-duration:100ms]",
  // Forced colors drop the fill, so a pressed item gets a Highlight border.
  "forced-colors:data-pressed:border-[Highlight]",
);

// Corners that face another item are small, so a run of pressed items reads
// as one control. Corners at the shell or a separator stay concentric.
const joinedClasses = {
  horizontal: cn(
    "[[data-slot=toggle-group-item]+&]:rounded-s-[calc(var(--toggle-group-inner-radius)+1px)] [[data-slot=toggle-group-item]+&]:before:rounded-s-(--toggle-group-inner-radius)",
    "has-[+[data-slot=toggle-group-item]]:rounded-e-[calc(var(--toggle-group-inner-radius)+1px)] has-[+[data-slot=toggle-group-item]]:before:rounded-e-(--toggle-group-inner-radius)",
  ),
  vertical: cn(
    "[[data-slot=toggle-group-item]+&]:rounded-t-[calc(var(--toggle-group-inner-radius)+1px)] [[data-slot=toggle-group-item]+&]:before:rounded-t-(--toggle-group-inner-radius)",
    "has-[+[data-slot=toggle-group-item]]:rounded-b-[calc(var(--toggle-group-inner-radius)+1px)] has-[+[data-slot=toggle-group-item]]:before:rounded-b-(--toggle-group-inner-radius)",
  ),
};

export type ToggleGroupItemProps = Omit<ToggleProps, "variant" | "size">;

/** A `Toggle` sized and styled by its `ToggleGroup`. */
function ToggleGroupItem({
  className,
  children,
  ...props
}: ToggleGroupItemProps) {
  const { size, orientation } = React.use(ToggleGroupContext);
  const iconOnly = isIconOnly(
    children,
    props["aria-label"] || props["aria-labelledby"],
  );

  return (
    <Toggle
      data-slot="toggle-group-item"
      variant="ghost"
      size={size}
      data-icon-only={iconOnly || undefined}
      className={cn(itemClasses, joinedClasses[orientation], className)}
      {...props}
    >
      {children}
    </Toggle>
  );
}

export type ToggleGroupSeparatorProps = React.ComponentProps<typeof Separator>;

function ToggleGroupSeparator({
  className,
  orientation,
  ...props
}: ToggleGroupSeparatorProps) {
  const group = React.use(ToggleGroupContext);
  const resolved =
    orientation ??
    (group.orientation === "vertical" ? "horizontal" : "vertical");

  return (
    <Separator
      data-slot="toggle-group-separator"
      orientation={resolved}
      className={cn(
        // Air and line are all borders, so both sides snap alike.
        "pointer-events-none flex shrink-0 self-stretch border-transparent bg-transparent data-[orientation=horizontal]:h-auto data-[orientation=horizontal]:w-auto data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-auto",
        "before:border-transparent before:content-[''] after:border-transparent after:content-['']",
        "data-[orientation=vertical]:after:border-s-border data-[orientation=vertical]:border-e-[3px] data-[orientation=vertical]:before:border-s-[3px] data-[orientation=vertical]:after:h-5 data-[orientation=vertical]:after:self-center data-[orientation=vertical]:after:rounded-full data-[orientation=vertical]:after:border-s-[1.5px]",
        "data-[orientation=horizontal]:after:border-t-border data-[orientation=horizontal]:border-b-[3px] data-[orientation=horizontal]:before:border-t-[3px] data-[orientation=horizontal]:after:w-5 data-[orientation=horizontal]:after:self-center data-[orientation=horizontal]:after:rounded-full data-[orientation=horizontal]:after:border-t-[1.5px]",
        className,
      )}
      {...props}
    />
  );
}

export {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupSeparator,
  toggleGroupVariants,
};
