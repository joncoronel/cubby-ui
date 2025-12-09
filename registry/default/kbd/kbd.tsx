import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const kbdVariants = cva(
  "inline-flex items-center justify-center rounded-sm border text-center font-medium tracking-tight shadow-[0_1px_3px_0_oklch(0.18_0_0_/_0.08)] transition-colors duration-200 font-mono",
  {
    variants: {
      size: {
        sm: "h-5 min-w-5 px-1.5 text-xs",
        md: "h-6 min-w-6 px-2 text-xs",
        lg: "h-7 min-w-7 px-2.5 text-sm",
      },
      variant: {
        default: "bg-background border-border/60 text-foreground",
        primary: "bg-primary text-primary-foreground border-primary",
        secondary: "bg-secondary text-secondary-foreground border-secondary",
        outline: "border-2 border-border/60 bg-transparent text-foreground",
        ghost: "border-transparent bg-muted text-muted-foreground shadow-none",
        danger: "bg-destructive text-destructive-foreground border-destructive",
      },
      pressed: {
        true: "shadow-none translate-y-px bg-muted",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      pressed: false,
    },
  },
);

const platformKeys = {
  mac: {
    cmd: "⌘",
    option: "⌥",
    alt: "⌥",
    ctrl: "⌃",
    shift: "⇧",
    enter: "↵",
    delete: "⌫",
    backspace: "⌫",
    escape: "⎋",
    tab: "⇥",
    space: "⎵",
    up: "↑",
    down: "↓",
    left: "←",
    right: "→",
  },
  windows: {
    cmd: "Ctrl",
    option: "Alt",
    alt: "Alt",
    ctrl: "Ctrl",
    shift: "Shift",
    enter: "Enter",
    delete: "Del",
    backspace: "Backspace",
    escape: "Esc",
    tab: "Tab",
    space: "Space",
    up: "↑",
    down: "↓",
    left: "←",
    right: "→",
  },
};

function useClientPlatform(): "mac" | "windows" {
  const [platform, setPlatform] = React.useState<"mac" | "windows">("mac");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setPlatform(
        navigator.platform.toLowerCase().includes("mac") ? "mac" : "windows",
      );
    }
  }, []);

  return platform;
}

export interface KbdProps
  extends React.ComponentProps<"kbd">,
    VariantProps<typeof kbdVariants> {
  keys?: string[];
  separator?: string;
  platform?: "mac" | "windows" | "auto";
  disabled?: boolean;
  "aria-label"?: string;
}

function Kbd({
  className,
  size,
  variant,
  pressed,
  keys,
  separator = "+",
  platform = "auto",
  disabled = false,
  children,
  "aria-label": ariaLabel,
  ...props
}: KbdProps) {
  const clientPlatform = useClientPlatform();
  const detectedPlatform = platform === "auto" ? clientPlatform : platform;
  const keyMap = platformKeys[detectedPlatform];

  const renderKey = (key: string) => {
    const normalizedKey = key.toLowerCase();
    return keyMap[normalizedKey as keyof typeof keyMap] || key;
  };

  const content = keys ? (
    <span className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-muted-foreground text-xs font-normal">
              {separator}
            </span>
          )}
          <span>{renderKey(key)}</span>
        </React.Fragment>
      ))}
    </span>
  ) : (
    children
  );

  return (
    <kbd
      data-slot="kbd"
      className={cn(
        kbdVariants({ size, variant, pressed }),
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      {...props}
    >
      {content}
    </kbd>
  );
}

export { Kbd, kbdVariants };
