"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

// The route layouts ship `theme-color` per OS scheme, which is right before
// hydration but wrong when the visitor picks a theme against their OS. Once
// the theme resolves, point every theme-color tag at the page's actual
// background, so the browser toolbar follows the chosen theme and the CSS
// stays the single source of the color.
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
    // A task later: this effect runs before ThemeProvider's own, which is
    // what swaps the theme class, so the old background would still be read.
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
