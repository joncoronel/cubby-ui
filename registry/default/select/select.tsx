"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Select as BaseSelect } from "@base-ui/react/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UnfoldMoreIcon,
  Tick02Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import {
  elevatedSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";
import {
  ScrollArea,
  type ScrollAreaProps,
} from "@/registry/default/scroll-area/scroll-area";

const Select = BaseSelect.Root;

function SelectGroup({ ...props }: BaseSelect.Group.Props) {
  return <BaseSelect.Group data-slot="select-group" {...props} />;
}

function SelectBackdrop({ ...props }: BaseSelect.Backdrop.Props) {
  return <BaseSelect.Backdrop data-slot="select-backdrop" {...props} />;
}

function SelectPortal({ ...props }: BaseSelect.Portal.Props) {
  return <BaseSelect.Portal data-slot="select-portal" {...props} />;
}

function SelectValue({ className, ...props }: BaseSelect.Value.Props) {
  return (
    <BaseSelect.Value
      data-slot="select-value"
      className={cn(`text-sm`, className)}
      {...props}
    />
  );
}

const selectTriggerVariants = cva(
  [
    // Layout — w-fit by default since selects size to their value, not full-width
    "group/select-trigger relative inline-flex w-fit items-center justify-between gap-2.5 rounded-lg border bg-clip-padding",
    // Focus ring
    "focus-visible:outline-ring/50 ease-out-expo outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
    // Invalid state
    "aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid",
    // Text + placeholder + icon
    "text-base font-normal whitespace-nowrap md:text-sm",
    "data-placeholder:text-muted-foreground",
    "[&_svg:not([class*='text-'])]:text-muted-foreground",
    "*:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 *:data-[slot=select-value]:overflow-hidden",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    // Disabled
    "data-disabled:pointer-events-none data-disabled:opacity-60",
    // Interaction
    "cursor-pointer select-none",
  ],
  {
    variants: {
      variant: {
        // Opaque bg for page-level or non-elevated substrates. --outline-hover
        // is a deliberate -5% darken of --card/--input for a sharp hover delta.
        default: "bg-input hover:bg-(--outline-hover)",
        // Translucent overlay for Cards, Dialogs, etc. --surface-hover (alpha
        // overlay) preserves translucency on any substrate depth.
        elevated: "bg-input-elevated hover:bg-(--surface-hover)",
      },
      size: {
        default: "h-10 px-3 py-2 sm:h-9",
        sm: "h-9 px-2.5 py-1.5 sm:h-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type SelectTriggerProps = BaseSelect.Trigger.Props &
  VariantProps<typeof selectTriggerVariants> & {
    hideChevronRotation?: boolean;
  };

function SelectTrigger({
  className,
  children,
  size,
  variant,
  hideChevronRotation = false,
  ...props
}: SelectTriggerProps) {
  return (
    <BaseSelect.Trigger
      data-slot="select-trigger"
      className={cn(selectTriggerVariants({ size, variant }), className)}
      {...props}
    >
      {children}
      <BaseSelect.Icon>
        <HugeiconsIcon strokeWidth={2} icon={UnfoldMoreIcon} />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

interface SelectContentProps
  extends
    Omit<BaseSelect.Positioner.Props, "render">,
    Pick<
      ScrollAreaProps,
      | "fadeEdges"
      | "scrollbarGutter"
      | "persistScrollbar"
      | "hideScrollbar"
      | "nativeScroll"
    > {
  className?: string;
  size?: "default" | "sm";
  /** Surface elevation level for the popup bg (1-8). Bump when nesting inside a Dialog or other elevated container. Defaults to 3. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default so the dropdown reads the same regardless of nesting depth. */
  shadowLevel?: SurfaceLevel;
}

function SelectContent({
  className,
  sideOffset = 4,
  alignItemWithTrigger = false,
  nativeScroll = false,
  fadeEdges = true,
  scrollbarGutter = false,
  persistScrollbar,
  hideScrollbar,
  size,
  level = 3,
  shadowLevel = 3,
  children,
  ...props
}: SelectContentProps) {
  return (
    <SelectPortal>
      <SelectBackdrop />
      <BaseSelect.Positioner
        data-slot="select-positioner"
        sideOffset={sideOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="z-50 select-none"
        {...props}
      >
        <BaseSelect.Popup
          data-slot="select-content"
          data-size={size}
          data-level={level}
          className={cn(
            // Combobox-style popup
            "text-popover-foreground relative flex flex-col overflow-clip rounded-xl",
            // Surface elevation — bg tracks `level`, shadow weight tracks `shadowLevel` (defaults to `level`)
            elevatedSurface(level, shadowLevel),
            // Size constraints
            "max-w-(--available-width)",
            "min-w-(--anchor-width)",
            // when data side does not equal none
            "not-data-[side=none]:max-h-(--available-height)",
            // Animation (disabled for alignItemWithTrigger via data-[side=none] to prevent Firefox jiggle)
            "ease-out-expo origin-(--transform-origin) transition-[transform,scale,opacity] duration-100 data-[side=none]:duration-50",
            "data-ending-style:scale-97 data-ending-style:opacity-0 data-starting-style:scale-97 data-starting-style:opacity-0",
          )}
        >
          {alignItemWithTrigger && (
            <BaseSelect.ScrollUpArrow
              data-slot="select-scroll-up-arrow"
              className="top-0 z-1 flex w-full cursor-default items-center justify-center rounded-t-xl bg-linear-to-b from-(--popup-surface,var(--popover)) from-50% to-transparent py-0.5"
            >
              <HugeiconsIcon
                className="size-4"
                strokeWidth={2}
                icon={ArrowUp01Icon}
              />
            </BaseSelect.ScrollUpArrow>
          )}
          <ScrollArea
            fadeEdges={fadeEdges}
            scrollbarGutter={scrollbarGutter}
            persistScrollbar={persistScrollbar}
            hideScrollbar={hideScrollbar}
            nativeScroll={nativeScroll}
            className={cn("max-h-80 in-data-[side=none]:max-h-full", className)}
          >
            <BaseSelect.List
              data-slot="select-list"
              className={cn("rounded-xl")}
            >
              {children}
            </BaseSelect.List>
          </ScrollArea>
          {alignItemWithTrigger && (
            <BaseSelect.ScrollDownArrow
              data-slot="select-scroll-down-arrow"
              className="bottom-0 z-1 flex w-full cursor-default items-center justify-center rounded-b-xl bg-linear-to-t from-(--popup-surface,var(--popover)) from-50% to-transparent py-0.5"
            >
              <HugeiconsIcon
                className="size-4"
                strokeWidth={2}
                icon={ArrowDown01Icon}
              />
            </BaseSelect.ScrollDownArrow>
          )}
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </SelectPortal>
  );
}

function SelectItem({ className, children, ...props }: BaseSelect.Item.Props) {
  return (
    <BaseSelect.Item
      data-slot="select-item"
      className={cn(
        // Combobox-style item with grid layout
        "relative grid cursor-default grid-cols-[1fr_1rem] items-center gap-2 rounded-md px-3 py-2 text-sm outline-none select-none in-data-[side=none]:min-w-[calc(var(--anchor-width))]",
        // Size variants (inherited from SelectContent via data-size attribute)
        "in-data-[size=sm]:px-2.5 in-data-[size=sm]:py-1.5",
        // Spacing from list edges
        "mx-1 first:mt-1 last:mb-1",
        // Hover and highlight states — uses --surface-hover overlay so the
        // delta is the same regardless of the popup's surface level.
        "data-highlighted:text-accent-foreground data-highlighted:bg-(--surface-hover)",
        // Icon and text styling
        "[&_svg:not([class*='text-'])]:text-muted-foreground",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Disabled state
        "data-disabled:pointer-events-none data-disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <BaseSelect.ItemText className="break-all">
        {children}
      </BaseSelect.ItemText>
      <BaseSelect.ItemIndicator>
        <HugeiconsIcon strokeWidth={2} icon={Tick02Icon} />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

function SelectGroupLabel({
  className,
  ...props
}: BaseSelect.GroupLabel.Props) {
  return (
    <BaseSelect.GroupLabel
      data-slot="select-group-label"
      className={cn(
        "text-muted-foreground bg-(--popup-surface,var(--popover)) px-3.5 py-1.5 pt-2.5 text-xs font-semibold",
        className,
      )}
      {...props}
    />
  );
}

function SelectSeparator({ className, ...props }: BaseSelect.Separator.Props) {
  return (
    <BaseSelect.Separator
      data-slot="select-separator"
      className={cn("bg-border mx-1 my-1 h-px min-h-px", className)}
      {...props}
    />
  );
}

function SelectLabel({ className, ...props }: BaseSelect.Label.Props) {
  return (
    <BaseSelect.Label
      data-slot="select-label"
      className={cn(
        "text-foreground text-sm leading-5 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-60 peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

function SelectList({ className, ...props }: BaseSelect.List.Props) {
  return (
    <BaseSelect.List
      data-slot="select-list"
      className={cn("", className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectTrigger,
  selectTriggerVariants,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
  SelectBackdrop,
  SelectLabel,
  SelectList,
};
