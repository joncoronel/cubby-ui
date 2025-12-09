import * as React from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

type BreadcrumbSize = "sm" | "md" | "lg";

interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  size?: BreadcrumbSize;
  "aria-label"?: string;
}

function Breadcrumb({
  size = "md",
  "aria-label": ariaLabel = "breadcrumb",
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      aria-label={ariaLabel}
      data-slot="breadcrumb"
      data-size={size}
      className={cn("group", className)}
      {...props}
    />
  );
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground inline-flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        "group-data-[size=sm]:gap-1 group-data-[size=sm]:text-xs group-data-[size=sm]:sm:gap-2",
        "group-data-[size=lg]:gap-2 group-data-[size=lg]:text-base group-data-[size=lg]:sm:gap-3",
        "rounded-lg p-1",
        "bg-muted border-border/25 border",
        className,
      )}
      {...props}
    />
  );
}

interface BreadcrumbItemProps extends React.ComponentProps<"li"> {
  "aria-label"?: string;
}

function BreadcrumbItem({
  className,
  "aria-label": ariaLabel,
  ...props
}: BreadcrumbItemProps) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      aria-label={ariaLabel}
      {...props}
    />
  );
}

interface BreadcrumbLinkProps extends React.ComponentProps<"a"> {
  render?: (props: { className: string }) => React.ReactNode;
}

function BreadcrumbLink({
  render,
  className,
  children,
  ...props
}: BreadcrumbLinkProps) {
  const linkClassName = cn(
    "hover:text-foreground transition-colors duration-200 rounded-sm px-1.5 py-0.5",
    className,
  );

  if (render) {
    return render({ className: linkClassName });
  }

  return (
    <a data-slot="breadcrumb-link" className={linkClassName} {...props}>
      {children}
    </a>
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn(
        "bg-card dark:bg-accent ring-border/25 dark:ring-border text-foreground rounded-sm px-2 py-1 font-normal ring-1",
        "shadow-[0_1px_2px_0_oklch(0.18_0_0_/_0.06)]",
        className,
      )}
      {...props}
    />
  );
}

interface BreadcrumbSeparatorProps extends React.ComponentProps<"li"> {
  separator?: React.ReactNode;
}

function BreadcrumbSeparator({
  children,
  className,
  separator,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center [&>svg]:size-3.5",
        "group-data-[size=sm]:[&>svg]:size-3",
        "group-data-[size=lg]:[&>svg]:size-4",
        className,
      )}
      {...props}
    >
      {children ?? separator ?? <ChevronRight />}
    </li>
  );
}

interface BreadcrumbEllipsisProps extends React.ComponentProps<"span"> {
  "aria-label"?: string;
}

function BreadcrumbEllipsis({
  className,
  "aria-label": ariaLabel = "More pages",
  ...props
}: BreadcrumbEllipsisProps) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex w-9 items-center justify-center",
        "group-data-[size=sm]:size-7",
        "group-data-[size=lg]:size-11",
        className,
      )}
      {...props}
    >
      <MoreHorizontal className="size-4 group-data-[size=lg]:size-5 group-data-[size=sm]:size-3" />
      <span className="sr-only">{ariaLabel}</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
