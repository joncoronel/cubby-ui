"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/registry/default/button/button";
import {
  isIconOnly,
  Toggle,
  type ToggleProps,
} from "@/registry/default/toggle/toggle";
import { solidSurface } from "@/registry/default/lib/elevated";
import "./toolbar.css";

// A shell, as in Button Group, with Base UI's roving focus. Insets, hit
// areas, the gliding highlight and focus rings are in toolbar.css.
const toolbarVariants = cva(
  [
    "group/toolbar relative isolate flex w-fit items-stretch rounded-(--toolbar-radius) data-[orientation=vertical]:flex-col",
    // Paint corners are the shell's minus the 2px edge border.
    "[--toolbar-item-radius:max(0px,calc(var(--toolbar-radius)-2px))]",
    // Label-color tints: hover 10%, press 14%, pressed toggle 16%
    "[--toolbar-highlight:color-mix(in_oklab,currentColor_10%,transparent)] [--toolbar-press:color-mix(in_oklab,currentColor_14%,transparent)] [--toolbar-pressed:color-mix(in_oklab,currentColor_16%,transparent)]",
    // The shell is fixed and items stretch to fill it; columns grow to the
    // widest item.
    "data-[orientation=horizontal]:h-(--toolbar-h) data-[orientation=vertical]:min-w-(--toolbar-h)",
    // Parts dim with the shell, not twice.
    "data-disabled:opacity-60 data-disabled:**:data-toolbar-part:opacity-100",
  ],
  {
    variants: {
      variant: {
        elevated: cn(solidSurface(3, 3), "text-foreground"),
        outline: "bg-card text-foreground outline outline-border",
        soft: "bg-secondary text-secondary-foreground",
        ghost: "text-foreground",
      },
      // Button's height ladder (one step taller below sm); corners step with it.
      size: {
        sm: "[--toolbar-h:--spacing(9)] sm:[--toolbar-h:--spacing(8)] [--toolbar-radius:calc(var(--radius)-2px)]",
        default:
          "[--toolbar-h:--spacing(10)] sm:[--toolbar-h:--spacing(9)] [--toolbar-radius:var(--radius)]",
        lg: "[--toolbar-h:--spacing(11)] sm:[--toolbar-h:--spacing(10)] [--toolbar-radius:calc(var(--radius)+2px)]",
      },
    },
  },
);

// Shared by every item: concentric corners and stretch.
const itemShell = cn(
  "shrink-0",
  "rounded-[calc(var(--toolbar-item-radius)+2px)] before:rounded-(--toolbar-item-radius) focus-visible:z-10",
  "h-auto self-stretch sm:h-auto",
  // In a column every item gets the row's paint height.
  "group-data-[orientation=vertical]/toolbar:box-content group-data-[orientation=vertical]/toolbar:py-0 group-data-[orientation=vertical]/toolbar:h-[calc(var(--toolbar-h)-4px)] sm:group-data-[orientation=vertical]/toolbar:h-[calc(var(--toolbar-h)-4px)]",
);

// Icon-only items have a square paint (the content box, with no padding),
// whatever each side's border: as tall as the row, or as wide as the column.
const iconSquare =
  "box-content aspect-square w-auto px-0 sm:w-auto group-data-[orientation=vertical]/toolbar:h-auto sm:group-data-[orientation=vertical]/toolbar:h-auto";

type ToolbarVariant = NonNullable<
  VariantProps<typeof toolbarVariants>["variant"]
>;
type ToolbarSize = NonNullable<VariantProps<typeof toolbarVariants>["size"]>;

const ToolbarContext = React.createContext<{
  orientation: "horizontal" | "vertical";
}>({ orientation: "horizontal" });

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
  variant = "elevated",
  size = "default",
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
        data-variant={variant}
        data-size={size}
        data-glide={highlight ? "" : undefined}
        orientation={orientation}
        className={cn(toolbarVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {highlight && <span aria-hidden data-slot="toolbar-highlight" />}
      </BaseToolbar.Root>
    </ToolbarContext.Provider>
  );
}

export type ToolbarButtonProps = BaseToolbar.Button.Props & ButtonProps;

/**
 * A quiet Button. Give it a `variant` to mark the main action; it keeps its
 * own fill and hover, and the highlight skips it.
 */
function ToolbarButton({
  className,
  variant,
  size = "icon",
  render,
  ...props
}: ToolbarButtonProps) {
  const iconOnly = size?.startsWith("icon");

  return (
    <BaseToolbar.Button
      data-slot="toolbar-button"
      data-toolbar-part=""
      data-toolbar-item={variant ? undefined : ""}
      render={
        <Button
          variant={variant}
          size={size}
          render={render}
          className={cn(
            itemShell,
            iconOnly && iconSquare,
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
function ToolbarToggle({
  className,
  children,
  render,
  ...props
}: ToolbarToggleProps) {
  const iconOnly = isIconOnly(
    children,
    props["aria-label"] ?? props["aria-labelledby"],
  );

  return (
    <BaseToolbar.Button
      data-slot="toolbar-toggle"
      data-toolbar-part=""
      data-toolbar-item=""
      render={
        <Toggle
          variant="ghost"
          render={render}
          className={cn(
            itemShell,
            "min-w-auto px-2.5 text-sm sm:min-w-auto",
            iconOnly && iconSquare,
            "text-current",
            "[--tgl-bg-active:var(--toolbar-press)] [--tgl-bg-hover:var(--toolbar-highlight)] [--tgl-bg-selected:var(--toolbar-pressed)]",
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
        // Air and line are all borders, so both sides snap alike.
        "pointer-events-none flex shrink-0 self-stretch border-transparent bg-transparent data-[orientation=horizontal]:h-auto data-[orientation=horizontal]:w-auto data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-auto",
        "before:border-transparent before:content-[''] after:border-transparent after:content-['']",
        "data-[orientation=vertical]:after:border-s-border data-[orientation=vertical]:border-e-[3px] data-[orientation=vertical]:before:border-s-[3px] data-[orientation=vertical]:after:h-5 data-[orientation=vertical]:after:self-center data-[orientation=vertical]:after:rounded-full data-[orientation=vertical]:after:border-s-[1.5px]",
        "data-[orientation=horizontal]:after:border-t-border data-[orientation=horizontal]:border-b-[3px] data-[orientation=horizontal]:before:border-t-[3px] data-[orientation=horizontal]:after:w-5 data-[orientation=horizontal]:after:self-center data-[orientation=horizontal]:after:rounded-full data-[orientation=horizontal]:after:border-t-[1.5px]",
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
      data-toolbar-part=""
      className={cn(
        itemShell,
        "placeholder:text-muted-foreground min-w-0 bg-transparent bg-clip-padding px-2.5 text-sm text-current",
        // Instant hover; the focus ring is in toolbar.css.
        "hover:bg-(--toolbar-highlight) focus:bg-(--toolbar-highlight)",
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
      data-toolbar-part=""
      data-toolbar-item=""
      className={cn(
        "relative isolate inline-flex items-center gap-1.5 px-2.5 text-sm font-medium whitespace-nowrap no-underline",
        itemShell,
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:transition-[background-color,scale] before:duration-100 before:ease-out before:content-['']",
        "hover:before:bg-(--toolbar-highlight) active:before:scale-[0.98] active:before:bg-(--toolbar-press) motion-reduce:active:before:scale-100",
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
