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

// The list is a shell, as in Button Group, with a current-page fill that
// glides between links. Insets are link borders (pagination.css); plate
// corners are the shell's minus the 2px edge border.
const paginationContentVariants = cva(
  [
    "relative isolate flex w-fit flex-row items-stretch rounded-(--pagination-radius)",
    "[--pagination-item-radius:max(0px,calc(var(--pagination-radius)-2px))]",
    // Fixed shell; links stretch to fill it
    "h-(--pagination-h)",
    // Current page: the emphasis grey every selection uses (override to recolor)
    "[--pagination-current-bg:var(--emphasis)] [--pagination-current-fg:var(--emphasis-foreground)]",
  ],
  {
    variants: {
      variant: {
        // Outline draws its line as an outline just outside the shell.
        outline: "bg-(--outline) outline outline-(--outline-border)",
        soft: "bg-secondary text-secondary-foreground",
        ghost: "",
      },
      // Button's height ladder (one step taller below sm); corners step with it.
      size: {
        sm: "[--pagination-h:--spacing(9)] sm:not-pointer-coarse:[--pagination-h:--spacing(8)] [--pagination-radius:calc(var(--radius)-2px)]",
        default:
          "[--pagination-h:--spacing(10)] sm:not-pointer-coarse:[--pagination-h:--spacing(9)] [--pagination-radius:var(--radius)]",
        lg: "[--pagination-h:--spacing(11)] sm:not-pointer-coarse:[--pagination-h:--spacing(10)] [--pagination-radius:calc(var(--radius)+2px)]",
      },
    },
    defaultVariants: {
      variant: "soft",
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
      data-variant={variant ?? "soft"}
      data-size={size ?? "default"}
      className={cn(paginationContentVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {/* Last, so first-child selectors still match the first item. */}
      <li aria-hidden data-slot="pagination-indicator" />
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

// Real anchors with the flat `buttonVariants` recipe: <Button render={<a/>}>
// would add button semantics to elements that must stay links.
const linkClasses = cn(
  buttonVariants({ variant: "ghost", size: null }),
  // The plate (content box, no padding) is square; wider labels grow it.
  "box-content aspect-square h-auto self-stretch px-0 text-sm tabular-nums",
  // Box corners are the plate's + 2px; the focus ring is in pagination.css.
  "rounded-[calc(var(--pagination-item-radius)+2px)] before:rounded-(--pagination-item-radius)",
  // Hover and press: the pure 8% / 10% overlays (black, white in dark)
  "[--btn-bg-hover:var(--surface-active)] [--btn-bg-active:var(--surface-selected)]",
  // Current page fallback fill, where the indicator can't glide
  "aria-[current=page]:text-(--pagination-current-fg) aria-[current=page]:hover:text-(--pagination-current-fg) aria-[current=page]:[--btn-bg:var(--pagination-current-bg)] aria-[current=page]:[--btn-bg-hover:var(--pagination-current-bg)] aria-[current=page]:[--btn-bg-active:var(--pagination-current-bg)]",
  "aria-disabled:pointer-events-none aria-disabled:opacity-60",
  // No transitions on the link: Chrome skips the indicator's slide when the
  // new current link starts one. Hover is instant; the press tint still
  // fades (Button's 100ms).
  "transition-[outline-width,outline-color] before:[transition-duration:0ms,100ms,100ms] active:before:[transition-duration:100ms] aria-[current=page]:before:transition-none",
);

function PaginationLink({
  className,
  isActive,
  isDisabled,
  render,
  children,
  href,
  onClick,
  ...props
}: PaginationLinkProps) {
  const defaultProps = {
    "aria-current": isActive ? ("page" as const) : undefined,
    "aria-disabled": isDisabled || undefined,
    // No href, so a screen reader's virtual cursor can't follow it.
    href: isDisabled ? undefined : href,
    role: isDisabled ? "link" : undefined,
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    },
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

// Below sm the label is sr-only; it stays the accessible name.
function PaginationPrevious({
  className,
  children = "Previous",
  ...props
}: PaginationLinkProps) {
  return (
    <PaginationLink
      className={cn("gap-1.5 sm:ps-2 sm:pe-3", className)}
      {...props}
    >
      <HugeiconsIcon icon={ChevronLeftIcon} strokeWidth={2} aria-hidden />
      <span className="max-sm:sr-only">{children}</span>
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
      className={cn("gap-1.5 sm:ps-3 sm:pe-2", className)}
      {...props}
    >
      <span className="max-sm:sr-only">{children}</span>
      <HugeiconsIcon icon={ChevronRightIcon} strokeWidth={2} aria-hidden />
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

// Read-only position for compact pagers, announced when it changes.
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
