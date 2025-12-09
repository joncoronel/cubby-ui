"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/registry/default/button/button";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const smartToggle = () => {
    // Smart toggle logic inspired by Origin UI
    const prefersDarkScheme = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (theme === "system") {
      // If currently system, switch to opposite of what system resolves to
      setTheme(prefersDarkScheme ? "light" : "dark");
    } else if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      // Fallback to light
      setTheme("light");
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon">
        <div className="bg-muted h-4 w-4 animate-pulse rounded" />
      </Button>
    );
  }

  const getIcon = () => {
    if (theme === "system") {
      return <Monitor className="h-4 w-4" />;
    }
    // Use resolvedTheme for system theme to show actual icon
    const currentTheme = theme === "system" ? resolvedTheme : theme;
    return currentTheme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    );
  };

  const getTooltip = () => {
    if (theme === "system") {
      return `System theme (currently ${resolvedTheme})`;
    }
    return `${theme === "light" ? "Light" : "Dark"} theme`;
  };

  return (
    <Button
      onClick={smartToggle}
      variant="ghost"
      size="icon"
      title={getTooltip()}
      aria-label="Toggle theme"
    >
      {getIcon()}
    </Button>
  );
}
