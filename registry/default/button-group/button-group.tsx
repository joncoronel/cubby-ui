"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { Separator } from "@/registry/default/separator/separator";
import { solidSurface } from "@/registry/default/lib/elevated";
import "./button-group.css";

// attached: children keep their own paint and the group fuses them.
// Trays (outline, soft, elevated, solid): the group draws the shell, quiets
// buttons without a `variant`, and a pill glides between them
// (button-group.css). Selectors match tags, not data-slot, because a Base UI
// trigger rendering a Button stamps its own data-slot.
const buttonGroupVariants = cva(
  "relative flex w-fit items-stretch [--group-border:0px] [&>*:focus-visible]:relative [&>*:focus-visible]:z-10 [&>*[data-popup-open]]:relative [&>*[data-popup-open]]:z-10",
  {
    variants: {
      variant: {
        attached:
          "[&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg has-[>[data-slot=button-group]]:gap-2 [&>input]:bg-card",
        // Outline's border sits outside the fill, as on an outline Button. The
        // others have no border, so elevated's shadow ring meets its edge.
        outline:
          "border-border bg-card text-foreground border bg-clip-padding [--group-border:1px]",
        soft: "bg-secondary text-secondary-foreground",
        elevated: cn(solidSurface(3, 3), "text-foreground"),
        // Opposite the page in brightness, so the tint needs more strength.
        solid:
          "bg-neutral text-neutral-foreground [--group-highlight-mix:16%] [--group-press-mix:22%]",
      },
      // Button's height ladder (one step taller below sm); corners step with it.
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
      // Border rules come in pairs: one for children with real borders
      // (inputs, select triggers), and a before: twin for Button-recipe
      // children, whose border is on their paint pseudo-element. The twins
      // skip select triggers: before: would add an empty pseudo-element there
      // that becomes a flex item.
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

const trayClasses = cn(
  // Inset: a 2px transparent border on each button, not shell padding.
  // Borders round to whole device pixels on every side, so the gaps stay
  // even at fractional display scales (2px of padding is 3.5 device pixels
  // at 175%). Paint corners are the shell's minus its border and the 2px.
  "rounded-(--group-radius) [--group-item-radius:max(0px,calc(var(--group-radius)-var(--group-border,0px)-2px))]",
  "[&>:is(button,a)]:border-2 [&>:is(button,a)]:border-transparent",
  // Box corners are the paint's + 2px, so paint, gap, and focus ring (at
  // offset 0) are concentric. Select triggers skip the before: rule: it would
  // give them an empty pseudo-element that becomes a flex item.
  "[&>:is(button,a)]:rounded-[calc(var(--group-item-radius)+2px)] [&>:is(button,a):not([data-slot=select-trigger])]:before:rounded-(--group-item-radius) [&>:is(button,a)]:focus-visible:outline-offset-0",
  // Highlight and press: the label color at 10% / 14%. Button's hover tokens
  // read too faint as a pill on the same fill; a tint of the label always
  // contrasts with it. currentColor resolves where the variable is used.
  "[--group-highlight:color-mix(in_oklab,currentColor_var(--group-highlight-mix,10%),transparent)] [--group-press:color-mix(in_oklab,currentColor_var(--group-press-mix,14%),transparent)]",
  // Sizing: the shell is fixed and buttons stretch to fill it, so a border
  // rounded at fractional scales can't throw their size off. Icon buttons
  // stay square.
  "data-[orientation=horizontal]:h-(--group-h) data-[orientation=horizontal]:[&>:is(button,a)]:h-auto data-[orientation=horizontal]:[&>:is(button,a)]:self-stretch",
  "data-[orientation=vertical]:w-(--group-h) data-[orientation=vertical]:[&>:is(button,a)]:w-auto data-[orientation=vertical]:[&>:is(button,a)]:self-stretch data-[orientation=vertical]:[&>:is(button,a):not([data-size^=icon])]:h-[calc(var(--group-h)-var(--group-border,0px)*2)]",
  "[&>:is(button,a)[data-size^=icon]]:aspect-square data-[orientation=horizontal]:[&>:is(button,a)[data-size^=icon]]:w-auto data-[orientation=vertical]:[&>:is(button,a)[data-size^=icon]]:h-auto",
  // Quiet children. A Button without a variant renders `primary`, so this
  // list (with text-current below) must undo everything `primary` sets: fill,
  // hover, press, border, and label color. A style added to `primary` needs
  // overriding here too.
  "[&>:is(button,a):not([data-variant])]:[--btn-bg:transparent] [&>:is(button,a):not([data-variant])]:[--btn-border:transparent] [&>:is(button,a):not([data-variant])]:[--btn-bg-hover:var(--group-highlight)] [&>:is(button,a):not([data-variant])]:[--btn-bg-active:var(--group-press)]",
  // Label color
  "[&>:is(button,a):not([data-variant])]:text-current",
  // Groups of groups are a layout wrapper with no shell
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

// Null outside a group, so nested groups know to inherit variant and size.
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
          // Keeps the pill's z-index -1 above the shell fill.
          glides && "isolate",
          className,
        )}
        {...props}
      >
        {children}
        {/* Last, so first-child selectors still match the first button. */}
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
        : // The buttons' 2px border, so text lines up with their labels.
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
