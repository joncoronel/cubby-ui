"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  Menu01Icon,
  Moon01Icon,
  Search01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { CubbyUILogo } from "@/components/cubbyui-logo";
import { Button } from "@/registry/default/button/button";
import { Kbd } from "@/registry/default/kbd/kbd";
import { cn } from "@/lib/utils";
import { MobileNavSheet } from "./mobile-nav-sheet";

export const NAV_ITEMS = [
  { label: "Components", href: "/docs/components/button" },
  { label: "Docs", href: "/docs/getting-started/introduction" },
] as const;

export const GITHUB_URL = "https://github.com/joncoronel/cubby-ui";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon_sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <HugeiconsIcon
        icon={isDark ? Sun01Icon : Moon01Icon}
        className="size-4"
        strokeWidth={2}
      />
    </Button>
  );
}

function SearchTrigger() {
  const { setOpenSearch } = useSearchContext();

  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      className={cn(
        "group text-muted-foreground hover:text-foreground flex h-9 items-center gap-2 rounded-md border border-transparent px-2.5 text-sm font-normal transition-colors",
        "hover:border-border/60 hover:bg-muted/60",
        "focus-visible:outline-ring/50 outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
      )}
    >
      <HugeiconsIcon
        icon={Search01Icon}
        className="size-4"
        strokeWidth={2}
      />
      <span>Search</span>
      <Kbd
        size="sm"
        variant="outline"
        keys={["cmd", "k"]}
        className="ml-2 hidden lg:inline-flex"
      />
    </button>
  );
}

function GithubLink() {
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

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex items-center text-sm font-medium transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <header
      style={{ ["--fd-nav-height" as string]: "3.5rem" }}
      className="border-border/60 bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-8">
        {/* Left — logo + wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-2"
          aria-label="Cubby UI — home"
        >
          <CubbyUILogo className="text-foreground h-5 w-auto" />
          <span className="font-rubik text-foreground text-base leading-none font-semibold tracking-tight">
            Cubby UI
          </span>
        </Link>

        {/* Center — nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (pathname?.startsWith(item.href) ?? false);
            return (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={active}
              />
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-1.5">
          <div className="hidden md:block">
            <SearchTrigger />
          </div>
          <ThemeToggle />
          <div className="hidden sm:block">
            <GithubLink />
          </div>

          {/* Mobile: hamburger opens sheet */}
          <div className="md:hidden">
            <MobileNavSheet
              trigger={
                <Button
                  variant="ghost"
                  size="icon_sm"
                  aria-label="Open navigation menu"
                >
                  <HugeiconsIcon
                    icon={Menu01Icon}
                    className="size-4"
                    strokeWidth={2}
                  />
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </header>
  );
}
