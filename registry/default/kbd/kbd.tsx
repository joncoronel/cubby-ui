import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const kbdVariants = cva(
  // Tiny raised "keycap": surface-3 chip + 1px --border, sharing the form-field
  // surface vocabulary (border + bg-clip-padding). A soft drop gives the
  // physical key lift (shadow color matches the surface-shadow base, oklch(0 0
  // 0)); flat variants (outline/ghost) and the pressed state drop it.
  "inline-flex items-center justify-center rounded-sm border bg-clip-padding text-center font-medium tracking-tight shadow-[0_1px_2px_0_oklch(0_0_0/0.06)] transition-colors duration-150 font-mono",
  {
    variants: {
      size: {
        sm: "h-5 min-w-5 px-1.5 text-xs",
        md: "h-6 min-w-6 px-2 text-xs",
        lg: "h-7 min-w-7 px-2.5 text-sm",
      },
      variant: {
        default: "bg-card text-foreground",
        primary: "bg-primary text-primary-foreground border-primary",
        secondary: "bg-secondary text-secondary-foreground border-secondary",
        outline: "bg-transparent text-foreground shadow-none",
        ghost: "border-transparent bg-muted text-muted-foreground shadow-none",
        danger: "bg-destructive text-destructive-foreground border-destructive",
      },
      pressed: {
        true: "translate-y-px bg-muted shadow-none",
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
    if (typeof navigator === "undefined") return;
    // `navigator.platform` is deprecated. Prefer userAgentData.platform
    // (Chromium) and fall back to the userAgent string, which is supported
    // everywhere and not deprecated.
    const uaData = (
      navigator as Navigator & { userAgentData?: { platform?: string } }
    ).userAgentData;
    const platformHint = uaData?.platform ?? navigator.userAgent;
    setPlatform(/mac/i.test(platformHint) ? "mac" : "windows");
  }, []);

  return platform;
}

export interface KbdProps
  extends React.ComponentProps<"kbd">, VariantProps<typeof kbdVariants> {
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
        disabled && "cursor-not-allowed opacity-60",
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
