import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import { cn } from "@/lib/utils";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import {
  SwitchVisual,
  type SwitchVisualProps,
} from "@/registry/default/switch/switch";

// Shared shell for checkbox and radio items. Padding matches the plain menu
// item so labels line up across every item type; the indicator lives in a
// reserved right-hand column so toggling never shifts the label.
const toggleItemClasses =
  "group/switch data-highlighted:bg-surface-hover data-highlighted:text-accent-foreground grid cursor-default items-center rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-60 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

// The tick draws itself in on check. Tick02Icon is a single path of length
// ~22, so dashoffset 22 hides it and 0 completes it; the classes reach the
// path through the svg HugeiconsIcon renders.
const checkmarkClasses =
  "[&_path]:ease-out-expo [&_path]:transition-[stroke-dashoffset] [&_path]:duration-150 [&_path]:[stroke-dasharray:22] in-data-checked:[&_path]:[stroke-dashoffset:0] in-data-unchecked:[&_path]:[stroke-dashoffset:22] motion-reduce:[&_path]:transition-none";

function Menubar({
  className,
  level = 2,
  shadowLevel = 2,
  ...props
}: React.ComponentProps<typeof BaseMenubar> & {
  /** Surface elevation level (1-8). Defaults to 2 — a subtle inline toolbar that sits just above the page. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Defaults to 2. */
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <BaseMenubar
      data-slot="menubar"
      data-level={level}
      className={cn(
        "relative flex h-9 items-center gap-1 rounded-lg p-1",
        solidSurface(level, shadowLevel),
        className,
      )}
      {...props}
    />
  );
}

function MenubarMenu({ ...props }: React.ComponentProps<typeof BaseMenu.Root>) {
  return <BaseMenu.Root data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof BaseMenu.Group>) {
  return <BaseMenu.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof BaseMenu.Portal>) {
  return <BaseMenu.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof BaseMenu.RadioGroup>) {
  return <BaseMenu.RadioGroup data-slot="menubar-radio-group" {...props} />;
}

