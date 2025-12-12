"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UnfoldMoreIcon,
  Tick02Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

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

//should show the label corresponding to the value
function SelectValue({
  className,
  items,
  children,
  placeholder,
  ...props
}: BaseSelect.Value.Props & {
  items?: Record<string, string> | { label: string; value: string }[];
  placeholder?: string;
}) {
  // this is to handle the multi select
  if (items) {
    const renderValue = (selectedValues: string[]) => {
      if (selectedValues.length === 0) {
        return placeholder;
      }

      const getLabel = (value: string) => {
        if (Array.isArray(items)) {
          const item = items.find((item) => item.value === value);
          return item?.label || value;
        } else {
          return items[value] || value;
        }
      };

      // Comma-separated with truncation
      const labels = selectedValues.map(getLabel);
      return <span className="truncate">{labels.join(", ")}</span>;
    };
    return (
      <BaseSelect.Value
        data-slot="select-value"
        className={cn(`text-sm`, className)}
        {...props}
      >
        {renderValue}
      </BaseSelect.Value>
    );
  }

  return (
    <BaseSelect.Value
      data-slot="select-value"
      className={cn(`text-sm`, className)}
      {...props}
    >
      {children}
    </BaseSelect.Value>
  );
}

function SelectTrigger({
  className,
  children,
  hideChevronRotation = false,
  ...props
}: BaseSelect.Trigger.Props & {
  hideChevronRotation?: boolean;
}) {
  return (
    <BaseSelect.Trigger
      data-slot="select-trigger"
      className={cn(
        // Outline button style
        "group/select-trigger relative inline-flex w-fit items-center justify-between gap-2.5 rounded-lg",
        "bg-card dark:bg-input/35 border",
        // Focus and hover states (outline button style)
        "hover:bg-accent/50 dark:hover:bg-input/50 hover:text-accent-foreground data-placeholder:text-muted-foreground",
        "focus-visible:outline-ring/50 ease-out-cubic outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
        // Invalid state
        "aria-invalid:ring-destructive/30 aria-invalid:border-destructive aria-invalid:ring-2",
        // Size variants
        "h-10 sm:h-9",
        // Text and icon styling
        "px-3 py-2 text-sm font-normal whitespace-nowrap",
        "[&_svg:not([class*='text-'])]:text-muted-foreground",
        "*:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 *:data-[slot=select-value]:overflow-hidden",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Disabled state
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        // Other
        "cursor-pointer select-none",
        className,
      )}
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
  extends Omit<BaseSelect.Positioner.Props, "render"> {
  className?: string;
  showScrollArrows?: boolean;
}

function SelectContent({
  className,
  sideOffset = 6,
  alignItemWithTrigger = false,
  showScrollArrows = false,
  children,
  ...props
}: SelectContentProps) {
  showScrollArrows = showScrollArrows || alignItemWithTrigger;
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
          className={cn(
            // Combobox-style popup
            "bg-popover text-popover-foreground border-border/50 dark:border-border data-[side=none]:ring-border/50 data-[side=none]:dark:ring-border relative flex flex-col rounded-xl border bg-clip-padding data-[side=none]:border-none data-[side=none]:ring-1",
            // Size constraints
            "max-w-[var(--available-width)]",
            "min-w-[var(--anchor-width)]",
            // when data side does not equal none
            "not-data-[side=none]:max-h-[var(--available-height)]",
            // "overflow-hidden",

            // Shadow
            "shadow-[0_8px_20px_0_oklch(0.18_0_0_/_0.10)]",
            // Animation
            "ease-out-cubic origin-[var(--transform-origin)] transition-[transform,scale,opacity] duration-100",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[side=none]:data-[ending-style]:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[side=none]:data-[starting-style]:scale-100 data-[side=none]:data-[starting-style]:opacity-100 data-[side=none]:data-[starting-style]:transition-none",
          )}
        >
          {showScrollArrows && (
            <BaseSelect.ScrollUpArrow
              data-slot="select-scroll-up-arrow"
              className={cn(
                "from-popover top-0 z-[1] hidden w-full cursor-default items-center justify-center rounded-t-xl bg-gradient-to-b from-50% to-transparent py-0.5",
                showScrollArrows && "flex",
              )}
            >
              <HugeiconsIcon
                className="size-4"
                strokeWidth={2}
                icon={ArrowUp01Icon}
              />
            </BaseSelect.ScrollUpArrow>
          )}
          <BaseSelect.List
            data-slot="select-list"
            className={cn(
              // Scrollable list container - max height and overflow are here now
              "scroll-py-6 overflow-y-auto p-1",
              "data-[side=none]:max-h-(--available-height)",
              className,
            )}
          >
            {children}
          </BaseSelect.List>
          {showScrollArrows && (
            <BaseSelect.ScrollDownArrow
              data-slot="select-scroll-down-arrow"
              className={cn(
                "from-popover bottom-0 z-[1] hidden w-full cursor-default items-center justify-center rounded-b-xl bg-gradient-to-t from-50% to-transparent py-0.5",
                showScrollArrows && "flex",
              )}
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
        // Hover and highlight states
        "data-highlighted:bg-accent/50 data-highlighted:text-accent-foreground",
        // Icon and text styling
        "[&_svg:not([class*='text-'])]:text-muted-foreground",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Disabled state
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-60",
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
        "text-muted-foreground px-2 py-1.5 text-xs font-medium",
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
      className={cn("bg-border my-1 h-px min-h-px", className)}
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
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
  SelectBackdrop,
  SelectList,
};
