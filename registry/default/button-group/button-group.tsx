"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { Separator } from "@/registry/default/separator/separator";
import { solidSurface } from "@/registry/default/lib/elevated";
import "./button-group.css";

// Two families share one component:
//
// - attached: the children own the paint (outline buttons, inputs, select
//   triggers) and the group fuses them, collapsing inner borders and radii.
// - trays (outline, soft, elevated, solid): the group owns the paint. It draws
//   the shell, quiets the buttons inside it to bare labels, and a single
//   highlight pill glides between them on hover and keyboard focus.
//
// Tray children are restyled through the Button recipe's paint tokens, so
// only buttons WITHOUT an explicit `variant` (no data-variant) go quiet. Give
// one a variant and it keeps its own paint, which is how a group marks its
// primary action. Tag selectors (button, a) rather than data-slot, because a
// Base UI trigger rendering a Button stamps its own data-slot.
const buttonGroupVariants = cva(
  "relative flex w-fit items-stretch [--group-border:0px] [&>*:focus-visible]:relative [&>*:focus-visible]:z-10 [&>*[data-popup-open]]:relative [&>*[data-popup-open]]:z-10",
  {
    variants: {
      variant: {
        attached:
          "[&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg has-[>[data-slot=button-group]]:gap-2 [&>input]:bg-card",
        // Each shell takes a Button variant's fill and label color. Outline's
        // 1px border sits outside the fill (bg-clip-padding) as on an
        // outline Button, and outside the 4px inset. The others have no
        // border, so nothing comes between the edge and the surface's own
        // shadow ring.
        outline:
          "border-border bg-card text-foreground border bg-clip-padding [--group-border:1px]",
        soft: "bg-secondary text-secondary-foreground",
        elevated: cn(solidSurface(3, 3), "text-foreground"),
        // The one shell opposite the page in brightness. Eyes adapt to the
        // page, so the same tint reads weaker inside it; it takes more.
        solid:
          "bg-neutral text-neutral-foreground [--group-highlight-mix:16%] [--group-press-mix:22%]",
      },
      // Outer height, matching Button's ladder (one step taller below sm),
      // and the shell's corners, which step down with the size so a small
      // group isn't rounder than a small Button.
      size: {
        sm: "[--group-h:--spacing(9)] sm:[--group-h:--spacing(8)] [--group-radius:calc(var(--radius)-2px)]",
        default:
          "[--group-h:--spacing(10)] sm:[--group-h:--spacing(9)] [--group-radius:var(--radius)]",
        lg: "[--group-h:--spacing(11)] sm:[--group-h:--spacing(10)] [--group-radius:calc(var(--radius)+2px)]",
      },
      orientation: {
        horizontal: "",
        vertical: "flex-col",
      },
    },
    compoundVariants: [
      // Border rules come in pairs: a root rule for children with real
      // borders (inputs, select triggers) and a `before:` twin for
      // button-recipe children, whose border lives on their paint
      // pseudo-element. The before: twins are scoped to button/a tags and
      // exclude select triggers, since Tailwind's before: variant generates a
      // pseudo box on any matched element, which would otherwise add a
      // phantom flex item (and gap) inside non-recipe children. Radius rules
      // only need the root; the pseudo uses rounded-[inherit].
      {
        variant: "attached",
        orientation: "horizontal",
        className:
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>button:not(:first-child):not([data-slot=select-trigger])]:before:border-l-0 [&>a:not(:first-child)]:before:border-l-0 [&>*:not(:last-child)]:rounded-r-none [&>*:has(+[data-slot=button-group-separator])]:border-r-0 [&>button:has(+[data-slot=button-group-separator]):not([data-slot=select-trigger])]:before:border-r-0 [&>a:has(+[data-slot=button-group-separator])]:before:border-r-0 [&>button:first-of-type:not(:only-of-type)]:rounded-l-lg [&>button:first-of-type:not(:only-of-type):not([data-slot=select-trigger])]:before:border-l [&>[data-slot=select-trigger]:first-of-type:not(:only-of-type)]:border-l [&>a:first-of-type:not(:only-of-type)]:rounded-l-lg [&>a:first-of-type:not(:only-of-type)]:before:border-l [&>button:last-of-type:not(:only-of-type)]:rounded-r-lg [&>a:last-of-type:not(:only-of-type)]:rounded-r-lg",
      },
      {
        variant: "attached",
        orientation: "vertical",
        className:
          "[&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>button:not(:first-child):not([data-slot=select-trigger])]:before:border-t-0 [&>a:not(:first-child)]:before:border-t-0 [&>*:not(:last-child)]:rounded-b-none [&>*:has(+[data-slot=button-group-separator])]:border-b-0 [&>button:has(+[data-slot=button-group-separator]):not([data-slot=select-trigger])]:before:border-b-0 [&>a:has(+[data-slot=button-group-separator])]:before:border-b-0 [&>button:first-of-type:not(:only-of-type)]:rounded-t-lg [&>button:first-of-type:not(:only-of-type):not([data-slot=select-trigger])]:before:border-t [&>[data-slot=select-trigger]:first-of-type:not(:only-of-type)]:border-t [&>a:first-of-type:not(:only-of-type)]:rounded-t-lg [&>a:first-of-type:not(:only-of-type)]:before:border-t [&>button:last-of-type:not(:only-of-type)]:rounded-b-lg [&>a:last-of-type:not(:only-of-type)]:rounded-b-lg",
      },
    ],
    defaultVariants: {
      variant: "outline",
      size: "default",
      orientation: "horizontal",
    },
  },
);