function MenubarTrigger({
  className,
  delay = 0,
  closeDelay = 0,
  ...props
}: React.ComponentProps<typeof BaseMenu.Trigger>) {
  return (
    <BaseMenu.Trigger
      data-slot="menubar-trigger"
      delay={delay}
      closeDelay={closeDelay}
      className={cn(
        "data-popup-open:text-accent-foreground hover:text-accent-foreground hover:bg-surface-hover data-popup-open:bg-surface-hover flex items-center rounded-sm px-2.5 py-1 text-sm font-medium select-none",
        // Menubar triggers are a real tab stop and arrowing between them moves
        // DOM focus, so they need a visible indicator. `outline-offset-1`
        // rather than the usual 2 because the triggers sit in a tight row and
        // a wider ring would collide with its neighbours.
        "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-1",
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  children,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  level = 3,
  shadowLevel = 3,
  ...props
}: React.ComponentProps<typeof BaseMenu.Popup> & {
  align?: BaseMenu.Positioner.Props["align"];
  alignOffset?: BaseMenu.Positioner.Props["alignOffset"];
  sideOffset?: BaseMenu.Positioner.Props["sideOffset"];
  /** Surface elevation level for the popup bg (1-8). Bump when nesting inside a Dialog or other elevated container. Defaults to 3. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default so the menu reads the same regardless of nesting depth. */
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <MenubarPortal>
      {/*
        No data-instant guard here, unlike DropdownMenu. There a single
        positioner is shared by detached triggers and physically travels between
        them, so a settled swap has a real journey worth suppressing. Each
        MenubarMenu is its own Menu.Root, so every menu mounts its own
        positioner with no previous position to animate from.
      */}
      <BaseMenu.Positioner
        className="z-50 h-(--positioner-height) max-h-(--available-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
      >
        <BaseMenu.Popup
          data-slot="menubar-content"
          data-level={level}
          className={cn(
            "text-popover-foreground relative max-h-(--available-height) min-w-[12rem] overflow-hidden rounded-xl outline-none",
            solidSurface(level, shadowLevel),
            "h-(--popup-height,auto) w-(--popup-width,auto)",
            "origin-(--transform-origin) transition-[width,height,scale,opacity] duration-[150ms,150ms,100ms,100ms] ease-[cubic-bezier(0.22,1,0.36,1),cubic-bezier(0.22,1,0.36,1),var(--ease-out-expo),var(--ease-out-expo)]",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            // Own compositor layer while mounted. Having width/height in the
            // transition list above keeps Chrome from compositing the scale, so
            // the rows re-raster every frame and the differential stretch (top
            // edge ~0.2px, bottom ~7px) reads as a ripple down the list.
            // ContextMenu escapes this only because it transitions scale and
            // opacity alone and therefore gets composited for free.
            "will-change-transform",
            "motion-reduce:transition-none motion-reduce:will-change-auto",
            // No data-instant guard at all, deliberately. 'group' is the
            // menubar case — moving from File to Edit, where the menu is
            // already open and only its content and position change — and
            // suppressing it is the conventional choice. We let it animate
            // instead: each MenubarMenu mounts its own popup, so the swap is a
            // real unmount and mount rather than a morph, and snapping only the
            // transition leaves the two popups crossfading against a frozen
            // scale. The other instants were never candidates: 'dismiss' must
            // animate or Base UI has nothing to wait on and the popup unmounts
            // with no exit, 'click' is inferred from `event.detail === 0` and
            // so also matches right-clicks and programmatic .click(), and
            // 'trigger-change' cannot fire here because each MenubarMenu is its
            // own Menu.Root with exactly one trigger.
            className,
          )}
          {...props}
        >
          {/*
            Kept for sizing, not for content transitions. Base UI runs the popup
            auto-resize from inside the Viewport, and that is what writes
            --positioner-width / --positioner-height (plus --popup-width /
            --popup-height, which sit at `auto` between resizes). The positioner
            above sizes off those, so dropping the Viewport leaves them unset
            and its explicit box collapses.

            Deliberately carries no morph styling. A menubar can't morph: each
            MenubarMenu is its own Menu.Root, so moving from File to Edit mounts
            a new popup rather than swapping content within one, and
            data-current / data-previous / data-activation-direction never
            appear. (Verified: two distinct popup elements across a switch.)
          */}
          <BaseMenu.Viewport
            data-slot="menubar-viewport"
            className="relative max-h-(--available-height) w-full overflow-clip overflow-y-auto p-1"
          >
            {children}
          </BaseMenu.Viewport>
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </MenubarPortal>
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof BaseMenu.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <BaseMenu.Item
      data-slot="menubar-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        "data-highlighted:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/20 data-[variant=destructive]:data-highlighted:text-destructive-foreground data-[variant=destructive]:*:[svg]:text-destructive! data-highlighted:data-[variant=destructive]:*:[svg]:text-destructive-foreground! [&_svg:not([class*='text-'])]:text-muted-foreground data-highlighted:bg-surface-hover relative flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-60 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function MenubarLinkItem({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof BaseMenu.LinkItem> & {
  inset?: boolean;
}) {
  return (
    <BaseMenu.LinkItem
      data-slot="menubar-link-item"
      data-inset={inset || undefined}
      className={cn(
        "data-highlighted:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground data-highlighted:bg-surface-hover relative flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm no-underline outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-60 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  inset,
  indicator = "check",
  switchShape = "circle",
  switchSize = "xs",
  switchMotion = "default",
  ...props
}: React.ComponentProps<typeof BaseMenu.CheckboxItem> & {
  inset?: boolean;
  /** Which indicator sits in the right-hand column. `"switch"` is visual only — the item keeps the `menuitemcheckbox` role. */
  indicator?: "check" | "switch";
  /** Thumb silhouette, when `indicator="switch"`. */
  switchShape?: SwitchVisualProps["shape"];
  /** Thumb size, when `indicator="switch"`. Defaults to `xs`, which matches the row's text. */
  switchSize?: SwitchVisualProps["size"];
  /** How the thumb travels, when `indicator="switch"`. */
  switchMotion?: SwitchVisualProps["motion"];
}) {
  return (
    <BaseMenu.CheckboxItem
      data-slot="menubar-checkbox-item"
      data-inset={inset || undefined}
      data-indicator={indicator}
      className={cn(
        toggleItemClasses,
        indicator === "switch"
          ? "grid-cols-[1fr_auto] gap-3"
          : "grid-cols-[1fr_1rem] gap-2",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="col-start-1 flex min-w-0 items-center gap-2">
        {children}
      </span>
      {indicator === "switch" ? (
        // Visual only, and non-interactive: the row itself carries the role and
        // the click target, so nesting a real Switch here would put a focusable
        // control inside a menuitemcheckbox. Base UI's indicator supplies the
        // aria-hidden.
        <SwitchVisual
          shape={switchShape}
          size={switchSize}
          motion={switchMotion}
          className="col-start-2"
          render={<BaseMenu.CheckboxItemIndicator keepMounted />}
        />
      ) : (
        <BaseMenu.CheckboxItemIndicator
          keepMounted
          className="col-start-2 flex items-center justify-center"
        >
          <HugeiconsIcon
            icon={Tick02Icon}
            strokeWidth={2.5}
            className={cn("size-4", checkmarkClasses)}
          />
        </BaseMenu.CheckboxItemIndicator>
      )}
    </BaseMenu.CheckboxItem>
  );
}

function MenubarRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof BaseMenu.RadioItem> & {
  inset?: boolean;
}) {
  return (
    <BaseMenu.RadioItem
      data-slot="menubar-radio-item"
      data-inset={inset || undefined}
      className={cn(toggleItemClasses, "grid-cols-[1fr_1rem] gap-2", className)}
      {...props}
    >
      <span className="col-start-1 flex min-w-0 items-center gap-2">
        {children}
      </span>
      <BaseMenu.RadioItemIndicator
        keepMounted
        className="col-start-2 flex items-center justify-center"
      >
        <HugeiconsIcon
          icon={Tick02Icon}
          strokeWidth={2.5}
          className={cn("size-4", checkmarkClasses)}
        />
      </BaseMenu.RadioItemIndicator>
    </BaseMenu.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean;
}) {
  return (
    <div
      data-slot="menubar-label"
      data-inset={inset || undefined}
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium data-inset:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function MenubarGroupLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof BaseMenu.GroupLabel> & {
  inset?: boolean;
}) {
  return (
    <BaseMenu.GroupLabel
      data-slot="menubar-group-label"
      data-inset={inset || undefined}
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium data-inset:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof BaseMenu.Separator>) {
  return (
    <BaseMenu.Separator
      data-slot="menubar-separator"
      // Inset to the item label, not the popup edge: mx-2.5 clears the
      // viewport's p-1 plus the item's px-2.5, so the rule starts where the
      // text does instead of running into the popup's rounded corners.
      className={cn("bg-border mx-2.5 my-1 h-px", className)}
      {...props}
    />
  );
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof BaseMenu.SubmenuRoot>) {
  return <BaseMenu.SubmenuRoot data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof BaseMenu.SubmenuTrigger> & {
  inset?: boolean;
}) {
  return (
    <BaseMenu.SubmenuTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset || undefined}
      className={cn(
        "data-highlighted:text-accent-foreground data-popup-open:text-accent-foreground data-highlighted:bg-surface-hover data-popup-open:bg-surface-hover flex cursor-default items-center rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none data-inset:pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="ml-auto h-4 w-4"
        strokeWidth={2}
      />
    </BaseMenu.SubmenuTrigger>
  );
}

function MenubarSubContent({
  className,
  children,
  sideOffset = 8,
  level = 5,
  shadowLevel = 3,
  ...props
}: React.ComponentProps<typeof BaseMenu.Popup> & {
  sideOffset?: BaseMenu.Positioner.Props["sideOffset"];
  /** Surface elevation level for the submenu bg (1-8). Defaults to 5 — one tier above the parent menu's default of 3. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default so the submenu reads the same dropdown weight as its parent. */
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <MenubarPortal>
      <BaseMenu.Positioner
        className="z-50 max-h-(--available-height)"
        sideOffset={sideOffset}
      >
        <BaseMenu.Popup
          data-slot="menubar-sub-content"
          data-level={level}
          className={cn(
            "text-popover-foreground relative max-h-(--available-height) min-w-[12rem] overflow-hidden rounded-xl outline-none",
            solidSurface(level, shadowLevel),
            // Submenus open as their own popup (no Viewport content-swap) — scale + fade
            "ease-out-expo origin-(--transform-origin) transition-[transform,scale,opacity] duration-100",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            "motion-reduce:transition-none",
            className,
          )}
          {...props}
        >
          <div className="p-1">{children}</div>
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </MenubarPortal>
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarGroupLabel,
  MenubarLabel,
  MenubarItem,
  MenubarLinkItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
