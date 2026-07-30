"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button as BaseButton } from "@base-ui/react/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

// Two-part button: the root owns layout, text color, and the focus ring;
// backgrounds and borders render on an inner layer that scales down on press
// (the pill shrinks, the label stays put). ButtonGroup targets the layer via
// [data-slot=button-background] when collapsing borders between segments.
//
// Paint: variants set per-state tokens (--btn-bg, --btn-bg-hover,
// --btn-bg-active, --btn-border), the state machine below resolves them into
// --btn-paint, and buttonPaint renders it — on the layer (vars inherit from
// the root) or on the flat recipe's own element. Consumers recolor by
// overriding the tokens (className="[--btn-bg:...]").
const buttonBase = cn(
  "relative isolate inline-flex items-center cursor-pointer justify-center whitespace-nowrap rounded-lg font-medium data-disabled:pointer-events-none data-disabled:opacity-60 data-disabled:focus-visible:outline-ring [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color,scale,opacity,background-color,color] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid",
  // State machine: unset tokens fall through to transparent. Pressing shows
  // the active paint — except on popup triggers (aria-haspopup), which skip
  // pressed feedback entirely (mirroring the press-scale guard) and simply
  // hold their hover paint while open (data-popup-open, stamped by Base UI).
  "[--btn-paint:var(--btn-bg,transparent)] hover:[--btn-paint:var(--btn-bg-hover,var(--btn-bg,transparent))] active:not-aria-[haspopup]:[--btn-paint:var(--btn-bg-active,var(--btn-bg-hover,var(--btn-bg,transparent)))] data-popup-open:[--btn-paint:var(--btn-bg-hover,var(--btn-bg,transparent))]",
);

// Shared by the background layer and the flat recipe: 1px border + fill from
// the resolved vars, transparent when unset.
const buttonPaint =
  "border border-[color:var(--btn-border,transparent)] bg-[var(--btn-paint,transparent)] bg-clip-padding";

// Text classes plus the paint tokens the state machine reads.
const buttonVariantClasses = {
  primary:
    "text-primary-foreground [--btn-bg:var(--primary)] [--btn-bg-hover:var(--primary-hover)] [--btn-bg-active:var(--primary-active)]",
  "primary-soft":
    "text-(--primary-soft-foreground) [--btn-bg:var(--secondary)] [--btn-bg-hover:var(--secondary-hover)] [--btn-bg-active:var(--secondary-active)]",
  neutral:
    "text-neutral-foreground [--btn-bg:var(--neutral)] [--btn-bg-hover:var(--neutral-hover)] [--btn-bg-active:var(--neutral-active)]",
  destructive:
    "text-destructive-foreground [--btn-border:rgb(0_0_0/0.05)] dark:[--btn-border:rgb(255_255_255/0.05)] [--btn-bg:var(--destructive)] [--btn-bg-hover:var(--destructive-hover)] [--btn-bg-active:var(--destructive-active)]",
  "destructive-soft":
    "text-(--destructive-soft-foreground) [--btn-bg:color-mix(in_oklab,var(--destructive)_12%,transparent)] [--btn-bg-hover:color-mix(in_oklab,var(--destructive)_20%,transparent)] [--btn-bg-active:color-mix(in_oklab,var(--destructive)_25%,transparent)]",
  outline:
    "[--btn-border:var(--border)] [--btn-bg:var(--card)] [--btn-bg-hover:var(--outline-hover)] [--btn-bg-active:var(--outline-active)]",
  // Outline's border with ghost's transparent fill, for elevated substrates
  // (Cards, Dialogs) where outline's solid card fill would look mismatched.
  "outline-ghost":
    "[--btn-border:var(--border)] [--btn-bg-hover:var(--surface-hover)] [--btn-bg-active:var(--surface-active)]",
  secondary:
    "text-secondary-foreground [--btn-bg:var(--secondary)] [--btn-bg-hover:var(--secondary-hover)] [--btn-bg-active:var(--secondary-active)]",
  ghost:
    "text-muted-foreground hover:text-foreground data-popup-open:text-foreground [--btn-bg-hover:var(--surface-hover)] [--btn-bg-active:var(--surface-active)]",
  link: "text-primary underline-offset-4 hover:underline",
};

// Heights match the Input/Select ramp (36px desktop default) so buttons pair
// with form fields. Below the sm breakpoint each size is one step taller for
// touch targets.
const buttonSizeVariantClasses = {
  default: "h-10 sm:h-9 px-3.5 gap-1.5 text-sm",
  xs: "h-8 sm:h-7 px-2.5 gap-1 text-xs rounded-md [&_svg:not([class*='size-'])]:size-3.5",
  sm: "h-9 sm:h-8 px-3 gap-1.5 text-[13px]",
  lg: "h-11 sm:h-10 px-3.5 gap-1.5 text-base [&_svg:not([class*='size-'])]:size-5",
  icon: "size-10 sm:size-9 text-sm",
  icon_xs:
    "size-8 sm:size-7 rounded-md text-xs [&_svg:not([class*='size-'])]:size-3.5",
  icon_sm: "size-9 sm:size-8 text-[13px]",
  icon_lg: "size-11 sm:size-10 text-base [&_svg:not([class*='size-'])]:size-5",
};

