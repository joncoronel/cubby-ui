"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { CubbyUILogo } from "@/components/cubbyui-logo";
import {
  GithubLink,
  SearchTrigger,
  ThemeToggle,
} from "@/components/home/top-nav";
import { Button } from "@/registry/default/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ShelfGroup } from "@/lib/docs-nav";
import { useDocsPageState } from "./docs-page-store";
import { MorphText, toPlainText } from "./morph-text";
import { Shelf } from "./shelf";

const SHELF_ID = "docs-shelf";

/** Four cubbies; the one you're in fills when the shelf opens. */
function CubbyGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="docs-cubby-glyph size-4 shrink-0"
    >
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.6" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.6" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.6" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.6" />
    </svg>
  );
}

function SectionCrumb() {
  const { toc, activeId, pastTitle } = useDocsPageState();
  const active = toc.find((item) => item.url === `#${activeId}`);

  if (!pastTitle || !active || toc.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="docs-crumb-section text-muted-foreground hover:text-foreground focus-visible:outline-ring/50 flex h-8 min-w-0 items-center gap-1 rounded-md px-1.5 text-sm outline-none focus-visible:outline-2"
          />
        }
      >
        <span aria-hidden="true" className="text-border mr-0.5">
          /
        </span>
        <span className="sr-only">Jump to section, current: </span>
        <MorphText truncate>{toPlainText(active.title)}</MorphText>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-[min(24rem,var(--available-height))] min-w-56"
      >
        {toc.map((item) => (
          <DropdownMenuItem
            key={item.url}
            render={<a href={item.url} />}
            className={cn(
              item.depth > 2 && "pl-6",
              item.depth > 3 && "pl-9",
              item.url === `#${activeId}` && "text-foreground font-medium",
            )}
          >
            {item.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileSearchButton() {
  const { setOpenSearch } = useSearchContext();
  return (
    <Button
      variant="ghost"
      size="icon_sm"
      aria-label="Search documentation"
      onClick={() => setOpenSearch(true)}
    >
      <HugeiconsIcon icon={Search01Icon} className="size-4" strokeWidth={2} />
    </Button>
  );
}

function findCurrent(groups: ShelfGroup[], pathname: string) {
  for (const group of groups) {
    const item = group.items.find((i) => i.url === pathname);
    if (item) return { group, item };
  }
  return null;
}

export function DocsHeader({ groups }: { groups: ShelfGroup[] }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const current = findCurrent(groups, pathname);

  // Navigating from the shelf closes it.
  const [prevPath, setPrevPath] = React.useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  // While the shelf is open the page behind it is scrim, not content.
  React.useEffect(() => {
    const root = document.documentElement;
    const main = document.getElementById("docs-main");
    if (open) {
      root.dataset.shelfOpen = "";
      main?.setAttribute("inert", "");
    } else {
      delete root.dataset.shelfOpen;
      main?.removeAttribute("inert");
    }
  }, [open]);

  const close = React.useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  return (
    <>
      <header className="docs-header fixed inset-x-0 top-0 z-50 h-14">
        <div className="mx-auto flex h-full max-w-[76rem] items-center gap-2 px-3 sm:gap-3 sm:px-8">
          <Link
            href="/"
            aria-label="Cubby UI home"
            className="focus-visible:outline-ring/50 flex h-9 shrink-0 items-center gap-2.5 rounded-md px-2 outline-none focus-visible:outline-2"
          >
            <CubbyUILogo className="text-foreground h-[18px] w-auto" />
            <span className="text-foreground font-display hidden text-[1.05rem] leading-none font-semibold tracking-tight lg:inline">
              Cubby UI
            </span>
          </Link>

          <div className="flex min-w-0 items-center">
            <button
              ref={triggerRef}
              type="button"
              aria-expanded={open}
              aria-controls={SHELF_ID}
              data-open={open ? "" : undefined}
              onClick={() => setOpen((o) => !o)}
              className="docs-shelf-trigger focus-visible:outline-ring/50 flex h-9 min-w-0 items-center gap-2 rounded-full pr-2.5 pl-2.5 text-sm outline-none focus-visible:outline-2"
            >
              <CubbyGlyph />
              <span className="flex min-w-0 items-baseline gap-1.5">
                {current ? (
                  <>
                    {/* The text-roll element sets its own display, so the responsive
                        visibility lives on a wrapper. */}
                    <span className="text-muted-foreground hidden shrink-0 sm:inline">
                      <MorphText>{current.group.label}</MorphText>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-border hidden sm:inline"
                    >
                      /
                    </span>
                    <MorphText truncate className="text-foreground font-medium">
                      {current.item.name}
                    </MorphText>
                  </>
                ) : (
                  <span className="text-foreground font-medium">Browse</span>
                )}
              </span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                strokeWidth={2}
                className="docs-shelf-chevron text-muted-foreground size-3.5 shrink-0"
              />
              <span className="sr-only">
                {open ? "Close" : "Open"} the page shelf
              </span>
            </button>
            <div className="hidden min-w-0 md:flex">
              <SectionCrumb />
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <div className="hidden md:block">
              <SearchTrigger />
            </div>
            <div className="md:hidden">
              <MobileSearchButton />
            </div>
            <ThemeToggle />
            <div className="hidden sm:block">
              <GithubLink />
            </div>
          </div>
        </div>
      </header>

      <Shelf
        id={SHELF_ID}
        groups={groups}
        open={open}
        currentUrl={pathname}
        onClose={close}
      />
    </>
  );
}