// Shared by every tray variant.
const trayClasses = cn(
  // Shell: no padding. Each button fills it edge to edge and carries a 2px
  // transparent border instead, with its paint (and the pill) inside. A
  // border, unlike padding, always rounds to whole device pixels and the
  // same on every side, so the inset stays even at fractional display
  // scales (2px of padding is 3.5 device pixels at 175% and rounds 3 above,
  // 4 below). Buttons also cover the shell's edges, so there's no dead zone.
  // The shell's corners come from the size; the paint's are those minus the
  // shell border and the 2px, so they stay concentric and the whole group
  // follows --radius. Set [--radius:9999px] for a pill.
  "rounded-(--group-radius) [--group-item-radius:max(0px,calc(var(--group-radius)-var(--group-border,0px)-2px))]",
  "[&>:is(button,a)]:border-2 [&>:is(button,a)]:border-transparent",
  // The box's corners are the paint's + its 2px border, and the paint sets
  // its own (instead of inheriting the box's), so paint, gap, and focus ring
  // are concentric. The ring sits on the box's edge at offset 0: 2px off the
  // paint, as on a standalone Button, and over the shell's edge if need be.
  // Select triggers are skipped for the before: rule: they don't use the
  // Button recipe, and before: would give them an empty pseudo-element that
  // becomes a flex item (plus a gap) beside their value.
  "[&>:is(button,a)]:rounded-[calc(var(--group-item-radius)+2px)] [&>:is(button,a):not([data-slot=select-trigger])]:before:rounded-(--group-item-radius) [&>:is(button,a)]:focus-visible:outline-offset-0",
  // The pill (and, without the glide, each button's hover) is the label color
  // at 10%. Button's hover tokens are tuned to repaint a whole button and
  // read too faint as a pill on the same fill, most of all on dark fills. A
  // tint of the label always moves away from the fill, on every shell and in
  // both modes, since the label has to contrast with it. currentColor
  // resolves where the variable is used: the pill and buttons inherit the
  // shell's label color. --group-highlight-mix sets the strength. A press
  // deepens it, as Button's active paint does (about 1.4x its hover), set
  // by --group-press-mix.
  "[--group-highlight:color-mix(in_oklab,currentColor_var(--group-highlight-mix,10%),transparent)] [--group-press:color-mix(in_oklab,currentColor_var(--group-press-mix,14%),transparent)]",
  // The shell is the fixed size and the buttons stretch to fill it, rather
  // than each computing its own, which the shell's own border (rounded at
  // fractional scales) would throw off. Icon sizes stay square. The
  // Button's own size still sets type and icon size.
  "data-[orientation=horizontal]:h-(--group-h) data-[orientation=horizontal]:[&>:is(button,a)]:h-auto data-[orientation=horizontal]:[&>:is(button,a)]:self-stretch",
  "data-[orientation=vertical]:w-(--group-h) data-[orientation=vertical]:[&>:is(button,a)]:w-auto data-[orientation=vertical]:[&>:is(button,a)]:self-stretch data-[orientation=vertical]:[&>:is(button,a):not([data-size^=icon])]:h-[calc(var(--group-h)-var(--group-border,0px)*2)]",
  "[&>:is(button,a)[data-size^=icon]]:aspect-square data-[orientation=horizontal]:[&>:is(button,a)[data-size^=icon]]:w-auto data-[orientation=vertical]:[&>:is(button,a)[data-size^=icon]]:h-auto",
  // Quiet children: no fill or border, the shell's highlight color on hover,
  // and the shell's radius. Where the pill glides, button-group.css turns
  // their own hover paint off. A Button without a variant renders `primary`,
  // so this list (with text-current below) must undo everything `primary`
  // sets: fill, hover, press, border, and label color. Adding a style to
  // `primary` means overriding it here too.
  "[&>:is(button,a):not([data-variant])]:[--btn-bg:transparent] [&>:is(button,a):not([data-variant])]:[--btn-border:transparent] [&>:is(button,a):not([data-variant])]:[--btn-bg-hover:var(--group-highlight)] [&>:is(button,a):not([data-variant])]:[--btn-bg-active:var(--group-press)]",
  // Label color: foreground on light shells, inherited on solid.
  "[&>:is(button,a):not([data-variant])]:text-current",
  // Groups of groups are a layout wrapper: no shell of their own.
  "has-[>[data-slot=button-group]]:gap-2 has-[>[data-slot=button-group]]:bg-transparent has-[>[data-slot=button-group]]:p-0 has-[>[data-slot=button-group]]:border-0 has-[>[data-slot=button-group]]:shadow-none has-[>[data-slot=button-group]]:h-auto has-[>[data-slot=button-group]]:w-fit",
);

