"use client";

import * as React from "react";
import { m, AnimatePresence, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

type Direction = "top" | "bottom" | "left" | "right";
type Anchor = "start" | "center" | "end";

type BloomMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  direction: Direction;
  anchor: Anchor;
  activeSubmenu: string | null;
  setActiveSubmenu: (id: string | null) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  isOpenAnimationCompleteRef: React.MutableRefObject<boolean>;
  reducedMotion: boolean;
  visualDuration: number;
  bounce: number;
  // Keyboard navigation
  registerItem: (id: string, ref: HTMLDivElement) => void;
  unregisterItem: (id: string) => void;
  focusedItemId: string | null;
  setFocusedItemId: (id: string | null) => void;
  focusNextItem: () => void;
  focusPrevItem: () => void;
};

type SubMenuContextValue = {
  id: string;
  triggerRef: React.RefObject<HTMLDivElement | null>;
};

// =============================================================================
// Contexts
// =============================================================================

const BloomMenuContext = React.createContext<BloomMenuContextValue | null>(
  null,
);

const SubMenuContext = React.createContext<SubMenuContextValue | null>(null);

function useBloomMenu() {
  const context = React.useContext(BloomMenuContext);
  if (!context) {
    throw new Error("BloomMenu components must be used within BloomMenu");
  }
  return context;
}

function useSubMenu() {
  const context = React.useContext(SubMenuContext);
  if (!context) {
    throw new Error(
      "BloomMenuSub components must be used within BloomMenuSub",
    );
  }
  return context;
}

// =============================================================================
// Animation Configuration
// =============================================================================

const VISUAL_DURATION = 0.25;
const BOUNCE = 0.2;
const TRIGGER_BLUR = 8;
const CONTENT_BLUR = 10;
const CONTENT_DELAY = 0.03;

const reducedMotionSpring = {
  stiffness: 1000,
  damping: 100,
};

// =============================================================================
// Utility Hooks
// =============================================================================

function useControllable<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (value: T) => void] {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = React.useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange],
  );

  return [currentValue, setValue];
}

function useClickOutside(
  refs: React.RefObject<HTMLElement | null>[],
  handler: () => void,
  enabled: boolean,
) {
  React.useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutside = refs.every((ref) => !ref.current?.contains(target));
      if (isOutside) {
        handler();
      }
    };

    // Delay to avoid immediate close from trigger click
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside, true);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [refs, handler, enabled]);
}

function useEscapeKey(handler: () => void, enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handler();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handler, enabled]);
}

// =============================================================================
// Position Utilities
// =============================================================================

function getPositionStyles(direction: Direction): React.CSSProperties {
  const styles: React.CSSProperties = {
    position: "absolute",
  };

  switch (direction) {
    case "top":
      styles.bottom = 0;
      styles.left = 0;
      break;
    case "bottom":
      styles.top = 0;
      styles.left = 0;
      break;
    case "left":
      styles.right = 0;
      styles.bottom = 0;
      break;
    case "right":
      styles.left = 0;
      styles.bottom = 0;
      break;
  }

  return styles;
}

function getAnchorOffset(
  direction: Direction,
  anchor: Anchor,
  menuWidth: number,
  menuHeight: number,
  buttonWidth: number,
  buttonHeight: number,
) {
  if (anchor === "start") {
    return { x: 0, y: 0 };
  }

  const offsetAmount = anchor === "center" ? 0.5 : 1;

  if (direction === "top" || direction === "bottom") {
    const xOffset = -(menuWidth - buttonWidth) * offsetAmount;
    return { x: xOffset, y: 0 };
  } else {
    const yOffset = (menuHeight - buttonHeight) * offsetAmount;
    return { x: 0, y: yOffset };
  }
}

