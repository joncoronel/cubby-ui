import * as React from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionVariant =
  | "default"
  | "split"
  | "outline"
  | "nested"
  | "isolated-bordered"
  | "isolated-filled"
  | "isolated-filled-bordered";

function Accordion({
  className,
  multiple = false,
  variant = "default",
  ...props
}: BaseAccordion.Root.Props & { variant?: AccordionVariant }) {
  return (
    <BaseAccordion.Root
      data-slot="accordion"
      data-variant={variant}
      multiple={multiple}
      className={cn(
        "group flex w-full flex-col",
        variant === "split" && "space-y-2",
        variant === "outline" && "bg-card overflow-hidden rounded-lg border",
        variant === "nested" && "bg-muted rounded-lg border p-1",
        className,
      )}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: BaseAccordion.Item.Props) {
  return (
    <BaseAccordion.Item
      data-slot="accordion-item"
      className={cn(
        "ease-out-cubic transition-[margin,border-radius,border] duration-250",
        // Default variant styles
        "group-data-[variant=default]:border-b group-data-[variant=default]:last:border-b-0",
        // Split variant styles (individual cards)
        "group-data-[variant=split]:bg-card group-data-[variant=split]:border-border group-data-[variant=split]:overflow-hidden group-data-[variant=split]:rounded-lg group-data-[variant=split]:border",
        // Outline variant styles (items within single card)
        "group-data-[variant=outline]:border-border group-data-[variant=outline]:border-b group-data-[variant=outline]:last:border-b-0",
        // Nested variant styles - items within the single outer card
        "group-data-[variant=nested]:mt-0.5 group-data-[variant=nested]:first:mt-0",
        // Isolated bordered variant styles - dynamically separates open items from closed ones
        // Base styles: all items have borders and background to look like cards
        "group-data-[variant=isolated-bordered]:bg-card group-data-[variant=isolated-bordered]:border-border group-data-[variant=isolated-bordered]:overflow-hidden group-data-[variant=isolated-bordered]:border",
        // Closed items: group together by overlapping borders with negative margin
        // Only apply to closed items that follow another closed item (not open items, first item, or items after open items)
        "group-data-[variant=isolated-bordered]:relative group-data-[variant=isolated-bordered]:not-first:not-data-open:not-[[data-open]+&]:-mt-px",
        // Opened item - separated with margins
        "group-data-[variant=isolated-bordered]:data-open:mt-2 group-data-[variant=isolated-bordered]:data-open:mb-2 group-data-[variant=isolated-bordered]:data-open:rounded-lg",
        // First item
        "group-data-[variant=isolated-bordered]:first:rounded-t-lg group-data-[variant=isolated-bordered]:data-open:first:mt-0",
        // Last item
        "group-data-[variant=isolated-bordered]:last:rounded-b-lg group-data-[variant=isolated-bordered]:data-open:last:mb-0",
        // Item after open item: round top corners (start of new group)
        "group-data-[variant=isolated-bordered]:[[data-open]+&]:rounded-t-lg",
        // Item before open item: round bottom corners (end of group)
        "group-data-[variant=isolated-bordered]:[&:has(+_[data-open])]:rounded-b-lg",
        // Isolated filled variant
        "group-data-[variant=isolated-filled]:bg-muted group-data-[variant=isolated-filled]:overflow-hidden",
        // Opened item - separated with margins and rounded
        "group-data-[variant=isolated-filled]:data-open:my-2 group-data-[variant=isolated-filled]:data-open:rounded-lg",
        // First item
        "group-data-[variant=isolated-filled]:first:rounded-t-lg group-data-[variant=isolated-filled]:data-open:first:mt-0",
        // Last item
        "group-data-[variant=isolated-filled]:last:rounded-b-lg group-data-[variant=isolated-filled]:data-open:last:mb-0",
        // Item after open item: round top corners (start of new group)
        "group-data-[variant=isolated-filled]:[[data-open]+&]:rounded-t-lg",
        // Item before open item: round bottom corners (end of group)
        "group-data-[variant=isolated-filled]:[&:has(+_[data-open])]:rounded-b-lg",
        // Isolated filled bordered variant - filled background with borders between closed items
        "group-data-[variant=isolated-filled-bordered]:bg-muted group-data-[variant=isolated-filled-bordered]:overflow-hidden",
        // All items except last have border-bottom to prevent layout shift, default to visible border
        "group-data-[variant=isolated-filled-bordered]:not-last:border-border group-data-[variant=isolated-filled-bordered]:not-last:border-b",
        // Make border transparent (invisible) for: items before open items, and open items themselves
        "group-data-[variant=isolated-filled-bordered]:[&:has(+_[data-open])]:border-transparent",
        "group-data-[variant=isolated-filled-bordered]:data-open:border-transparent",
        // Opened item - separated with margins and rounded
        "group-data-[variant=isolated-filled-bordered]:data-open:my-2 group-data-[variant=isolated-filled-bordered]:data-open:rounded-lg",
        // First item
        "group-data-[variant=isolated-filled-bordered]:first:rounded-t-lg group-data-[variant=isolated-filled-bordered]:data-open:first:mt-0",
        // Last item
        "group-data-[variant=isolated-filled-bordered]:last:rounded-b-lg group-data-[variant=isolated-filled-bordered]:data-open:last:mb-0",
        // Item after open item: round top corners (start of new group)
        "group-data-[variant=isolated-filled-bordered]:[[data-open]+&]:rounded-t-lg",
        // Item before open item: round bottom corners (end of group)
        "group-data-[variant=isolated-filled-bordered]:[&:has(+_[data-open])]:rounded-b-lg",

        className,
      )}
      {...props}
    />
  );
}

function AccordionHeader({ className, ...props }: BaseAccordion.Header.Props) {
  return (
    <BaseAccordion.Header
      data-slot="accordion-header"
      className={cn("", className)}
      {...props}
    />
  );
}

interface AccordionTriggerProps extends BaseAccordion.Trigger.Props {
  showIndicator?: boolean;
  indicatorType?: "chevron" | "plus";
  indicatorPosition?: "start" | "end";
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
}

function AccordionTrigger({
  children,
  className,
  showIndicator = true,
  indicatorType = "plus",
  indicatorPosition = "end",
  icon,
  subtitle,
  ...props
}: AccordionTriggerProps) {
  // Determine if we have a start-positioned indicator
  const hasStartIndicator = showIndicator && indicatorPosition === "start";
  const hasEndIndicator = showIndicator && indicatorPosition === "end";

  // Render the appropriate indicator icon
  const renderIndicator = () => {
    if (!showIndicator) return null;

    const indicatorIcon =
      indicatorType === "chevron" ? (
        <ChevronDownIcon
          data-slot="accordion-indicator"
          className="text-muted-foreground ease-out-cubic size-4 shrink-0 transition-transform duration-200"
        />
      ) : (
        <PlusIcon
          data-slot="accordion-indicator"
          className="text-muted-foreground ease-out-cubic size-4 shrink-0 transition-transform duration-200"
        />
      );

    return (
      <span className="text-muted-foreground shrink-0" aria-hidden="true">
        {indicatorIcon}
      </span>
    );
  };

  return (
    <AccordionHeader>
      <BaseAccordion.Trigger
        data-slot="accordion-trigger"
        data-has-icon={hasStartIndicator ? "true" : undefined}
        className={cn(
          "group/trigger flex w-full cursor-pointer items-center justify-between gap-3 p-3.5 text-left text-sm font-medium outline-none disabled:pointer-events-none disabled:opacity-50",
          // Default variant styles
          "group-data-[variant=default]:px-0",
          // Split variant styles
          "group-data-[variant=split]:rounded-t-lg",
          // Nested variant styles - trigger with subtle interaction
          "group-data-[variant=nested]:hover:bg-background group-data-[variant=nested]:dark:hover:bg-background/50 group-data-[variant=nested]:rounded-sm group-data-[variant=nested]:px-3 group-data-[variant=nested]:py-2.5",
          // Indicator rotation animations
          indicatorType === "chevron" &&
            "[&[data-panel-open]_[data-slot=accordion-indicator]]:rotate-180",
          indicatorType === "plus" &&
            "[&[data-panel-open]_[data-slot=accordion-indicator]]:rotate-90",
          className,
        )}
        {...props}
      >
        {/* Start-positioned indicator (replaces icon prop) */}
        {hasStartIndicator && renderIndicator()}

        {/* Legacy icon support (only shown when indicator is at end position) */}
        {icon && !hasStartIndicator && (
          <span className="text-muted-foreground shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}

        {/* Content area */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="underline-offset-2 group-hover/trigger:underline">
            {children}
          </span>
          {subtitle && (
            <span className="text-muted-foreground text-sm no-underline">
              {subtitle}
            </span>
          )}
        </div>

        {/* End-positioned indicator */}
        {hasEndIndicator && renderIndicator()}
      </BaseAccordion.Trigger>
    </AccordionHeader>
  );
}

function AccordionContent({
  children,
  className,
  ...props
}: BaseAccordion.Panel.Props) {
  return (
    <BaseAccordion.Panel
      data-slot="accordion-content"
      className={cn(
        "ease-out-cubic h-(--accordion-panel-height) overflow-hidden text-sm transition-[height,opacity] duration-250 data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0",
      )}
      {...props}
    >
      <div
        className={cn(
          "text-muted-foreground p-3.5",
          "group-data-[variant=default]:px-0 group-data-[variant=default]:pt-0",
          "group-data-[variant=split]:pt-0",
          "group-data-[variant=outline]:pt-0",
          // Nested variant
          "group-data-[variant=nested]:bg-background group-data-[variant=nested]:mt-1 group-data-[variant=nested]:mb-0.5 group-data-[variant=nested]:rounded-sm group-data-[variant=nested]:border group-data-[variant=nested]:p-3 group-data-[variant=nested]:[[data-slot=accordion-item]:last-child_&]:mb-0",
          // Isolated bordered variant
          "group-data-[variant=isolated-bordered]:pt-0",
          // Isolated filled variant
          "group-data-[variant=isolated-filled]:pt-0",
          // Isolated filled bordered variant
          "group-data-[variant=isolated-filled-bordered]:pt-0",
          // Icon alignment - add left padding when parent item contains a trigger with icon
          "[[data-slot=accordion-item]:has([data-has-icon])_&]:pl-[calc(1rem+0.75rem)]",
          "[[data-slot=accordion-item]:has([data-has-icon])_&]:group-data-[variant=default]:pl-[calc(1rem+0.75rem)]",
          className,
        )}
      >
        {children}
      </div>
    </BaseAccordion.Panel>
  );
}

export {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
};

function PlusIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      {/* Horizontal bar - fades out when accordion opens */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.75 12C2.75 11.3096 3.30964 10.75 4 10.75H20C20.6904 10.75 21.25 11.3096 21.25 12C21.25 12.6904 20.6904 13.25 20 13.25H4C3.30964 13.25 2.75 12.6904 2.75 12Z"
        fill="currentColor"
        className="ease-out-cubic transition-opacity duration-200 in-data-panel-open:opacity-0"
      />
      {/* Vertical bar - remains visible (becomes horizontal after 90° rotation) */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.75C12.6904 2.75 13.25 3.30964 13.25 4V20C13.25 20.6904 12.6904 21.25 12 21.25C11.3096 21.25 10.75 20.6904 10.75 20V4C10.75 3.30964 11.3096 2.75 12 2.75Z"
        fill="currentColor"
      />
    </svg>
  );
}
