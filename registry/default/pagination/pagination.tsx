import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/button/button";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  isDisabled?: boolean;
} & Pick<
  React.ComponentProps<typeof Button>,
  "size" | "leadingIcon" | "trailingIcon"
> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  isDisabled,
  size = "icon",
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size={size}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      nativeButton={false}
      disabled={isDisabled}
      className={className}
      render={
        <a
          aria-current={isActive ? "page" : undefined}
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        />
      }
    >
      {children}
    </Button>
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      leadingIcon={
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
      }
      className={className}
      {...props}
    >
      Previous
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      trailingIcon={
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
      }
      className={className}
      {...props}
    >
      Next
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-10 items-center justify-center", className)}
      {...props}
    >
      <HugeiconsIcon icon={MoreHorizontalIcon} size={16}  strokeWidth={2} />
      <span className="sr-only">More pages</span>
    </span>
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
};
