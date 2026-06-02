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
        "group text-muted-foreground hover:text-foreground flex h-9 items-center gap-2 rounded-full border border-transparent pr-1.5 pl-3 text-sm font-normal transition-colors",
        "hover:border-border/70 hover:bg-card/70",
        "focus-visible:outline-ring/50 outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
      )}
    >
      <HugeiconsIcon icon={Search01Icon} className="size-4" strokeWidth={2} />
      <span>Search</span>
      <Kbd
        size="sm"
        variant="outline"
        keys={["cmd", "k"]}
        className="ml-1 hidden lg:inline-flex"
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
      aria-current={active ? "page" : undefined}
      className={cn(
        // Mirrors the ghost Button / sidebar item: surface-overlay fill on
        // hover with a muted->foreground text shift, held at the stronger
        // selected overlay when active.
        "inline-flex h-8 items-center rounded-md px-2.5 text-sm font-medium transition-colors duration-150 ease-out",
        "focus-visible:outline-ring/50 outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
        active
          ? "text-foreground bg-(--surface-selected)"
          : "text-muted-foreground hover:text-foreground hover:bg-(--surface-hover)",
      )}
    >
      {label}
    </Link>
  );
}

function useScrolled(threshold = 6) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

export function TopNav() {
  const pathname = usePathname();
  const scrolled = useScrolled();

  return (
    <header
      style={{ ["--fd-nav-height" as string]: "3.5rem" }}
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-300 ease-out",
        scrolled
          ? "border-border/60 bg-background/72 border-b backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-8">
        {/* Left — logo + wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="Cubby UI — home"
        >
          <CubbyUILogo className="text-foreground h-5 w-auto" />
          <span className="text-foreground font-(family-name:--font-display) text-[1.05rem] leading-none font-semibold tracking-tight">
            Cubby UI
          </span>
        </Link>

        {/* Center — nav links */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
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