type ButtonGroupVariant = NonNullable<
  VariantProps<typeof buttonGroupVariants>["variant"]
>;
type ButtonGroupOrientation = NonNullable<
  VariantProps<typeof buttonGroupVariants>["orientation"]
>;
type ButtonGroupSize = NonNullable<
  VariantProps<typeof buttonGroupVariants>["size"]
>;

type ButtonGroupContextValue = {
  variant: ButtonGroupVariant;
  size: ButtonGroupSize;
  orientation: ButtonGroupOrientation;
};

// Null outside a group, so a nested group can tell it has a parent to
// inherit variant and size from.
const ButtonGroupContext = React.createContext<ButtonGroupContextValue | null>(
  null,
);

const DEFAULT_CONTEXT: ButtonGroupContextValue = {
  variant: "outline",
  size: "default",
  orientation: "horizontal",
};

export type ButtonGroupProps = React.ComponentProps<"div"> & {
  /** Defaults to the parent group's variant, or `"outline"`. */
  variant?: ButtonGroupVariant;
  /** Outer height, on Button's ladder. Defaults to the parent group's size, or `"default"`. */
  size?: ButtonGroupSize;
  orientation?: ButtonGroupOrientation;
  /** Glide a shared highlight between buttons on hover and focus. Tray variants only. */
  highlight?: boolean;
};

function ButtonGroup({
  className,
  variant: variantProp,
  size: sizeProp,
  orientation = "horizontal",
  highlight = true,
  children,
  ...props
}: ButtonGroupProps) {
  const parent = React.useContext(ButtonGroupContext);
  const variant = variantProp ?? parent?.variant ?? DEFAULT_CONTEXT.variant;
  const size = sizeProp ?? parent?.size ?? DEFAULT_CONTEXT.size;
  const isTray = variant !== "attached";
  const glides = isTray && highlight;

  const context = React.useMemo(
    () => ({ variant, size, orientation }),
    [variant, size, orientation],
  );

  return (
    <ButtonGroupContext.Provider value={context}>
      <div
        role="group"
        data-slot="button-group"
        data-variant={variant}
        data-size={size}
        data-orientation={orientation}
        data-glide={glides ? "" : undefined}
        className={cn(
          buttonGroupVariants({ variant, size, orientation }),
          isTray && trayClasses,
          // Contains the pill's z-index -1 so it sits above the shell fill.
          glides && "isolate",
          className,
        )}
        {...props}
      >
        {children}
        {/* Placed and animated by button-group.css. Last, so consumers'
            first-child selectors still match the first button. */}
        {glides && <span aria-hidden data-slot="button-group-highlight" />}
      </div>
    </ButtonGroupContext.Provider>
  );
}

export type ButtonGroupTextProps = useRender.ComponentProps<"div">;

function ButtonGroupText({
  className,
  render,
  ...props
}: ButtonGroupTextProps) {
  const { variant } = React.useContext(ButtonGroupContext) ?? DEFAULT_CONTEXT;

  const defaultProps = {
    "data-slot": "button-group-text",
    className: cn(
      "flex items-center gap-2 text-sm font-medium whitespace-nowrap tabular-nums [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
      variant === "attached"
        ? "bg-muted rounded-lg border bg-clip-padding px-4"
        : // The buttons' 2px transparent border, so the text clears the shell's
          // edge and lines up with the labels beside it.
          "border-2 border-transparent px-3",
      className,
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ButtonGroupSeparatorProps = React.ComponentProps<typeof Separator>;

function ButtonGroupSeparator({
  className,
  orientation,
  ...props
}: ButtonGroupSeparatorProps) {
  const group = React.useContext(ButtonGroupContext) ?? DEFAULT_CONTEXT;
  // Perpendicular to the group unless set.
  const resolved =
    orientation ??
    (group.orientation === "vertical" ? "horizontal" : "vertical");

  return (
    <Separator
      data-slot="button-group-separator"
      orientation={resolved}
      className={cn(
        "relative !m-0 self-stretch data-[orientation=vertical]:h-auto",
        group.variant === "attached"
          ? "dark:bg-input"
          : cn(
              // Inset hairline. button-group.css fades it beside the pill.
              "transition-opacity duration-[80ms] ease-out data-[orientation=horizontal]:!mx-1.5 data-[orientation=horizontal]:!my-0.5 data-[orientation=vertical]:!mx-0.5 data-[orientation=vertical]:!my-1.5",
              group.variant === "solid" && "bg-neutral-foreground/15",
            ),
        className,
      )}
      {...props}
    />
  );
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
