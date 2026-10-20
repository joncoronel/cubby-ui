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
    // Never narrower than its items; overflow is the container's to handle.
    "min-w-max",
    // Paint corners are the shell's minus the 2px edge border.
    "[--toolbar-item-radius:max(0px,calc(var(--toolbar-radius)-2px))]",
    // Hover 8%, press 10%: black overlays (white in dark), not a cool-cast label
    // tint. `pressedStyle` below sets the toggled-on fill.
    "[--toolbar-highlight:var(--surface-active)] [--toolbar-press:var(--surface-selected)]",
    // The shell is fixed and items stretch to fill it; columns grow to the
    // widest item.
    "data-[orientation=horizontal]:h-(--toolbar-h)",
    // Parts dim with the shell, not twice.
    "data-disabled:opacity-60 data-disabled:**:data-toolbar-part:opacity-100",
  ],
  {
    variants: {
      variant: {
        elevated: cn(solidSurface(3, 3), "text-foreground"),
        outline:
          "bg-(--outline) text-foreground outline outline-(--outline-border)",
        soft: "bg-secondary text-secondary-foreground",
        ghost: "text-foreground",
      },
      // Subtle (default) is a quiet 12% overlay for rows with several toggles
      // on; solid is the emphasis grey, as in Toggle Group and Tabs.
      pressedStyle: {
        subtle:
          "[--toolbar-pressed:oklch(0_0_0/12%)] dark:[--toolbar-pressed:oklch(1_0_0/12%)] [--toolbar-pressed-foreground:currentColor]",
        solid:
          "[--toolbar-pressed:var(--emphasis)] [--toolbar-pressed-foreground:var(--emphasis-foreground)]",
      },
      // Button's height ladder (one step taller below sm); corners step with it.
      size: {
        sm: "[--toolbar-h:--spacing(9)] sm:not-pointer-coarse:[--toolbar-h:--spacing(8)] [--toolbar-radius:calc(var(--radius)-2px)]",
        default:
          "[--toolbar-h:--spacing(10)] sm:not-pointer-coarse:[--toolbar-h:--spacing(9)] [--toolbar-radius:var(--radius)]",
        lg: "[--toolbar-h:--spacing(11)] sm:not-pointer-coarse:[--toolbar-h:--spacing(10)] [--toolbar-radius:calc(var(--radius)+2px)]",
      },
    },
  },
);

// Shared by every item: concentric corners and stretch.
const itemShell = cn(
  "shrink-0",
  "rounded-[calc(var(--toolbar-item-radius)+2px)] before:rounded-(--toolbar-item-radius) focus-visible:z-10",
  "h-auto self-stretch sm:not-pointer-coarse:h-auto",
  // In a column every item gets the row's paint height, and at least its
  // width, so the column is never narrower than the row is tall.
  "group-data-[orientation=vertical]/toolbar:box-content group-data-[orientation=vertical]/toolbar:py-0 group-data-[orientation=vertical]/toolbar:h-[calc(var(--toolbar-h)-4px)] sm:not-pointer-coarse:group-data-[orientation=vertical]/toolbar:h-[calc(var(--toolbar-h)-4px)] group-data-[orientation=vertical]/toolbar:min-w-[calc(var(--toolbar-h)-4px)]",
);

// Without the pill, hover lights instantly, so a sweep never shows two items
// half-lit; press and the pressed fill still fade. toolbar.css times the
// fills while the pill glides.
const instantHover =
  "before:[transition-duration:0ms,100ms,100ms] active:before:[transition-duration:100ms] data-pressed:before:[transition-duration:100ms]";

// Icon-only items have a square paint (the content box, with no padding),
// whatever each side's border: as tall as the row, or as wide as the column.
const iconSquare =
  "box-content aspect-square w-auto px-0 sm:not-pointer-coarse:w-auto group-data-[orientation=vertical]/toolbar:h-auto sm:not-pointer-coarse:group-data-[orientation=vertical]/toolbar:h-auto";

type ToolbarVariant = NonNullable<
  VariantProps<typeof toolbarVariants>["variant"]
>;
type ToolbarSize = NonNullable<VariantProps<typeof toolbarVariants>["size"]>;

const ToolbarContext = React.createContext<{
  orientation: "horizontal" | "vertical";
  size: ToolbarSize;
  pressedStyle: "subtle" | "solid";
}>({ orientation: "horizontal", size: "default", pressedStyle: "subtle" });

// Items take their padding, text, and icon size from the toolbar's size, on
// Toggle's and Button's scales.
const itemSize: Record<ToolbarSize, string> = {
  sm: "px-2 text-sm [&_svg:not([class*='size-'])]:size-4",
  default: "px-2.5 text-sm [&_svg:not([class*='size-'])]:size-4",
  lg: "px-3 text-base [&_svg:not([class*='size-'])]:size-5",
};

