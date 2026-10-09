"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";

import { cn } from "@/lib/utils";
import { Separator } from "@/registry/default/separator/separator";
import { Toggle, type ToggleProps } from "@/registry/default/toggle/toggle";

// A shell, as in Button Group, whose items latch. Each pressed item paints
// its own fill, so single and multiple groups look the same. Items fill the
// shell with a 2px transparent-border inset (even at fractional display
// scales); paint corners are the shell's minus its border and the 2px.
const toggleGroupVariants = cva(
  [
    "relative isolate flex w-fit items-stretch rounded-(--toggle-group-radius) data-[orientation=vertical]:flex-col",
    "[--toggle-group-item-radius:max(0px,calc(var(--toggle-group-radius)-var(--toggle-group-border,0px)-2px))]",
    // Corners between neighboring items: small, so a run of pressed items
    // reads as one connected control.
    "[--toggle-group-inner-radius:min(3px,var(--toggle-group-item-radius))]",
    // Hover and press: the label color at 10% / 14%, as in Button Group.
    // Pressed is a deeper tint, pressed in rather than raised. Override the
    // selected variables to recolor.
    "[--toggle-group-highlight:color-mix(in_oklab,currentColor_10%,transparent)] [--toggle-group-press:color-mix(in_oklab,currentColor_14%,transparent)]",
    "[--toggle-group-selected-bg:color-mix(in_oklab,currentColor_16%,transparent)] [--toggle-group-selected-fg:var(--foreground)]",
    // Sizing: the shell is fixed and items stretch to fill it. Vertical
    // shells grow to the widest item.
    "data-[orientation=horizontal]:h-(--toggle-group-h) data-[orientation=horizontal]:[&>[data-slot=toggle-group-item]]:aspect-square",
    "data-[orientation=vertical]:min-w-(--toggle-group-h) data-[orientation=vertical]:[&>[data-slot=toggle-group-item]]:h-[calc(var(--toggle-group-h)-var(--toggle-group-border,0px)*2)]",
    "data-disabled:opacity-60 data-disabled:[&>*]:opacity-100",
  ],
  {
    variants: {
      variant: {
        // Outline's border sits outside the fill, as on an outline Button.
        outline:
          "border-border bg-card border bg-clip-padding [--toggle-group-border:1px]",
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
  size = "default",
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupProps) {
  const context = React.useMemo(
    () => ({ size: size ?? "default", orientation }),
    [size, orientation],
  );

  return (
    <BaseToggleGroup
      data-slot="toggle-group"
      data-variant={variant ?? "outline"}
      data-size={size ?? "default"}
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
  "h-auto min-w-auto self-stretch border-2 border-transparent text-sm sm:h-auto sm:min-w-auto",
  // Icon-only items drop their padding so they stay square.
  "data-icon-only:px-0",
  // Box corners are the paint's + the border, so paint, gap, and focus ring
  // (at offset 0) are concentric.
  "rounded-[calc(var(--toggle-group-item-radius)+2px)] before:rounded-(--toggle-group-item-radius) focus-visible:outline-offset-0 focus-visible:z-10",
  "[--tgl-bg-hover:var(--toggle-group-highlight)] [--tgl-bg-active:var(--toggle-group-press)] [--tgl-bg-selected:var(--toggle-group-selected-bg)]",
  // Labels are muted until hovered or pressed. Hover is gated to real hover:
  // a raw :hover sticks after a tap.
  "text-muted-foreground data-pressed:text-(--toggle-group-selected-fg) [@media(hover:hover)]:hover:text-foreground",
  // Forced colors drop the fill, so a pressed item gets a Highlight border.
  "forced-colors:data-pressed:border-[Highlight]",
);

// Sides facing another item take a 1px border, for a 2px seam between fills,
// and the small inner corners. Sides at the shell or a separator keep the
// 2px border and the shell-concentric corners.
const joinedClasses = {
  horizontal: cn(
    "[[data-slot=toggle-group-item]+&]:border-s [[data-slot=toggle-group-item]+&]:rounded-s-[calc(var(--toggle-group-inner-radius)+1px)] [[data-slot=toggle-group-item]+&]:before:rounded-s-(--toggle-group-inner-radius)",
    "has-[+[data-slot=toggle-group-item]]:border-e has-[+[data-slot=toggle-group-item]]:rounded-e-[calc(var(--toggle-group-inner-radius)+1px)] has-[+[data-slot=toggle-group-item]]:before:rounded-e-(--toggle-group-inner-radius)",
  ),
  vertical: cn(
    "[[data-slot=toggle-group-item]+&]:border-t [[data-slot=toggle-group-item]+&]:rounded-t-[calc(var(--toggle-group-inner-radius)+1px)] [[data-slot=toggle-group-item]+&]:before:rounded-t-(--toggle-group-inner-radius)",
    "has-[+[data-slot=toggle-group-item]]:border-b has-[+[data-slot=toggle-group-item]]:rounded-b-[calc(var(--toggle-group-inner-radius)+1px)] has-[+[data-slot=toggle-group-item]]:before:rounded-b-(--toggle-group-inner-radius)",
  ),
};

export type ToggleGroupItemProps = Omit<ToggleProps, "variant" | "size">;

/** A `Toggle` sized and styled by its `ToggleGroup`. */
// A lone icon component or <svg>, with no text beside it. CSS can't tell:
// :only-child ignores text nodes.
function isIconOnly(children: React.ReactNode): boolean {
  return (
    React.isValidElement(children) &&
    (typeof children.type !== "string" || children.type === "svg")
  );
}

function ToggleGroupItem({
  className,
  children,
  ...props
}: ToggleGroupItemProps) {
  const { size, orientation } = React.use(ToggleGroupContext);

  return (
    <Toggle
      data-slot="toggle-group-item"
      variant="ghost"
      size={size}
      data-icon-only={isIconOnly(children) || undefined}
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
        "relative !m-0 self-stretch data-[orientation=vertical]:h-auto",
        "data-[orientation=horizontal]:!mx-1.5 data-[orientation=horizontal]:!my-0.5 data-[orientation=vertical]:!mx-0.5 data-[orientation=vertical]:!my-1.5",
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
