"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/button/button";
import { Input, type InputProps } from "@/registry/default/input/input";
import { Textarea } from "@/registry/default/textarea/textarea";

const inputGroupVariants = cva(
  [
    "group/input-group relative flex w-full min-w-0 items-center rounded-(--input-group-radius) border bg-clip-padding",
    "[--input-group-item-radius:max(0px,calc(var(--input-group-radius)-3px))]",
    // A fixed shell, as in Number Field: the input stretches to fill it, and
    // buttons sit in it with a 2px transparent-border inset.
    "h-(--input-group-h) has-[>textarea]:h-auto",

    // Addons follow the control: dimmed while it's disabled, and a block
    // addon tucked closer to an input. Here on the group, with a direct
    // child as the target, rather than as group-has variants on the addon:
    // those compile to `:has()` inside `:is(… *)`, which makes Chrome
    // restyle the whole page on any DOM insertion (~8ms on a docs page).
    "[&:has([data-slot=input-group-control]:disabled)>[data-slot=input-group-addon]]:opacity-60",
    "[&:has(>input)>[data-align=block-start]]:pt-2.5 [&:has(>input)>[data-align=block-end]]:pb-2.5",

    // Variants based on alignment.
    "has-[>[data-align=inline-start]]:[&>input]:pl-2",
    "has-[>[data-align=inline-end]]:[&>input]:pr-2",
    "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
    "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",

    // Focus state.
    "has-[[data-slot=input-group-control]:focus-visible]:outline-ring/50 has-[[data-slot=input-group-control]:focus-visible]:outline-2 has-[[data-slot=input-group-control]:focus-visible]:outline-offset-2 has-[[data-slot=input-group-control]:focus-visible]:outline-solid",

    // Error state.
    "has-[[data-slot][aria-invalid=true]]:outline-destructive/50 has-[[data-slot][aria-invalid=true]]:outline-2 has-[[data-slot][aria-invalid=true]]:outline-offset-2 has-[[data-slot][aria-invalid=true]]:outline-solid",

    // Transition outline
    "outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out",
  ],
  {
    variants: {
      // Input's heights (one step taller below sm); corners step with them.
      size: {
        default:
          "[--input-group-h:--spacing(10)] sm:[--input-group-h:--spacing(9)] [--input-group-radius:var(--radius)]",
        sm: "[--input-group-h:--spacing(9)] sm:[--input-group-h:--spacing(8)] [--input-group-radius:calc(var(--radius)-2px)]",
      },
      variant: {
        // Opaque "lifted" bg — use on the page or any non-elevated substrate.
        default: "bg-input",
        // Translucent overlay — use inside Cards, Dialogs, or any surface
        // where the opaque default would collapse into its parent.
        elevated: "bg-input-elevated",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type InputGroupProps = React.ComponentProps<"div"> &
  VariantProps<typeof inputGroupVariants>;

function InputGroup({ className, variant, size, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      data-size={size ?? "default"}
      role="group"
      className={cn(inputGroupVariants({ variant, size }), className)}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)]",
  {
    variants: {
      // Inline addons fill the shell's height. A button on the outer edge
      // takes the place of the padding, so its corners are concentric with
      // the shell's.
      align: {
        "inline-start":
          "order-first self-stretch pl-3 has-[>button:first-child]:pl-0 has-[>kbd]:pl-2",
        "inline-end":
          "order-last self-stretch pr-3 has-[>button:last-child]:pr-0 has-[>kbd]:pr-2",
        "block-start":
          "order-first w-full justify-start px-3 pt-3 [.border-b]:pb-3",
        "block-end":
          "order-last w-full justify-start px-3 pb-3 [.border-t]:pt-3",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

type InputGroupAddonAlign = NonNullable<
  VariantProps<typeof inputGroupAddonVariants>["align"]
>;

const InputGroupAddonContext =
  React.createContext<InputGroupAddonAlign>("inline-start");

export type InputGroupAddonProps = React.ComponentProps<"div"> &
  VariantProps<typeof inputGroupAddonVariants>;

function InputGroupAddon({
  className,
  align,
  onClick,
  ...props
}: InputGroupAddonProps) {
  const resolvedAlign = align ?? "inline-start";

  return (
    <InputGroupAddonContext.Provider value={resolvedAlign}>
      <div
        role="group"
        data-slot="input-group-addon"
        data-align={resolvedAlign}
        className={cn(
          inputGroupAddonVariants({ align: resolvedAlign }),
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          // Leave focus alone for the addon's own controls. Scoped to the
          // addon, since a dialog around the group has a tabindex too.
          const control = (event.target as HTMLElement).closest(
            "button, a, input, select, textarea, [role=button], [tabindex]",
          );
          // Portaled popups bubble here through React but sit outside the DOM.
          if (
            event.defaultPrevented ||
            !event.currentTarget.contains(event.target as Node) ||
            (control && event.currentTarget.contains(control))
          )
            return;
          event.currentTarget.parentElement
            ?.querySelector<HTMLElement>(":scope > input, :scope > textarea")
            ?.focus();
        }}
        {...props}
      />
    </InputGroupAddonContext.Provider>
  );
}

const inputGroupButtonVariants = cva(
  [
    "border-2 border-transparent shadow-none",
    // Hover and press on a quiet button: the label color at 10% / 14%
    "data-[variant=ghost]:[--btn-bg-hover:color-mix(in_oklab,currentColor_10%,transparent)] data-[variant=ghost]:[--btn-bg-active:color-mix(in_oklab,currentColor_14%,transparent)]",
  ],
  {
    variants: {
      size: {
        default: "px-2.5",
        icon: "",
      },
      // Inline: stretched to the shell's height, with box corners the
      // paint's + 2px so paint, gap, and focus ring (at offset 0) are
      // concentric. Block: a fixed height in a toolbar row.
      placement: {
        inline:
          "self-stretch rounded-[calc(var(--input-group-item-radius)+2px)] before:rounded-(--input-group-item-radius) focus-visible:outline-offset-0",
        block: "",
      },
    },
    compoundVariants: [
      { size: "default", placement: "inline", className: "h-auto sm:h-auto" },
      {
        size: "icon",
        placement: "inline",
        className: "size-auto aspect-square sm:size-auto",
      },
      { size: "default", placement: "block", className: "h-8 sm:h-8" },
      { size: "icon", placement: "block", className: "size-8 sm:size-8" },
    ],
    defaultVariants: {
      size: "default",
      placement: "inline",
    },
  },
);

export type InputGroupButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "size"
> & {
  /** `icon` keeps an icon-only button square. */
  size?: "default" | "icon";
};

function InputGroupButton({
  className,
  variant = "ghost",
  size = "default",
  ...props
}: InputGroupButtonProps) {
  const align = React.use(InputGroupAddonContext);
  const placement = align.startsWith("inline") ? "inline" : "block";

  return (
    <Button
      data-slot="input-group-button"
      variant={variant}
      size={size === "icon" ? "icon_sm" : "sm"}
      className={cn(inputGroupButtonVariants({ size, placement }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export type InputGroupInputProps = InputProps;

function InputGroupInput({ className, size, ...props }: InputGroupInputProps) {
  return (
    <Input
      data-slot="input-group-control"
      size={size}
      className={cn(
        "h-auto flex-1 self-stretch rounded-none border-0 bg-transparent shadow-none focus-visible:outline-0 aria-invalid:outline-0 sm:h-auto dark:bg-transparent",
        // Small padding in a small group, weak enough that addon-side
        // padding still wins
        "in-[[data-slot=input-group][data-size=sm]]:px-2.5 in-[[data-slot=input-group][data-size=sm]]:py-1.5",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:outline-0 aria-invalid:outline-0 dark:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};
