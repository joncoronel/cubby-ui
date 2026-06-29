"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

type BreadcrumbVariant = "default" | "surface";
type BreadcrumbSize = "sm" | "md" | "lg";

interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  variant?: BreadcrumbVariant;
  size?: BreadcrumbSize;
  "aria-label"?: string;
}

function Breadcrumb({
  variant = "default",
  size = "md",
  "aria-label": ariaLabel = "breadcrumb",
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      aria-label={ariaLabel}
      data-slot="breadcrumb"
      data-variant={variant}
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
        "text-muted-foreground inline-flex flex-wrap items-center gap-1.5 text-sm wrap-break-word sm:gap-2.5",
        "group-data-[size=sm]:gap-1 group-data-[size=sm]:text-xs group-data-[size=sm]:sm:gap-2",
        "group-data-[size=lg]:gap-2 group-data-[size=lg]:text-base group-data-[size=lg]:sm:gap-3",
        // surface variant — framed gray track lifted off the page.
        "group-data-[variant=surface]:bg-muted group-data-[variant=surface]:rounded-lg group-data-[variant=surface]:p-1 group-data-[variant=surface]:shadow-[var(--surface-shadow-1),var(--surface-rim-1)]",
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

type BreadcrumbLinkProps = useRender.ComponentProps<"a">;

function BreadcrumbLink({ className, render, ...props }: BreadcrumbLinkProps) {
  const defaultProps = {
    "data-slot": "breadcrumb-link",
    className: cn(
      "rounded-sm transition-colors duration-200 hover:text-foreground",
      "outline-solid outline-2 outline-offset-2 outline-transparent focus-visible:outline-ring/50",
      // surface variant — padded hit area so links sit inside the track.
      "group-data-[variant=surface]:px-1.5 group-data-[variant=surface]:py-0.5",
      className,
    ),
  };

  return useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(defaultProps, props),
  });
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(
        "text-foreground font-normal",
        // surface variant — current-page pill lifted out of the muted track.
        "group-data-[variant=surface]:bg-surface-4 group-data-[variant=surface]:rounded-sm group-data-[variant=surface]:px-2 group-data-[variant=surface]:py-1 group-data-[variant=surface]:shadow-[var(--surface-shadow-3),var(--surface-rim-3)]",
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
      {children ?? separator ?? (
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
      )}
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
        "flex size-9 items-center justify-center",
        "group-data-[size=sm]:size-7",
        "group-data-[size=lg]:size-11",
        className,
      )}
      {...props}
    >
      <HugeiconsIcon
        icon={MoreHorizontalIcon}
        className="size-4 group-data-[size=lg]:size-5 group-data-[size=sm]:size-3"
        strokeWidth={2}
      />
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
