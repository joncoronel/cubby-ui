"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button as BaseButton } from "@base-ui/react/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

// The button's visuals are split across two elements: the root owns layout,
// text color, and the focus ring, while backgrounds and borders render on a
// separate layer inside <Button> that scales down on press — the pill shrinks
// but the label stays put. ButtonGroup targets the layer (via
// [data-slot=button-background]) alongside child roots when collapsing
// borders between segments.
const buttonBase =
  "relative isolate inline-flex items-center cursor-pointer justify-center whitespace-nowrap rounded-lg font-medium data-disabled:pointer-events-none data-disabled:opacity-60 data-disabled:focus-visible:outline-ring [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color,scale,opacity,shadow,background-color,color] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid";

// Root-level variant styles: text color only. Borders live with the
// backgrounds so the whole pill (border + fill) scales together on press.
const buttonRootVariantClasses = {
  primary: "text-primary-foreground",
  "primary-soft": "text-(--primary-soft-foreground)",
  neutral: "text-neutral-foreground",
  destructive: "text-destructive-foreground",
  "destructive-soft": "text-(--destructive-soft-foreground)",
  outline: "",
  "outline-ghost": "",
  secondary: "text-secondary-foreground",
  ghost:
    "text-muted-foreground hover:text-foreground data-popup-open:text-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

// Background variant styles. Each state color carries a plain prefix (flat
// single-element usage via `buttonVariants`) and a `group-*/button:` twin
// (<Button>'s background layer, which isn't its own :hover/:active target
// when the cursor sits over the label). States: hover, active (pressed goes
// one step past hover), and data-popup-open — Base UI stamps that attribute
// on trigger buttons, so a trigger holds its hover color while the
// popover/dropdown it anchors is open.
const buttonBackgroundVariantClasses = {
  primary:
    "bg-primary hover:bg-(--primary-hover) group-hover/button:bg-(--primary-hover) active:bg-(--primary-active) group-active/button:bg-(--primary-active) data-popup-open:bg-(--primary-hover) group-data-popup-open/button:bg-(--primary-hover)",
  "primary-soft":
    "bg-secondary hover:bg-(--secondary-hover) group-hover/button:bg-(--secondary-hover) active:bg-(--secondary-active) group-active/button:bg-(--secondary-active) data-popup-open:bg-(--secondary-hover) group-data-popup-open/button:bg-(--secondary-hover)",
  neutral:
    "bg-neutral hover:bg-(--neutral-hover) group-hover/button:bg-(--neutral-hover) active:bg-(--neutral-active) group-active/button:bg-(--neutral-active) data-popup-open:bg-(--neutral-hover) group-data-popup-open/button:bg-(--neutral-hover)",
  destructive:
    "border border-black/5 dark:border-white/5 bg-destructive hover:bg-(--destructive-hover) group-hover/button:bg-(--destructive-hover) active:bg-(--destructive-active) group-active/button:bg-(--destructive-active) data-popup-open:bg-(--destructive-hover) group-data-popup-open/button:bg-(--destructive-hover)",
  "destructive-soft":
    "bg-destructive/12 hover:bg-destructive/20 group-hover/button:bg-destructive/20 active:bg-destructive/25 group-active/button:bg-destructive/25 data-popup-open:bg-destructive/20 group-data-popup-open/button:bg-destructive/20",
  outline:
    "border bg-card bg-clip-padding hover:bg-(--outline-hover) group-hover/button:bg-(--outline-hover) active:bg-(--outline-active) group-active/button:bg-(--outline-active) data-popup-open:bg-(--outline-hover) group-data-popup-open/button:bg-(--outline-hover)",
  // Bordered ghost — outline's border with ghost's transparent fill and alpha
  // overlay states, so it adapts to elevated substrates (Cards, Dialogs)
  // where outline's solid bg-card would read as a mismatched patch.
  "outline-ghost":
    "border hover:bg-surface-hover group-hover/button:bg-surface-hover active:bg-(--surface-active) group-active/button:bg-(--surface-active) data-popup-open:bg-surface-hover group-data-popup-open/button:bg-surface-hover",
  secondary:
    "border border-transparent bg-secondary hover:bg-(--secondary-hover) group-hover/button:bg-(--secondary-hover) active:bg-(--secondary-active) group-active/button:bg-(--secondary-active) data-popup-open:bg-(--secondary-hover) group-data-popup-open/button:bg-(--secondary-hover)",
  ghost:
    "border border-transparent hover:bg-surface-hover group-hover/button:bg-surface-hover active:bg-(--surface-active) group-active/button:bg-(--surface-active) data-popup-open:bg-surface-hover group-data-popup-open/button:bg-surface-hover",
  link: "",
};

type ButtonVariant = keyof typeof buttonRootVariantClasses;

// Heights match the Input/Select ramp (36px desktop default) so buttons pair
// cleanly with form fields; the per-size text/icon/padding rhythm follows
// fluid-functionalism. Below the sm breakpoint each size is one step taller
// for comfortable touch targets.
const buttonSizeVariantClasses = {
  default: "h-10 sm:h-9 px-3.5 gap-1.5 text-sm",
  xs: "h-8 sm:h-7 px-2.5 gap-1 text-xs rounded-md [&_svg:not([class*='size-'])]:size-3.5",
  sm: "h-9 sm:h-8 px-3 gap-1.5 text-[13px] ",
  lg: "h-11 sm:h-10 px-3.5 gap-1.5 text-base [&_svg:not([class*='size-'])]:size-5",
  icon: "size-10 sm:size-9 text-sm",
  icon_xs:
    "size-8 sm:size-7 rounded-md text-xs [&_svg:not([class*='size-'])]:size-3.5",
  icon_sm: "size-9 sm:size-8 text-[13px]",
  icon_lg: "size-11 sm:size-10 text-base [&_svg:not([class*='size-'])]:size-5",
};

// Flat, single-element recipe for styling plain elements as buttons (links,
// toast actions, calendar nav, ...). These get the whole-element press scale;
// only <Button> itself gets the layered static-label treatment.
const buttonVariants = cva(
  cn(buttonBase, "active:shadow-none active:not-aria-[haspopup]:scale-[0.98]"),
  {
    variants: {
      variant: Object.fromEntries(
        (Object.keys(buttonRootVariantClasses) as ButtonVariant[]).map(
          (variant) => [
            variant,
            cn(
              buttonRootVariantClasses[variant],
              buttonBackgroundVariantClasses[variant],
            ),
          ],
        ),
      ) as Record<ButtonVariant, string>,
      size: buttonSizeVariantClasses,
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

// Root recipe used by <Button> — no backgrounds (those live on the layer) and
// no root scale. iconLeft/iconRight tighten the padding on whichever side has
// an icon: the icon is visually lighter than a text edge, so it sits closer.
const buttonRootVariants = cva(buttonBase, {
  variants: {
    variant: buttonRootVariantClasses,
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

export type ButtonProps = BaseButton.Props &
  VariantProps<typeof buttonVariants> & {
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
  leadingIcon,
  trailingIcon,
  ...props
}: ButtonProps) {
  const isIconOnly = typeof size === "string" && size.startsWith("icon");

  const content = (
    <>
      {leadingIcon}
      {isIconOnly ? (
        children
      ) : (
        // text-box trims the font's ascent/descent whitespace so the label is
        // optically centered; browsers without support fall back to metrics
        // centering.
        <span className="[text-box:trim-both_cap_alphabetic]">{children}</span>
      )}
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
          iconLeft: !isIconOnly && !!leadingIcon,
          iconRight: !isIconOnly && !!trailingIcon,
        }),
        className,
      )}
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      {...props}
    >
      <span
        aria-hidden
        data-slot="button-background"
        className={cn(
          // Press scale skips popup triggers (aria-haspopup, applied to the
          // DOM by Base UI): a trigger is a toggle that holds state, not a
          // momentary action — it gets the held data-popup-open background
          // instead.
          "absolute inset-0 rounded-[inherit] transition-[background-color,scale] duration-100 ease-out group-[:active:not([aria-haspopup])]/button:scale-[0.98]",
          buttonBackgroundVariantClasses[
            (variant ?? "primary") as ButtonVariant
          ],
        )}
      />
      {/* w-full + [justify-content:inherit] keep root-level justify overrides
          (e.g. className="justify-between" on a full-width trigger) working:
          the span fills the root and mirrors its justification. */}
      <span
        data-slot="button-content"
        className="relative inline-flex w-full items-center [justify-content:inherit] gap-[inherit]"
      >
        {loading ? (
          <>
            {/* The real content stays laid out (invisible) so the button
                keeps its size while loading. */}
            <span className="inline-flex w-full items-center [justify-content:inherit] gap-[inherit] opacity-0">
              {content}
            </span>
            <span className="absolute inset-0 flex items-center justify-center">
              <HugeiconsIcon
                icon={Loading03Icon}
                className="animate-spin"
                strokeWidth={2}
              />
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