function getTransformOrigin(direction: Direction, anchor: Anchor): string {
  const vertical =
    direction === "top" ? "bottom" : direction === "bottom" ? "top" : "center";
  const horizontal =
    direction === "left" ? "right" : direction === "right" ? "left" : "center";

  if (direction === "top" || direction === "bottom") {
    const h = anchor === "start" ? "left" : anchor === "end" ? "right" : "center";
    return `${h} ${vertical}`;
  } else {
    const v = anchor === "start" ? "bottom" : anchor === "end" ? "top" : "center";
    return `${horizontal} ${v}`;
  }
}

function getAnimationOffset(direction: Direction, amount: number) {
  switch (direction) {
    case "top":
      return { y: -amount };
    case "bottom":
      return { y: amount };
    case "left":
      return { x: -amount };
    case "right":
      return { x: amount };
  }
}

function getContentOffset(direction: Direction, amount: number) {
  // Content offsets toward trigger origin (opposite of expansion direction)
  switch (direction) {
    case "top":
      return { x: 0, y: amount };
    case "bottom":
      return { x: 0, y: -amount };
    case "left":
      return { x: amount, y: 0 };
    case "right":
      return { x: -amount, y: 0 };
  }
}

// =============================================================================
// BloomMenu (Root)
// =============================================================================

type BloomMenuProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  direction?: Direction;
  anchor?: Anchor;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
};

function BloomMenu({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  direction = "bottom",
  anchor: anchorProp = "start",
  closeOnClickOutside = true,
  closeOnEscape = true,
}: BloomMenuProps) {
  // For horizontal directions, anchor is always center
  const anchor =
    direction === "left" || direction === "right" ? "center" : anchorProp;

  const [open, setOpen] = useControllable({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const reducedMotion = useReducedMotion() ?? false;
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isOpenAnimationCompleteRef = React.useRef(false);

  const [activeSubmenu, setActiveSubmenu] = React.useState<string | null>(null);

  // Keyboard navigation state
  const [focusedItemId, setFocusedItemId] = React.useState<string | null>(null);
  const itemsRef = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const itemOrderRef = React.useRef<string[]>([]);

  const registerItem = React.useCallback(
    (id: string, ref: HTMLDivElement) => {
      itemsRef.current.set(id, ref);
      if (!itemOrderRef.current.includes(id)) {
        itemOrderRef.current.push(id);
      }
    },
    [],
  );

  const unregisterItem = React.useCallback((id: string) => {
    itemsRef.current.delete(id);
    itemOrderRef.current = itemOrderRef.current.filter((i) => i !== id);
  }, []);

  const focusNextItem = React.useCallback(() => {
    const items = itemOrderRef.current;
    if (items.length === 0) return;

    const currentIndex = focusedItemId ? items.indexOf(focusedItemId) : -1;
    const nextIndex = (currentIndex + 1) % items.length;
    const nextId = items[nextIndex];
    setFocusedItemId(nextId);
    itemsRef.current.get(nextId)?.focus();
  }, [focusedItemId]);

  const focusPrevItem = React.useCallback(() => {
    const items = itemOrderRef.current;
    if (items.length === 0) return;

    const currentIndex = focusedItemId ? items.indexOf(focusedItemId) : 0;
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    const prevId = items[prevIndex];
    setFocusedItemId(prevId);
    itemsRef.current.get(prevId)?.focus();
  }, [focusedItemId]);

  // Wrapper to reset animation state when menu opens/closes
  const handleSetOpen = React.useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        isOpenAnimationCompleteRef.current = false;
        setFocusedItemId(null);
        // Reset item order for fresh registration
        itemOrderRef.current = [];
      } else {
        setActiveSubmenu(null);
      }
      setOpen(newOpen);
    },
    [setOpen],
  );

  // Close on click outside
  useClickOutside(
    [triggerRef, contentRef],
    () => handleSetOpen(false),
    open && closeOnClickOutside,
  );

  // Close on escape
  useEscapeKey(() => handleSetOpen(false), open && closeOnEscape);

  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen: handleSetOpen,
      direction,
      anchor,
      activeSubmenu,
      setActiveSubmenu,
      triggerRef,
      contentRef,
      isOpenAnimationCompleteRef,
      reducedMotion,
      visualDuration: VISUAL_DURATION,
      bounce: BOUNCE,
      registerItem,
      unregisterItem,
      focusedItemId,
      setFocusedItemId,
      focusNextItem,
      focusPrevItem,
    }),
    [
      open,
      handleSetOpen,
      direction,
      anchor,
      activeSubmenu,
      reducedMotion,
      registerItem,
      unregisterItem,
      focusedItemId,
      focusNextItem,
      focusPrevItem,
    ],
  );

  return (
    <BloomMenuContext.Provider value={contextValue}>
      {children}
    </BloomMenuContext.Provider>
  );
}

