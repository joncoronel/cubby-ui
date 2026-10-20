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
  "relative flex w-fit items-stretch [&>*:focus-visible]:relative [&>*:focus-visible]:z-10 [&>*[data-popup-open]]:relative [&>*[data-popup-open]]:z-10",
  {
    variants: {
      variant: {
        attached:
          "[&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[>[data-slot=button-group]]:gap-2",
        // Outline draws its line just outside the fill, as on an outline
        // Button. The others have no border, so elevated's rim and shadow
        // ring meet its edge.
        outline:
          "bg-(--outline) text-foreground outline outline-(--outline-border)",
        soft: "bg-secondary text-secondary-foreground",
        elevated: cn(solidSurface(3, 3), "text-foreground"),
        // The fill inverts the page, so the overlays flip (white in light,
        // black in dark) and run stronger to show.
        solid:
          "bg-neutral text-neutral-foreground [--group-highlight-fill:oklch(1_0_0/16%)] [--group-press-fill:oklch(1_0_0/22%)] dark:[--group-highlight-fill:oklch(0_0_0/16%)] dark:[--group-press-fill:oklch(0_0_0/22%)]",
      },
      // Button's height ladder (one step taller below sm); corners step with it.
      size: {
        sm: "[--group-h:--spacing(9)] sm:not-pointer-coarse:[--group-h:--spacing(8)] [--group-radius:calc(var(--radius)-2px)]",
        default:
          "[--group-h:--spacing(10)] sm:not-pointer-coarse:[--group-h:--spacing(9)] [--group-radius:var(--radius)]",
        lg: "[--group-h:--spacing(11)] sm:not-pointer-coarse:[--group-h:--spacing(10)] [--group-radius:calc(var(--radius)+2px)]",
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
      variant: "soft",
      size: "default",
      orientation: "horizontal",
    },
  },
);

const trayClasses = cn(
  // Insets are item borders (button-group.css). Plate corners are the
  // shell's minus the 2px edge border. Select triggers skip the before:
  // rule, or its empty pseudo-element becomes a flex item.
  "rounded-(--group-radius) [--group-item-radius:max(0px,calc(var(--group-radius)-2px))]",
  "[&>:is(button,a):not([data-slot=select-trigger])]:before:rounded-(--group-item-radius)",
  // Highlight and press: 8% / 10% black overlays (white in dark). Button's 6%
  // reads too faint here, and a label tint shows a cool cast. Solid sets its own.
  "[--group-highlight:var(--group-highlight-fill,var(--surface-active))] [--group-press:var(--group-press-fill,var(--surface-selected))]",
  // Sizing: a row is the ladder height, a column at least the ladder width.
  // Items size themselves in button-group.css.
  "data-[orientation=horizontal]:h-(--group-h) data-[orientation=vertical]:w-fit",
  // Quiet children. A Button without a variant renders `primary`, so this
  // list (with text-current below) must undo everything `primary` sets: fill,
  // hover, press, border, and label color. A style added to `primary` needs
  // overriding here too.
  "[&>:is(button,a):not([data-variant])]:[--btn-bg:transparent] [&>:is(button,a):not([data-variant])]:[--btn-border:transparent] [&>:is(button,a):not([data-variant])]:[--btn-bg-hover:var(--group-highlight)] [&>:is(button,a):not([data-variant])]:[--btn-bg-active:var(--group-press)]",
  // Label color
  "[&>:is(button,a):not([data-variant])]:text-current",
  // Instant hover, so a sweep never shows two buttons half-lit.
  "[&>:is(button,a):not([data-variant])]:before:[transition-duration:0ms,100ms,100ms] [&>:is(button,a):not([data-variant])]:active:before:[transition-duration:100ms]",
  // Never narrower than its items; overflow is the container's to handle.
  "min-w-max",
  // Groups of groups are a layout wrapper with no shell
  "has-[>[data-slot=button-group]]:gap-2 has-[>[data-slot=button-group]]:bg-transparent has-[>[data-slot=button-group]]:p-0 has-[>[data-slot=button-group]]:border-0 has-[>[data-slot=button-group]]:outline-0 has-[>[data-slot=button-group]]:shadow-none has-[>[data-slot=button-group]]:h-auto has-[>[data-slot=button-group]]:w-fit",
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
  variant: "soft",
  size: "default",
  orientation: "horizontal",
};

export type ButtonGroupProps = React.ComponentProps<"div"> & {
  /** Defaults to the parent group's variant, or `"soft"`. */
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
        {glides && (
          <span
            aria-hidden
            data-slot="button-group-highlight"
            data-button-group-highlight
          />
        )}
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
        ? "bg-muted rounded-lg border border-transparent px-4"
        : // Inset like the buttons (button-group.css), so text lines up
          // with their labels.
          "px-3",
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
              // Air and line are all borders, so both sides snap alike.
              "pointer-events-none",
              "flex shrink-0 self-stretch border-transparent bg-transparent data-[orientation=horizontal]:h-auto data-[orientation=horizontal]:w-auto data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-auto",
              "before:border-transparent before:content-[''] after:border-transparent after:content-['']",
              "data-[orientation=vertical]:after:border-s-border data-[orientation=vertical]:border-e-[3px] data-[orientation=vertical]:before:border-s-[3px] data-[orientation=vertical]:after:h-5 data-[orientation=vertical]:after:self-center data-[orientation=vertical]:after:rounded-full data-[orientation=vertical]:after:border-s-[1.5px]",
              "data-[orientation=horizontal]:after:border-t-border data-[orientation=horizontal]:border-b-[3px] data-[orientation=horizontal]:before:border-t-[3px] data-[orientation=horizontal]:after:w-5 data-[orientation=horizontal]:after:self-center data-[orientation=horizontal]:after:rounded-full data-[orientation=horizontal]:after:border-t-[1.5px]",
              group.variant === "solid" &&
                "data-[orientation=vertical]:after:border-s-neutral-foreground/15 data-[orientation=horizontal]:after:border-t-neutral-foreground/15",
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
