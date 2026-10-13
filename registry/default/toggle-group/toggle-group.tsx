"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";

import { cn } from "@/lib/utils";
import { Separator } from "@/registry/default/separator/separator";
import { Toggle, type ToggleProps } from "@/registry/default/toggle/toggle";

// A shell, as in Button Group, whose items latch. The inset is the items'
// own transparent borders: 2px on a side facing the shell's edge, 1px on a
// side facing a neighbour. Borders snap to whole device pixels, so the edge
// is never thinner than the gap, and the edge gap hovers with its item.
// `of` counts items only, so separators don't move the ends. Outline draws
// its line as an outline just outside the shell. Paint corners are the
// shell's minus the 2px edge border.
const toggleGroupVariants = cva(
  [
    "relative isolate flex w-fit items-stretch rounded-(--toggle-group-radius) data-[orientation=vertical]:flex-col",
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
    // A column is at least the ladder width and grows to the widest item;
    // every item gets the row's paint height, whatever its borders.
    "data-[orientation=vertical]:min-w-(--toggle-group-h) data-[orientation=vertical]:[&>[data-slot=toggle-group-item]]:box-content data-[orientation=vertical]:[&>[data-slot=toggle-group-item]]:h-[calc(var(--toggle-group-h)-4px)]",
    "data-[orientation=vertical]:[&>[data-slot=toggle-group-item]]:border-x-2 data-[orientation=vertical]:[&>:nth-child(1_of_[data-slot=toggle-group-item])]:border-t-2 data-[orientation=vertical]:[&>:nth-last-child(1_of_[data-slot=toggle-group-item])]:border-b-2",
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
  // Box corners are the paint's + 2px, the shell's. The ring overlaps the
  // border, inside the gutter.
  "rounded-[calc(var(--toggle-group-item-radius)+2px)] before:rounded-(--toggle-group-item-radius) focus-visible:-outline-offset-1 focus-visible:z-10",
  "[--tgl-bg-hover:var(--toggle-group-highlight)] [--tgl-bg-active:var(--toggle-group-press)] [--tgl-bg-selected:var(--toggle-group-selected-bg)]",
  // Label color
  "text-muted-foreground data-pressed:text-(--toggle-group-selected-fg) hover:not-data-pressed:text-foreground",
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

// A labelled item whose only child is an icon component or <svg>. CSS can't
// tell: :only-child ignores text nodes. The label check keeps a lone text
// component (<Trans>, <FormattedMessage>) from counting as an icon.
function isIconOnly(
  children: React.ReactNode,
  props: ToggleGroupItemProps,
): boolean {
  return (
    React.isValidElement(children) &&
    children.type !== React.Fragment &&
    (typeof children.type !== "string" || children.type === "svg") &&
    Boolean(props["aria-label"] || props["aria-labelledby"])
  );
}

/** A `Toggle` sized and styled by its `ToggleGroup`. */
function ToggleGroupItem({
  className,
  children,
  ...props
}: ToggleGroupItemProps) {
  const { size, orientation } = React.use(ToggleGroupContext);
  const iconOnly = isIconOnly(children, props);

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
        "self-stretch data-[orientation=vertical]:h-auto",
        "data-[orientation=horizontal]:mx-1.5 data-[orientation=horizontal]:my-0.5 data-[orientation=vertical]:mx-0.5 data-[orientation=vertical]:my-1.5",
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