// =============================================================================
// BloomMenuContainer
// =============================================================================

type BloomMenuContainerProps = {
  children: React.ReactNode;
  buttonSize?: number | { width: number; height: number };
  menuWidth?: number;
  menuRadius?: number;
  buttonRadius?: number;
  className?: string;
  style?: React.CSSProperties;
};

function BloomMenuContainer({
  children,
  buttonSize = 40,
  menuWidth = 200,
  menuRadius = 12,
  buttonRadius,
  className,
  style,
}: BloomMenuContainerProps) {
  const {
    open,
    setOpen,
    direction,
    anchor,
    activeSubmenu,
    reducedMotion,
    visualDuration,
    bounce,
    contentRef,
  } = useBloomMenu();

  const measureRef = React.useRef<HTMLDivElement>(null);

  const buttonWidth =
    typeof buttonSize === "number" ? buttonSize : buttonSize.width;
  const buttonHeight =
    typeof buttonSize === "number" ? buttonSize : buttonSize.height;
  const [measuredHeight, setMeasuredHeight] =
    React.useState<number>(buttonHeight);

  // Track submenu-related styles
  const [submenuStylesActive, setSubmenuStylesActive] = React.useState(false);
  const wasSubmenuActiveRef = React.useRef(false);

  // Delay reverting submenu styles until exit animation completes
  React.useEffect(() => {
    if (activeSubmenu) {
      wasSubmenuActiveRef.current = true;
      setSubmenuStylesActive(true);
    } else if (wasSubmenuActiveRef.current) {
      const timeout = setTimeout(() => {
        setSubmenuStylesActive(false);
        wasSubmenuActiveRef.current = false;
      }, visualDuration * 1000);
      return () => clearTimeout(timeout);
    }
  }, [activeSubmenu, visualDuration]);

  const springConfig = reducedMotion
    ? { type: "spring" as const, ...reducedMotionSpring }
    : { type: "spring" as const, visualDuration, bounce };

  // Measure content height when open
  React.useLayoutEffect(() => {
    if (open && measureRef.current) {
      const height = measureRef.current.offsetHeight;
      setMeasuredHeight(height);
    }
  }, [open]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      if (!open) {
        event.preventDefault();
        setOpen(true);
      }
    },
    [open, setOpen],
  );

  // Default to pill shape
  const closedRadius = buttonRadius ?? Math.min(buttonWidth, buttonHeight) / 2;
  const positionStyles = getPositionStyles(direction);
  const transformOrigin = getTransformOrigin(direction, anchor);

  // Lift amount is 75% of button height
  const liftAmount = buttonHeight * 0.75;
  const directionOffset = getAnimationOffset(direction, liftAmount);
  const anchorOffset = getAnchorOffset(
    direction,
    anchor,
    menuWidth,
    measuredHeight,
    buttonWidth,
    buttonHeight,
  );

  const openOffset = {
    x: (directionOffset.x || 0) + anchorOffset.x,
    y: (directionOffset.y || 0) + anchorOffset.y,
  };

  return (
    <div
      data-slot="bloom-menu-container"
      style={{
        position: "relative",
        width: buttonWidth,
        height: buttonHeight,
      }}
    >
      <m.div
        ref={contentRef}
        onClick={handleClick}
        initial={false}
        animate={{
          width: open ? menuWidth : buttonWidth,
          height: open ? measuredHeight : buttonHeight,
          borderRadius: open ? menuRadius : closedRadius,
          x: open ? openOffset.x : 0,
          y: open ? openOffset.y : 0,
          scale: activeSubmenu ? 0.96 : 1,
          boxShadow: open
            ? "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
            : "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        }}
        transition={springConfig}
        className={cn("bg-popover", className)}
        style={{
          ...positionStyles,
          overflow: submenuStylesActive ? "visible" : "hidden",
          cursor: open ? "default" : "pointer",
          transformOrigin: submenuStylesActive ? "center center" : transformOrigin,
          zIndex: open ? 50 : "auto",
          willChange: "transform",
          ...style,
        }}
      >
        <div ref={measureRef}>{children}</div>
      </m.div>
    </div>
  );
}

// =============================================================================
// BloomMenuTrigger
// =============================================================================

type BloomMenuTriggerProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

function BloomMenuTrigger({
  children,
  className,
  disabled = false,
}: BloomMenuTriggerProps) {
  const {
    open,
    setOpen,
    triggerRef,
    reducedMotion,
    visualDuration,
    bounce,
    focusNextItem,
  } = useBloomMenu();

  const springConfig = reducedMotion
    ? { type: "spring" as const, ...reducedMotionSpring }
    : { type: "spring" as const, visualDuration: visualDuration * 0.85, bounce };

  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(!open);
    },
    [disabled, setOpen, open],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(!open);
      }
      if (event.key === "ArrowDown" && !open) {
        event.preventDefault();
        setOpen(true);
        // Focus first item after opening
        requestAnimationFrame(() => {
          focusNextItem();
        });
      }
    },
    [disabled, setOpen, open, focusNextItem],
  );

  const triggerVariants = {
    visible: {
      opacity: 1,
      filter: "blur(0px)",
    },
    hidden: {
      opacity: 0,
      filter: reducedMotion ? "blur(0px)" : `blur(${TRIGGER_BLUR}px)`,
    },
  };

  return (
    <AnimatePresence initial={false}>
      {!open && (
        <m.div
          ref={triggerRef}
          key="bloom-trigger"
          data-slot="bloom-menu-trigger"
          layout={false}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={triggerVariants}
          transition={springConfig}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-disabled={disabled || undefined}
          className={className}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// BloomMenuContent
// =============================================================================

type BloomMenuContentProps = {
  children: React.ReactNode;
  className?: string;
};

function BloomMenuContent({ children, className }: BloomMenuContentProps) {
  const {
    open,
    direction,
    reducedMotion,
    visualDuration,
    bounce,
    isOpenAnimationCompleteRef,
    focusNextItem,
    focusPrevItem,
  } = useBloomMenu();

  const springConfig = reducedMotion
    ? { type: "spring" as const, ...reducedMotionSpring }
    : { type: "spring" as const, visualDuration: visualDuration * 0.85, bounce };

  const hiddenOffset = getContentOffset(direction, 8);
  const exitOffset = getContentOffset(direction, 30);

  const contentVariants = {
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      transition: {
        ...springConfig,
        delay: reducedMotion ? 0 : CONTENT_DELAY,
      },
    },
    hidden: {
      opacity: 0,
      scale: 0.95,
      ...hiddenOffset,
      filter: reducedMotion ? "blur(0px)" : `blur(${CONTENT_BLUR}px)`,
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      ...exitOffset,
      filter: reducedMotion ? "blur(0px)" : `blur(${CONTENT_BLUR}px)`,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 1, 1],
      },
    },
  };

  const handleAnimationComplete = React.useCallback(
    (definition: string) => {
      if (definition === "visible") {
        isOpenAnimationCompleteRef.current = true;
      }
    },
    [isOpenAnimationCompleteRef],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusNextItem();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        focusPrevItem();
      }
    },
    [focusNextItem, focusPrevItem],
  );

  return (
    <AnimatePresence>
      {open && (
        <m.div
          key="bloom-content"
          data-slot="bloom-menu-content"
          role="menu"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={contentVariants}
          transition={{
            ...springConfig,
            delay: reducedMotion ? 0 : CONTENT_DELAY,
          }}
          onAnimationComplete={handleAnimationComplete}
          onKeyDown={handleKeyDown}
          className={cn("text-popover-foreground", className)}
          style={{ position: "relative" }}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// BloomMenuItem
// =============================================================================

type BloomMenuItemProps = {
  children: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  closeOnSelect?: boolean;
  variant?: "default" | "destructive";
  className?: string;
};

function BloomMenuItem({
  children,
  onSelect,
  disabled = false,
  closeOnSelect = true,
  variant = "default",
  className,
}: BloomMenuItemProps) {
  const {
    setOpen,
    isOpenAnimationCompleteRef,
    activeSubmenu,
    reducedMotion,
    visualDuration,
    bounce,
    registerItem,
    unregisterItem,
    focusedItemId,
    setFocusedItemId,
  } = useBloomMenu();

  const subMenuContext = React.useContext(SubMenuContext);
  const [isHovered, setIsHovered] = React.useState(false);
  const itemRef = React.useRef<HTMLDivElement>(null);
  const itemId = React.useId();

  // Register item for keyboard navigation
  React.useEffect(() => {
    if (itemRef.current && !disabled) {
      registerItem(itemId, itemRef.current);
    }
    return () => unregisterItem(itemId);
  }, [itemId, disabled, registerItem, unregisterItem]);

  // Only dim if there's an active submenu AND this item is NOT inside that submenu
  const isInsideActiveSubmenu = subMenuContext && activeSubmenu === subMenuContext.id;
  const shouldDim = activeSubmenu !== null && !isInsideActiveSubmenu;

  const springConfig = reducedMotion
    ? { type: "spring" as const, ...reducedMotionSpring }
    : { type: "spring" as const, visualDuration, bounce };

  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return;
      event.preventDefault();
      onSelect?.();
      if (closeOnSelect) {
        setOpen(false);
      }
    },
    [disabled, onSelect, closeOnSelect, setOpen],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect?.();
        if (closeOnSelect) {
          setOpen(false);
        }
      }
    },
    [disabled, onSelect, closeOnSelect, setOpen],
  );

  const handleMouseEnter = React.useCallback(() => {
    if (!isOpenAnimationCompleteRef.current) return;
    if (!disabled) {
      setIsHovered(true);
      setFocusedItemId(itemId);
    }
  }, [disabled, isOpenAnimationCompleteRef, setFocusedItemId, itemId]);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleFocus = React.useCallback(() => {
    setFocusedItemId(itemId);
    setIsHovered(true);
  }, [setFocusedItemId, itemId]);

  const handleBlur = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  const isFocused = focusedItemId === itemId;

  return (
    <m.div
      ref={itemRef}
      data-slot="bloom-menu-item"
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      data-highlighted={(isHovered || isFocused) || undefined}
      data-variant={variant}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      animate={{
        opacity: shouldDim ? 0.5 : 1,
      }}
      transition={springConfig}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none",
        "data-highlighted:bg-accent/50 data-highlighted:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/20",
        "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        transformOrigin: "center center",
        userSelect: "none",
      }}
    >
      {children}
    </m.div>
  );
}

