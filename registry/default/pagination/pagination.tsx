"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/registry/default/button/button";
import "./pagination.css";

export {
  getPaginationRange,
  type PaginationRangeItem,
  type PaginationRangeOptions,
} from "./lib/range";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

// The list is the shell, as in Button Group: links sit inside it, quiet, and
// the current page is a solid indicator that glides to the new page when it
// changes (pagination.css). Links fill the shell edge to edge and carry a
// 2px transparent border with their paint inside, as in Button Group:
// borders round to whole device pixels the same on every side, so the inset
// stays even at fractional display scales, and hit areas reach the shell's
// edges. The shell's corners step down with the size, matching Button; the
// paint's are those minus the shell border and the 2px, so they stay
// concentric and --radius drives both. Set [--radius:9999px] for a pill.
const paginationContentVariants = cva(
  [
    "relative flex w-fit flex-row items-stretch rounded-(--pagination-radius)",
    "[--pagination-item-radius:max(0px,calc(var(--pagination-radius)-var(--pagination-border,0px)-2px))]",
    // The shell is the fixed size and the links stretch to fill it, square
    // at least (aspect-ratio, so wider labels still grow).
    "h-(--pagination-h)",
    // The current page's fill and label. Override to recolor it.
    "[--pagination-current-bg:var(--neutral)] [--pagination-current-fg:var(--neutral-foreground)]",
  ],
  {
    variants: {
      variant: {
        outline:
          "border-border bg-card border bg-clip-padding [--pagination-border:1px]",
        soft: "bg-secondary text-secondary-foreground",
        ghost: "",
      },
      // Outer height, matching Button's ladder (one step taller below sm),
      // and corners that step down with it.
      size: {
        sm: "[--pagination-h:--spacing(9)] sm:[--pagination-h:--spacing(8)] [--pagination-radius:calc(var(--radius)-2px)]",
        default:
          "[--pagination-h:--spacing(10)] sm:[--pagination-h:--spacing(9)] [--pagination-radius:var(--radius)]",
        lg: "[--pagination-h:--spacing(11)] sm:[--pagination-h:--spacing(10)] [--pagination-radius:calc(var(--radius)+2px)]",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  },
);

type PaginationContentProps = React.ComponentProps<"ul"> &
  VariantProps<typeof paginationContentVariants>;

function PaginationContent({
  className,
  variant,
  size,
  children,
  ...props
}: PaginationContentProps) {
  return (
    <ul
      data-slot="pagination-content"
      data-variant={variant ?? "outline"}
      data-size={size ?? "default"}
      className={cn(paginationContentVariants({ variant, size }), className)}
      {...props}
    >
      {/* The current-page fill, placed and animated by pagination.css. */}
      <li aria-hidden data-slot="pagination-indicator" />
      {children}
    </ul>
  );
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="pagination-item"
      className={cn("flex", className)}
      {...props}
    />
  );
}

type PaginationLinkProps = useRender.ComponentProps<"a"> & {
  /** Marks the link as the current page. */
  isActive?: boolean;
  /** Turns the link off, for Previous on the first page or Next on the last. */
  isDisabled?: boolean;
};

// Real anchors styled with the flat `buttonVariants` recipe on purpose:
// rendering them through <Button render={<a/>}> would bolt button semantics
// (role="button", no Space navigation) onto elements that must stay links.
// `render` swaps in a router link (Next.js <Link>) that renders an anchor.
// Ghost, resized to fill the shell, with the label color at 10% for hover,
// as in Button Group.
const linkClasses = cn(
  buttonVariants({ variant: "ghost", size: null }),
  "aspect-square h-auto self-stretch border-2 border-transparent px-2 text-sm tabular-nums",
  // The box's corners are the paint's + its 2px border and the paint sets
  // its own, so paint, gap, and focus ring are concentric. The ring sits on
  // the box's edge at offset 0, 2px off the paint as on a standalone Button.
  "rounded-[calc(var(--pagination-item-radius)+2px)] before:rounded-(--pagination-item-radius) focus-visible:outline-offset-0",
  // Hover is the label color at 10%; a press deepens it to 14%, about
  // Button's active-to-hover step.
  "[--btn-bg-hover:color-mix(in_oklab,currentColor_10%,transparent)] [--btn-bg-active:color-mix(in_oklab,currentColor_14%,transparent)]",
  // Where the indicator can't glide, the current page paints its own fill.
  "aria-[current=page]:text-(--pagination-current-fg) aria-[current=page]:hover:text-(--pagination-current-fg) aria-[current=page]:[--btn-bg:var(--pagination-current-bg)] aria-[current=page]:[--btn-bg-hover:var(--pagination-current-bg)] aria-[current=page]:[--btn-bg-active:var(--pagination-current-bg)]",
  "aria-disabled:pointer-events-none aria-disabled:opacity-60",
  // No transitions on the link itself. When the link that becomes current
  // starts one, Chrome skips the indicator's slide to it. The label inside
  // fades its color instead (pagination.css), and the current link's paint
  // changes at once.
  "transition-[outline-width,outline-offset,outline-color] aria-[current=page]:before:transition-none",
);

function PaginationLink({
  className,
  isActive,
  isDisabled,
  render,
  children,
  ...props
}: PaginationLinkProps) {
  const defaultProps = {
    "aria-current": isActive ? ("page" as const) : undefined,
    "aria-disabled": isDisabled || undefined,
    tabIndex: isDisabled ? -1 : undefined,
    "data-slot": "pagination-link",
    "data-active": isActive || undefined,
    "data-disabled": isDisabled || undefined,
    className: cn(linkClasses, className),
    children: (
      <span
        data-slot="pagination-link-label"
        className="inline-flex items-center gap-[inherit]"
      >
        {children}
      </span>
    ),
  };

  return useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(defaultProps, props),
  });
}

// Below sm, Previous and Next drop their labels to icons; the accessible
// name stays.
function PaginationPrevious({
  className,
  children = "Previous",
  ...props
}: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn("gap-1.5 sm:ps-2 sm:pe-3", className)}
      {...props}
    >
      <HugeiconsIcon icon={ChevronLeftIcon} strokeWidth={2} />
      <span className="max-sm:hidden">{children}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  children = "Next",
  ...props
}: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn("gap-1.5 sm:ps-3 sm:pe-2", className)}
      {...props}
    >
      <span className="max-sm:hidden">{children}</span>
      <HugeiconsIcon icon={ChevronRightIcon} strokeWidth={2} />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn(
        "text-muted-foreground flex aspect-square items-center justify-center self-stretch [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} aria-hidden />
      <span className="sr-only">More pages</span>
    </span>
  );
}

// A read-only position between Previous and Next ("Page 3 of 12",
// "21–40 of 240"), for compact pagers. A polite live region, so the new
// position is announced when it changes.
function PaginationStatus({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      aria-live="polite"
      aria-atomic
      data-slot="pagination-status"
      className={cn(
        "flex items-center justify-center px-2.5 text-sm font-medium whitespace-nowrap tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationStatus,
  paginationContentVariants,
};

export type { PaginationContentProps, PaginationLinkProps };
