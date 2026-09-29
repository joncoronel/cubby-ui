"use client";

import * as React from "react";
import Link from "next/link";
import { solidSurface } from "@/registry/default/lib/elevated";
import { cn } from "@/lib/utils";
import type { ShelfGroup, ShelfItem } from "@/lib/docs-nav";

interface ShelfProps {
  id: string;
  groups: ShelfGroup[];
  open: boolean;
  currentUrl: string;
  onClose: (restoreFocus: boolean) => void;
}

function ShelfLink({
  item,
  current,
  onNavigate,
}: {
  item: ShelfItem;
  current: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.url}
      prefetch={false}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      className="docs-shelf-link"
    >
      <span aria-hidden="true" className="docs-shelf-mark" />
      <span className="truncate">{item.name}</span>
    </Link>
  );
}

function ShelfSection({
  group,
  currentUrl,
  onNavigate,
  className,
  listClassName,
}: {
  group: ShelfGroup;
  currentUrl: string;
  onNavigate: () => void;
  className?: string;
  listClassName?: string;
}) {
  return (
    <section className={cn("min-w-0", className)}>
      <h2 className="font-display text-foreground mb-2 flex items-baseline gap-2 text-sm font-semibold tracking-tight">
        {group.label}
        {group.kind === "grid" && (
          <span className="text-muted-foreground font-sans text-xs font-normal tabular-nums">
            {group.items.length}
          </span>
        )}
      </h2>
      <ul className={listClassName}>
        {group.items.map((item) => (
          <li key={item.url} className="break-inside-avoid">
            <ShelfLink
              item={item}
              current={item.url === currentUrl}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Every docs page in one window: guides down a side rail, the component
 * groups in columns beside it. It is for browsing; finding a page by name is
 * the search dialog's job, one button over in the header.
 */
export function Shelf({ id, groups, open, currentUrl, onClose }: ShelfProps) {
  const navRef = React.useRef<HTMLElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const guides = groups.filter((group) => group.kind === "list");
  const components = groups.filter((group) => group.kind === "grid");

  // Everything it needs to open is set before the first paint, in one
  // layout pass, so no frame of the animation waits on it: the scale
  // origin under the trigger (the window grows out of it), the list
  // scrolled to centre the page you're in, and focus on the window rather
  // than the link, which would show its ring on a click (the first arrow
  // key moves to the current page).
  React.useLayoutEffect(() => {
    if (!open) return;
    const nav = navRef.current;
    const scroller = scrollRef.current;
    const trigger = document.querySelector(`[aria-controls="${id}"]`);
    if (!nav) return;
    if (trigger) {
      const t = trigger.getBoundingClientRect();
      const n = nav.getBoundingClientRect();
      nav.style.setProperty(
        "--shelf-origin-x",
        `${Math.round(t.left + t.width / 2 - n.left)}px`,
      );
    }
    const current = nav.querySelector<HTMLElement>('[aria-current="page"]');
    if (scroller && current) {
      const box = scroller.getBoundingClientRect();
      const item = current.getBoundingClientRect();
      scroller.scrollTop = Math.round(
        scroller.scrollTop +
          item.top -
          box.top -
          (box.height - item.height) / 2,
      );
    }
    nav.focus({ preventScroll: true });
  }, [open, id]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Up and down walk the links in reading order, starting from the current
  // page.
  const onNavKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const nav = navRef.current;
    const links = Array.from(nav?.querySelectorAll<HTMLElement>("a") ?? []);
    const index = links.indexOf(document.activeElement as HTMLElement);
    const next =
      index === -1
        ? (nav?.querySelector<HTMLElement>('[aria-current="page"]') ?? links[0])
        : links[
            event.key === "ArrowDown"
              ? Math.min(index + 1, links.length - 1)
              : Math.max(index - 1, 0)
          ];
    if (next) {
      event.preventDefault();
      next.focus();
    }
  };

  const navigate = () => onClose(false);

  return (
    <div
      id={id}
      data-open={open ? "" : undefined}
      inert={!open}
      className="docs-shelf"
    >
      <div
        aria-hidden="true"
        className="docs-shelf-scrim absolute inset-0"
        onClick={() => onClose(false)}
      />

      <div className="docs-shelf-anchor">
        <nav
          ref={navRef}
          aria-label="All documentation pages"
          tabIndex={-1}
          onKeyDown={onNavKeyDown}
          className={cn("docs-shelf-panel outline-none", solidSurface(3, 5))}
        >
          <div ref={scrollRef} className="docs-shelf-scroll">
            <div className="docs-shelf-grid">
              <div className="docs-shelf-rail">
                {guides.map((group) => (
                  <ShelfSection
                    key={group.label}
                    group={group}
                    currentUrl={currentUrl}
                    onNavigate={navigate}
                  />
                ))}
              </div>
              <div className="docs-shelf-components">
                {components.map((group, i) => (
                  <ShelfSection
                    key={group.label}
                    group={group}
                    currentUrl={currentUrl}
                    onNavigate={navigate}
                    listClassName={cn(
                      "columns-2 gap-x-6 sm:columns-3",
                      i > 0 && "lg:columns-2",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