// =============================================================================
// BloomMenuSeparator
// =============================================================================

type BloomMenuSeparatorProps = {
  className?: string;
};

function BloomMenuSeparator({ className }: BloomMenuSeparatorProps) {
  return (
    <div
      data-slot="bloom-menu-separator"
      role="separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
    />
  );
}

// =============================================================================
// BloomMenuSub
// =============================================================================

type BloomMenuSubProps = {
  children: React.ReactNode;
  id: string;
};

function BloomMenuSub({ children, id }: BloomMenuSubProps) {
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const contextValue = React.useMemo(() => ({ id, triggerRef }), [id]);

  return (
    <SubMenuContext.Provider value={contextValue}>
      {children}
    </SubMenuContext.Provider>
  );
}

// =============================================================================
// BloomMenuSubTrigger
// =============================================================================

type BloomMenuSubTriggerProps = {
  children: React.ReactNode | ((isActive: boolean) => React.ReactNode);
  className?: string;
  disabled?: boolean;
};

function BloomMenuSubTrigger({
  children,
  className,
  disabled = false,
}: BloomMenuSubTriggerProps) {
  const {
    setActiveSubmenu,
    activeSubmenu,
    reducedMotion,
    visualDuration,
    bounce,
  } = useBloomMenu();
  const { id, triggerRef } = useSubMenu();

  const isActive = activeSubmenu === id;

  const springConfig = reducedMotion
    ? { type: "spring" as const, ...reducedMotionSpring }
    : { type: "spring" as const, visualDuration, bounce };

  // Scale to pop forward to 1.06 visual (Container is at 0.96, so 0.96 * 1.104 ≈ 1.06)
  const openScale = 1.06 / 0.96;

  // Track elevated state separately to persist during exit animation
  const [isElevated, setIsElevated] = React.useState(false);
  const wasActiveRef = React.useRef(false);

  React.useEffect(() => {
    if (isActive) {
      wasActiveRef.current = true;
      setIsElevated(true);
    } else if (wasActiveRef.current) {
      const timeout = setTimeout(() => {
        setIsElevated(false);
        wasActiveRef.current = false;
      }, visualDuration * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isActive, visualDuration]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) {
        setActiveSubmenu(isActive ? null : id);
      }
    },
    [disabled, setActiveSubmenu, id, isActive],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveSubmenu(isActive ? null : id);
      } else if (event.key === "ArrowRight" && !isActive) {
        event.preventDefault();
        setActiveSubmenu(id);
      } else if ((event.key === "ArrowLeft" || event.key === "Escape") && isActive) {
        event.preventDefault();
        event.stopPropagation();
        setActiveSubmenu(null);
      }
    },
    [disabled, setActiveSubmenu, id, isActive],
  );

  const content = typeof children === "function" ? children(isActive) : children;

  return (
    <m.div
      ref={triggerRef}
      data-slot="bloom-menu-sub-trigger"
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={isActive}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      data-active={isActive || undefined}
      data-elevated={isElevated || undefined}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none",
        "data-highlighted:bg-accent/50 data-highlighted:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      initial={false}
      animate={{
        scale: isActive ? openScale : 1,
      }}
      transition={springConfig}
      style={{
        position: "relative",
        zIndex: isElevated ? 20 : undefined,
        transformOrigin: "top center",
        userSelect: "none",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {content}
    </m.div>
  );
}

// =============================================================================
// BloomMenuSubContent
// =============================================================================

type BloomMenuSubContentProps = {
  children: React.ReactNode;
  className?: string;
};

function BloomMenuSubContent({
  children,
  className,
}: BloomMenuSubContentProps) {
  const {
    activeSubmenu,
    setActiveSubmenu,
    contentRef: mainContentRef,
    reducedMotion,
    visualDuration,
    bounce,
  } = useBloomMenu();
  const { id, triggerRef } = useSubMenu();

  const subMenuRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLDivElement>(null);

  const [triggerTop, setTriggerTop] = React.useState(0);
  const [triggerHeight, setTriggerHeight] = React.useState(44);
  const [contentHeight, setContentHeight] = React.useState(triggerHeight);

  const isActive = activeSubmenu === id;

  // Measure trigger dimensions when submenu opens
  React.useLayoutEffect(() => {
    if (isActive && triggerRef.current) {
      setTriggerTop(triggerRef.current.offsetTop);
      setTriggerHeight(triggerRef.current.offsetHeight);
    }
  }, [isActive, triggerRef]);

  // Measure content height
  React.useLayoutEffect(() => {
    if (isActive && measureRef.current) {
      setContentHeight(measureRef.current.offsetHeight);
    }
  }, [isActive, children, triggerHeight]);

  // Handle click outside to close submenu (but not main menu)
  React.useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (subMenuRef.current?.contains(target)) {
        return;
      }

      if (triggerRef.current?.contains(target)) {
        return;
      }

      if (mainContentRef.current?.contains(target)) {
        event.stopPropagation();
        setActiveSubmenu(null);
        return;
      }

      setActiveSubmenu(null);
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside, true);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [isActive, setActiveSubmenu, mainContentRef, triggerRef]);

  const springConfig = reducedMotion
    ? { type: "spring" as const, ...reducedMotionSpring }
    : { type: "spring" as const, visualDuration, bounce };

  const contentSpringConfig = reducedMotion
    ? { type: "spring" as const, ...reducedMotionSpring }
    : { type: "spring" as const, visualDuration: visualDuration * 0.85, bounce };

  const contentVariants = {
    hidden: {
      opacity: 0,
      filter: reducedMotion ? "blur(0px)" : `blur(${CONTENT_BLUR}px)`,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        ...contentSpringConfig,
        delay: 0.05,
      },
    },
    exit: {
      opacity: 0,
      filter: reducedMotion ? "blur(0px)" : `blur(${CONTENT_BLUR}px)`,
      transition: {
        duration: 0.15,
      },
    },
  };

  const openScale = 1.06 / 0.96;

  return (
    <AnimatePresence>
      {isActive && (
        <m.div
          ref={subMenuRef}
          data-slot="bloom-menu-sub-content"
          className={cn("bg-popover text-popover-foreground", className)}
          initial={{
            height: triggerHeight,
            scale: 1,
            opacity: 1,
            pointerEvents: "auto" as const,
          }}
          animate={{
            height: contentHeight,
            scale: openScale,
            opacity: 1,
            pointerEvents: "auto" as const,
          }}
          exit={{
            height: triggerHeight,
            scale: 1,
            opacity: 0,
            pointerEvents: "none" as const,
          }}
          transition={{
            height: springConfig,
            scale: springConfig,
            opacity: { duration: 0.15 },
          }}
          style={{
            position: "absolute",
            top: triggerTop,
            left: 0,
            right: 0,
            zIndex: 10,
            overflow: "hidden",
            transformOrigin: "top center",
            willChange: "transform, height, opacity",
            boxSizing: "content-box",
          }}
        >
          <div ref={measureRef}>
            {/* Spacer for trigger */}
            <div style={{ height: triggerHeight }} aria-hidden="true" />

            {/* Content with fade-in */}
            <m.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              {children}
            </m.div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// BloomMenuLabel
// =============================================================================

type BloomMenuLabelProps = React.ComponentProps<"div"> & {
  inset?: boolean;
};

function BloomMenuLabel({ className, inset, ...props }: BloomMenuLabelProps) {
  return (
    <div
      data-slot="bloom-menu-label"
      data-inset={inset}
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

// =============================================================================
// BloomMenuShortcut
// =============================================================================

type BloomMenuShortcutProps = React.ComponentProps<"span">;

function BloomMenuShortcut({ className, ...props }: BloomMenuShortcutProps) {
  return (
    <span
      data-slot="bloom-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

// =============================================================================
// Exports
// =============================================================================

export {
  BloomMenu,
  BloomMenuContainer,
  BloomMenuTrigger,
  BloomMenuContent,
  BloomMenuItem,
  BloomMenuSeparator,
  BloomMenuSub,
  BloomMenuSubTrigger,
  BloomMenuSubContent,
  BloomMenuLabel,
  BloomMenuShortcut,
};
