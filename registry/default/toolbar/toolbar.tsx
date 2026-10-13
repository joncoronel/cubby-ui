"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/registry/default/button/button";
import { Toggle, type ToggleProps } from "@/registry/default/toggle/toggle";
import { solidSurface } from "@/registry/default/lib/elevated";
import "./toolbar.css";

// A shell, as in Button Group, with Base UI's roving focus. The inset is two
// 1px transparent borders: one on the shell, one on each item. Plate to edge
// is shell + item, plate to plate is item + item, and since both are the same
// border, they snap to device pixels alike and stay even at every display
// scale. Outline draws its line as an outline just outside the shell, the way
// elevated's shadow ring sits outside. A highlight glides to the
// hovered or focused item's plate (toolbar.css).
const toolbarVariants = cva(
  [
    "relative isolate flex w-fit items-stretch rounded-(--toolbar-radius) data-[orientation=vertical]:flex-col",
    "[--toolbar-item-radius:max(0px,calc(var(--toolbar-radius)-var(--toolbar-border)-1px))]",
    // Label-color tints: hover 10%, press 14%, pressed toggle 16%
    "[--toolbar-highlight:color-mix(in_oklab,currentColor_var(--toolbar-highlight-mix,10%),transparent)] [--toolbar-press:color-mix(in_oklab,currentColor_var(--toolbar-press-mix,14%),transparent)] [--toolbar-pressed:color-mix(in_oklab,currentColor_16%,transparent)]",
    // The shell is fixed and items stretch to fill it; columns grow to the
    // widest item.
    "data-[orientation=horizontal]:h-(--toolbar-h) data-[orientation=vertical]:min-w-(--toolbar-h)",
    "data-disabled:opacity-60 data-disabled:**:data-toolbar-item:opacity-100",
  ],
  {
    variants: {
      variant: {
        // The surface's inner rim is the 1px border, so it meets the shadow
        // ring as on other raised surfaces.
        elevated: cn(
          solidSurface(3, 3),
          "text-foreground shadow-(--surface-shadow-3) border border-(--surface-rim-color) [--toolbar-border:1px]",
        ),
        outline:
          "bg-card text-foreground border border-transparent outline outline-border [--toolbar-border:1px]",
        soft: "bg-secondary text-secondary-foreground border border-transparent [--toolbar-border:1px]",
        ghost:
          "text-foreground border border-transparent [--toolbar-border:1px]",
      },
      // Button's height ladder (one step taller below sm); corners step with it.
      size: {
        sm: "[--toolbar-h:--spacing(9)] sm:[--toolbar-h:--spacing(8)] [--toolbar-radius:calc(var(--radius)-2px)]",
        default:
          "[--toolbar-h:--spacing(10)] sm:[--toolbar-h:--spacing(9)] [--toolbar-radius:var(--radius)]",
        lg: "[--toolbar-h:--spacing(11)] sm:[--toolbar-h:--spacing(10)] [--toolbar-radius:calc(var(--radius)+2px)]",
      },
    },
    defaultVariants: {
      variant: "elevated",
      size: "default",
    },
  },
);

// Shared by every item: the 1px inset, concentric corners, and stretch.
const itemShell = cn(
  "shrink-0 border border-transparent",
  "rounded-[calc(var(--toolbar-item-radius)+1px)] before:rounded-(--toolbar-item-radius) focus-visible:outline-offset-0 focus-visible:z-10",
  "h-auto self-stretch sm:h-auto",
  // In a column every item keeps the ladder height.
  "in-data-[orientation=vertical]:h-[calc(var(--toolbar-h)-var(--toolbar-border)*2)] in-data-[orientation=vertical]:sm:h-[calc(var(--toolbar-h)-var(--toolbar-border)*2)]",
);

// Icon-only items are square: as wide as the row is tall, or in a column,
// as wide as the column.
const iconSquare = {
  horizontal: "aspect-square w-auto px-0 sm:w-auto",
  vertical: "w-full px-0",
};

type ToolbarVariant = NonNullable<
  VariantProps<typeof toolbarVariants>["variant"]
>;
type ToolbarSize = NonNullable<VariantProps<typeof toolbarVariants>["size"]>;

const ToolbarContext = React.createContext<{
  orientation: "horizontal" | "vertical";
}>({ orientation: "horizontal" });

// A labelled item whose only child is an icon component or <svg>. CSS can't
// tell: :only-child ignores text nodes.
function isIconOnly(
  children: React.ReactNode,
  label: string | undefined,
): boolean {
  return (
    React.isValidElement(children) &&
    children.type !== React.Fragment &&
    (typeof children.type !== "string" || children.type === "svg") &&
    Boolean(label)
  );
}

export type ToolbarProps = BaseToolbar.Root.Props & {
  /** Shell style. */
  variant?: ToolbarVariant;
  /** Outer height, on Button's ladder. */
  size?: ToolbarSize;
  /** Glide a shared highlight between items on hover and focus. */
  highlight?: boolean;
};

