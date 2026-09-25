"use client";

import * as React from "react";
import { Avatar as AvatarBase } from "@base-ui/react/avatar";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "bg-muted relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "size-8 text-sm",
        md: "size-10",
        lg: "size-12 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

function Avatar({
  className,
  size,
  ...props
}: React.ComponentProps<typeof AvatarBase.Root> &
  VariantProps<typeof avatarVariants>) {
  return (
    <AvatarBase.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarBase.Image>) {
  return (
    <AvatarBase.Image
      data-slot="avatar-image"
      className={cn(
        // Stacked over the fallback. `invisible` (not `hidden`) while loading or
        // failed, so `keepMounted` + `loading="lazy"` can still intersect and fetch.
        "absolute inset-0 size-full object-cover data-error:invisible data-loading:invisible",
        // Also hidden while a fallback is mounted (covers pre-hydration SSR, before
        // data-loading is set): stacked, its anti-aliased edge bleeds past the fallback's.
        "[[data-slot=avatar]:has(>[data-slot=avatar-fallback])>&]:invisible",
        // data-loading:opacity-0 so a `keepMounted` image fades in from 0, not 1 → 0 → 1.
        "transition-opacity duration-200 ease-out data-loading:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarBase.Fallback>) {
  return (
    <AvatarBase.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted absolute inset-0 flex size-full items-center justify-center rounded-full select-none",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