// Sizes with no text slot. For these, children render bare (no text-box
// wrapper) and leadingIcon/trailingIcon are ignored — a fixed square has no
// room for an icon beside a label.
const iconOnlySizes = new Set<keyof typeof buttonSizeVariantClasses>([
  "icon",
  "icon_xs",
  "icon_sm",
  "icon_lg",
]);

// Fills the root and mirrors its justification so root-level overrides like
// justify-between keep working.
const buttonContentLayout =
  "inline-flex w-full items-center [justify-content:inherit] gap-[inherit]";

// Single-element recipe for styling plain elements as buttons (links,
// calendar nav, ...): paints on the element itself, whole-element press
// scale. The scale divergence from <Button> is deliberate: flat consumers
// are elements that must keep their own semantics (anchors) or live inside
// composite widgets (Toolbar's roving tabindex), where nesting <Button> is
// riskier than the barely-perceptible label movement on these small controls.
const buttonVariants = cva(
  cn(buttonBase, buttonPaint, "active:not-aria-[haspopup]:scale-[0.98]"),
  {
    variants: {
      variant: buttonVariantClasses,
      size: buttonSizeVariantClasses,
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

// <Button>'s root recipe: sets the tokens but leaves painting and press scale
// to the layer. iconLeft/iconRight tighten padding on the icon side (an icon
// is visually lighter than a text edge).
const buttonRootVariants = cva(buttonBase, {
  variants: {
    variant: buttonVariantClasses,
    size: buttonSizeVariantClasses,
    iconLeft: { true: "" },
    iconRight: { true: "" },
  },
  compoundVariants: [
    { size: "default", iconLeft: true, className: "pl-2.5" },
    { size: "default", iconRight: true, className: "pr-2.5" },
    { size: "sm", iconLeft: true, className: "pl-2" },
    { size: "sm", iconRight: true, className: "pr-2" },
    { size: "xs", iconLeft: true, className: "pl-2" },
    { size: "xs", iconRight: true, className: "pr-2" },
    { size: "lg", iconLeft: true, className: "pl-2.5" },
    { size: "lg", iconRight: true, className: "pr-2.5" },
  ],
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

// Variant/size come from the root recipe the component actually evaluates
// (minus its internal icon flags), so the two cvas can't silently drift.
export type ButtonProps = BaseButton.Props &
  Omit<VariantProps<typeof buttonRootVariants>, "iconLeft" | "iconRight"> & {
    loading?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
  };

function Button({
  className,
  variant,
  size,
  loading,
  children,
  disabled,
  focusableWhenDisabled,
  leadingIcon,
  trailingIcon,
  ...props
}: ButtonProps) {
  const isIconOnly = size != null && iconOnlySizes.has(size);

  const content = isIconOnly ? (
    children
  ) : (
    <>
      {leadingIcon}
      {/* text-box trims ascent/descent whitespace for optical centering;
          unsupported browsers fall back to metrics centering. */}
      <span className="[text-box:trim-both_cap_alphabetic]">{children}</span>
      {trailingIcon}
    </>
  );

  return (
    <BaseButton
      data-slot="button"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/button",
        buttonRootVariants({
          variant,
          size,
          iconLeft: !!leadingIcon,
          iconRight: !!trailingIcon,
        }),
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
      focusableWhenDisabled={focusableWhenDisabled ?? loading}
    >
      <span
        aria-hidden
        data-slot="button-background"
        className={cn(
          // Colors arrive via the inherited vars. Press scale skips popup
          // triggers (aria-haspopup): a trigger holds state, so it gets the
          // held data-popup-open background instead.
          "absolute inset-0 rounded-[inherit] transition-[background-color,border-color,scale] duration-100 ease-out group-[:active:not([aria-haspopup])]/button:scale-[0.98]",
          buttonPaint,
        )}
      />
      <span
        data-slot="button-content"
        className={cn("relative", buttonContentLayout)}
      >
        {loading ? (
          <>
            {/* Real content stays laid out (invisible) so the size holds. */}
            <span className={cn(buttonContentLayout, "opacity-0")}>
              {content}
            </span>
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center"
            >
              <HugeiconsIcon
                icon={Loading03Icon}
                className="animate-spin motion-reduce:animate-pulse"
                strokeWidth={2}
              />
            </span>
            <span role="status" className="sr-only">
              Loading
            </span>
          </>
        ) : (
          content
        )}
      </span>
    </BaseButton>
  );
}

export { Button, buttonVariants };