function Toolbar({
  className,
  variant,
  size,
  orientation = "horizontal",
  highlight = true,
  children,
  ...props
}: ToolbarProps) {
  const context = React.useMemo(() => ({ orientation }), [orientation]);

  return (
    <ToolbarContext.Provider value={context}>
      <BaseToolbar.Root
        data-slot="toolbar"
        data-variant={variant ?? "elevated"}
        data-size={size ?? "default"}
        data-glide={highlight ? "" : undefined}
        orientation={orientation}
        className={cn(toolbarVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {/* Last, so first-child selectors still match the first item. */}
        {highlight && <span aria-hidden data-slot="toolbar-highlight" />}
      </BaseToolbar.Root>
    </ToolbarContext.Provider>
  );
}

export type ToolbarButtonProps = BaseToolbar.Button.Props & ButtonProps;

/**
 * A quiet Button. Give it a `variant` to mark the main action; it keeps its
 * own fill.
 */
function ToolbarButton({
  className,
  variant,
  size = "icon",
  render,
  ...props
}: ToolbarButtonProps) {
  const { orientation } = React.use(ToolbarContext);
  const iconOnly = size?.startsWith("icon");

  return (
    <BaseToolbar.Button
      data-slot="toolbar-button"
      data-toolbar-item=""
      render={
        <Button
          variant={variant}
          size={size}
          render={render}
          className={cn(
            itemShell,
            iconOnly && iconSquare[orientation],
            // Quiet: undo primary's fill and border, hover and press with the
            // label tints. A set variant keeps its own paint.
            !variant &&
              "text-current [--btn-bg-active:var(--toolbar-press)] [--btn-bg-hover:var(--toolbar-highlight)] [--btn-bg:transparent] [--btn-border:transparent]",
            className,
          )}
        />
      }
      {...props}
    />
  );
}

export type ToolbarToggleProps = BaseToolbar.Button.Props &
  Omit<ToggleProps, "variant" | "size">;

/** A Toggle that stays pressed when on, with Toggle Group's deeper tint. */
function ToolbarToggle({ className, children, ...props }: ToolbarToggleProps) {
  const { orientation } = React.use(ToolbarContext);
  const iconOnly = isIconOnly(
    children,
    props["aria-label"] ?? props["aria-labelledby"],
  );

  return (
    <BaseToolbar.Button
      data-slot="toolbar-toggle"
      data-toolbar-item=""
      render={
        <Toggle
          variant="ghost"
          className={cn(
            itemShell,
            "min-w-auto px-2.5 text-sm sm:min-w-auto",
            iconOnly && iconSquare[orientation],
            "text-current",
            "[--tgl-bg-active:var(--toolbar-press)] [--tgl-bg-hover:var(--toolbar-highlight)] [--tgl-bg-selected:var(--toolbar-pressed)]",
            "forced-colors:data-pressed:border-[Highlight]",
            className,
          )}
        />
      }
      {...props}
    >
      {children}
    </BaseToolbar.Button>
  );
}

export type ToolbarToggleGroupProps = BaseToggleGroup.Props;

/**
 * Toggles that share a value, like text alignment. Lays its items into the
 * toolbar's row; the toolbar keeps arrow-key focus.
 */
function ToolbarToggleGroup({ className, ...props }: ToolbarToggleGroupProps) {
  const { orientation } = React.use(ToolbarContext);
  return (
    <BaseToggleGroup
      data-slot="toolbar-toggle-group"
      orientation={orientation}
      className={cn("contents", className)}
      {...props}
    />
  );
}

export type ToolbarGroupProps = BaseToolbar.Group.Props;

/** Groups items, for example to disable them together. Adds no layout. */
function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return (
    <BaseToolbar.Group
      data-slot="toolbar-group"
      className={cn("contents", className)}
      {...props}
    />
  );
}

export type ToolbarSeparatorProps = BaseToolbar.Separator.Props;

function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  return (
    <BaseToolbar.Separator
      data-slot="toolbar-separator"
      className={cn(
        "bg-border shrink-0 self-stretch",
        // Base UI orients the separator across the toolbar.
        "data-[orientation=vertical]:mx-1.5 data-[orientation=vertical]:my-2 data-[orientation=vertical]:w-px",
        "data-[orientation=horizontal]:mx-2 data-[orientation=horizontal]:my-1.5 data-[orientation=horizontal]:h-px",
        className,
      )}
      {...props}
    />
  );
}

export type ToolbarInputProps = BaseToolbar.Input.Props;

/** A quiet field, inset like the buttons. It lights in place on hover and focus. */
function ToolbarInput({ className, ...props }: ToolbarInputProps) {
  return (
    <BaseToolbar.Input
      data-slot="toolbar-input"
      className={cn(
        itemShell,
        "placeholder:text-muted-foreground min-w-0 bg-transparent bg-clip-padding px-2.5 text-sm text-current",
        "outline-0 outline-transparent transition-[background-color,outline-width,outline-color] duration-100 ease-out outline-solid",
        "focus-visible:outline-ring/50 hover:bg-(--toolbar-highlight) focus:bg-(--toolbar-highlight) focus-visible:outline-2",
        "data-disabled:cursor-not-allowed data-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export type ToolbarLinkProps = BaseToolbar.Link.Props;

/** A quiet link, styled like the buttons. */
function ToolbarLink({ className, ...props }: ToolbarLinkProps) {
  return (
    <BaseToolbar.Link
      data-slot="toolbar-link"
      data-toolbar-item=""
      className={cn(
        "relative isolate inline-flex items-center gap-1.5 px-2.5 text-sm font-medium whitespace-nowrap no-underline",
        itemShell,
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:transition-[background-color,scale] before:duration-100 before:ease-out before:content-['']",
        "hover:before:bg-(--toolbar-highlight) active:before:scale-[0.98] active:before:bg-(--toolbar-press) motion-reduce:active:before:scale-100",
        "focus-visible:outline-ring/50 outline-0 outline-transparent outline-solid focus-visible:outline-2",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  Toolbar,
  ToolbarButton,
  ToolbarToggle,
  ToolbarToggleGroup,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarInput,
  ToolbarLink,
  toolbarVariants,
};
