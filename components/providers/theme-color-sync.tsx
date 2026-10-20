"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

// The layouts ship `theme-color` per OS scheme, wrong when the chosen theme
// differs. Once it resolves, copy the body background into every tag.
function toHex(color: string): string | null {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return null;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function ThemeColorSync(): null {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!resolvedTheme) return;
    // Defer a task: this runs before ThemeProvider swaps the theme class.
    const timer = setTimeout(() => {
      const color = toHex(getComputedStyle(document.body).backgroundColor);
      if (!color) return;
      for (const meta of document.querySelectorAll<HTMLMetaElement>(
        'meta[name="theme-color"]',
      )) {
        meta.content = color;
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [resolvedTheme, pathname]);

  return null;
}
