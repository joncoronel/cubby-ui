"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  Moon01Icon,
  Search01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/registry/default/button/button";
import { Kbd } from "@/registry/default/kbd/kbd";
import { cn } from "@/lib/utils";
import { GITHUB_URL } from "./links";

export const NAV_ITEMS = [
  { label: "Components", href: "/docs/components/button" },
  { label: "Docs", href: "/docs/getting-started/introduction" },
] as const;

export { GITHUB_URL };

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // Both icons render; the `.dark` class next-themes sets before first paint
  // picks one, so the right icon shows without waiting for hydration.
  return (
    <Button
      variant="ghost"
      size="icon_sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <HugeiconsIcon
        icon={Moon01Icon}
        className="size-4 dark:hidden"
        strokeWidth={2}
      />
      <HugeiconsIcon
        icon={Sun01Icon}
        className="hidden size-4 dark:block"
        strokeWidth={2}
      />
    </Button>
  );
}

export function SearchTrigger() {
  const { setOpenSearch } = useSearchContext();

  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      className={cn(
        "group text-muted-foreground hover:text-foreground flex h-9 items-center gap-2 rounded-full border border-transparent pr-1.5 pl-3 text-sm font-normal transition-colors",
        "hover:border-border/70 hover:bg-card/70",
        "focus-visible:outline-ring/50 outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
      )}
    >
      <HugeiconsIcon icon={Search01Icon} className="size-4" strokeWidth={2} />
      <span>Search</span>
      {/* Both variants render on the server; the platform flag set in the
          document head picks one before first paint (see globals.css). */}
      <span className="ml-1 hidden lg:inline-flex">
        <Kbd
          size="sm"
          variant="outline"
          platform="mac"
          keys={["cmd", "k"]}
          data-platform-only="mac"
        />
        <Kbd
          size="sm"
          variant="outline"
          platform="windows"
          keys={["cmd", "k"]}
          data-platform-only="windows"
        />
      </span>
    </button>
  );
}

export function GithubLink() {
  return (
    <Button
      variant="ghost"
      size="icon_sm"
      aria-label="Open GitHub repository"
      render={
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Open GitHub repository"
        />
      }
      nativeButton={false}
    >
      <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
    </Button>
  );
}
