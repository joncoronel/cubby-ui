"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  GithubIcon,
  Menu01Icon,
  Moon01Icon,
  Search01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { CubbyUILogo } from "@/components/cubbyui-logo";
import { cn } from "@/lib/utils";
import { GITHUB_URL, NAV_ITEMS } from "./top-nav";
import { MobileNavSheet } from "./mobile-nav-sheet";

/** A quiet control painted for the ultramarine slab. */
const onField = cn(
  "inline-flex h-9 items-center justify-center rounded-full text-(--land-on-field-muted) outline-0 outline-offset-2 outline-transparent outline-solid",
  "hover:bg-(--land-field-line) hover:text-(--land-on-field) focus-visible:outline-2 focus-visible:outline-(--land-on-field)",
);

/**
 * The landing page's nav, set on the slab rather than above it: the logo,
 * the two places to go, search, theme and GitHub, and Get started.
 */
export function LandingNav() {
  const { setOpenSearch } = useSearchContext();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header
      style={{ ["--fd-nav-height" as string]: "4rem" }}
      className="relative z-10 flex h-16 items-center justify-between gap-4 px-4 sm:px-6"
    >
      <Link
        href="/"
        aria-label="Cubby UI home"
        className="flex items-center gap-2.5 rounded-lg text-(--land-on-field) outline-0 outline-offset-4 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-(--land-on-field)"
      >
        <CubbyUILogo className="h-5 w-auto" />
        <span className="font-(family-name:--font-display) text-[1.1rem] leading-none font-semibold tracking-tight">
          Cubby UI
        </span>
      </Link>

      <nav
        aria-label="Main"
        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(onField, "px-3.5 text-sm font-medium")}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setOpenSearch(true)}
          aria-label="Search the docs"
          className={cn(onField, "size-9")}
        >
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="size-4"
          />
        </button>
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className={cn(onField, "size-9")}
        >
          <HugeiconsIcon
            icon={Moon01Icon}
            strokeWidth={2}
            className="size-4 dark:hidden"
          />
          <HugeiconsIcon
            icon={Sun01Icon}
            strokeWidth={2}
            className="hidden size-4 dark:block"
          />
        </button>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Open GitHub repository"
          className={cn(onField, "hidden size-9 sm:inline-flex")}
        >
          <HugeiconsIcon icon={GithubIcon} strokeWidth={2} className="size-4" />
        </a>
        <Link
          href="/docs/getting-started/introduction"
          className="ml-2 hidden h-9 items-center gap-1 rounded-full bg-(--land-on-field) pr-3 pl-4 text-sm font-medium text-(--land-field) outline-0 outline-offset-2 outline-transparent outline-solid hover:opacity-90 focus-visible:outline-2 focus-visible:outline-(--land-on-field) active:scale-[0.97] md:inline-flex"
        >
          Get started
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            className="size-4"
          />
        </Link>
        <div className="md:hidden">
          <MobileNavSheet
            trigger={
              <button
                type="button"
                aria-label="Open navigation menu"
                className={cn(onField, "size-9")}
              >
                <HugeiconsIcon
                  icon={Menu01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </button>
            }
          />
        </div>
      </div>
    </header>
  );
}