// Button's icon size for each toolbar size; text buttons use the toolbar's
// size as is.
const iconSize = { sm: "icon_sm", default: "icon", lg: "icon_lg" } as const;

export type ToolbarProps = BaseToolbar.Root.Props & {
  /** Shell style. */
  variant?: ToolbarVariant;
  /** Outer height, on Button's ladder. */
  size?: ToolbarSize;
  /** Glide a shared highlight between items on hover and focus. */
  highlight?: boolean;
  /** How toggled-on toggles look: a quiet tint or the solid emphasis grey. */
  pressedStyle?: "subtle" | "solid";
};

function Toolbar({
  className,
  variant = "elevated",
  size = "default",
  orientation = "horizontal",
  highlight = true,
  pressedStyle = "subtle",
  children,
  ...props
}: ToolbarProps) {
  const context = React.useMemo(
    () => ({ orientation, size, pressedStyle }),
    [orientation, size, pressedStyle],
  );

  return (
    <ToolbarContext.Provider value={context}>
      <BaseToolbar.Root
        data-slot="toolbar"
        data-variant={variant}
        data-size={size}
        data-glide={highlight ? "" : undefined}
        data-pressed-style={pressedStyle}
        orientation={orientation}
        className={cn(
          toolbarVariants({ variant, size, pressedStyle }),
          className,
        )}
        {...props}
      >
        {children}
        {highlight && (
          <span
            aria-hidden
            data-slot="toolbar-highlight"
            data-toolbar-highlight
          />
        )}
      </BaseToolbar.Root>
    </ToolbarContext.Provider>
  );
}

export type ToolbarButtonProps = BaseToolbar.Button.Props & ButtonProps;

/**
 * A quiet Button. Give it a `variant` to mark the main action; it keeps its
 * own fill and hover, and the highlight skips it. Without a `size`, it takes
 * Button's size for the toolbar's, icon or text by its content.
 */
function ToolbarButton({
  className,
  variant,
  size: sizeProp,
  render,
  ...props
}: ToolbarButtonProps) {
  const toolbar = React.use(ToolbarContext);
  const iconOnly = sizeProp
    ? sizeProp.startsWith("icon")
    : isIconOnly(
        props.children,
        props["aria-label"] ?? props["aria-labelledby"],
      );
  const size = sizeProp ?? (iconOnly ? iconSize[toolbar.size] : toolbar.size);

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
            // toolbar overlays. A set variant keeps its own paint.
            !variant &&
              cn(
                "text-current [--btn-bg-active:var(--toolbar-press)] [--btn-bg-hover:var(--toolbar-highlight)] [--btn-bg:transparent] [--btn-border:transparent]",
                instantHover,
              ),
            className,
          )}
        />
      }
      {...props}
    />
  );
}

// The toolbar sets the pressed look, so toggles take no `pressedStyle` of their own.
export type ToolbarToggleProps = BaseToolbar.Button.Props &
  Omit<ToggleProps, "variant" | "size" | "pressedStyle">;

/** A Toggle that stays pressed when on, with Toggle Group's deeper tint. */
function ToolbarToggle({
  className,
  children,
  render,
  ...props
}: ToolbarToggleProps) {
  const { size, pressedStyle } = React.use(ToolbarContext);
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
          data-pressed-style={pressedStyle}
          className={cn(
            itemShell,
            "min-w-auto sm:not-pointer-coarse:min-w-auto",
            itemSize[size],
            iconOnly && iconSquare,
            "text-current",
            "[--tgl-bg-active:var(--toolbar-press)] [--tgl-bg-hover:var(--toolbar-highlight)] [--tgl-bg-selected:var(--toolbar-pressed)] data-pressed:text-(--toolbar-pressed-foreground)",
            instantHover,
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
  const { size } = React.use(ToolbarContext);
  return (
    <BaseToolbar.Input
      data-slot="toolbar-input"
      data-toolbar-part=""
      className={cn(
        itemShell,
        "placeholder:text-muted-foreground min-w-0 bg-transparent bg-clip-padding text-current",
        itemSize[size],
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
  const { size } = React.use(ToolbarContext);
  return (
    <BaseToolbar.Link
      data-slot="toolbar-link"
      data-toolbar-part=""
      data-toolbar-item=""
      className={cn(
        "relative isolate inline-flex items-center gap-1.5 font-medium whitespace-nowrap no-underline",
        itemSize[size],
        itemShell,
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:transition-[background-color,scale] before:duration-100 before:ease-out before:content-['']",
        "before:[transition-duration:0ms,100ms] active:before:[transition-duration:100ms]",
        "hover:before:bg-(--toolbar-highlight) active:before:scale-[0.98] active:before:bg-(--toolbar-press) motion-reduce:active:before:scale-100",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
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
