"use client";

import * as React from "react";
import Link from "next/link";
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
  style,
}: {
  group: ShelfGroup;
  currentUrl: string;
  onNavigate: () => void;
  className?: string;
  listClassName?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section className={cn("min-w-0", className)} style={style}>
      <h2 className="text-muted-foreground mb-2 flex items-baseline gap-2 font-sans text-xs font-medium">
        {group.label}
        {group.kind === "grid" && (
          <span className="text-muted-foreground/70 tabular-nums">
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
 * Every docs page, laid out like a contents page: guides in a narrow first
 * column, then the component groups flowing down their own columns.
 */
export function Shelf({ id, groups, open, currentUrl, onClose }: ShelfProps) {
  const navRef = React.useRef<HTMLElement>(null);

  const guides = groups.filter((group) => group.kind === "list");
  const components = groups.filter((group) => group.kind === "grid");
  const [primary, ...rest] = components;

  // Open with focus on the current page (or the first link), so arrow keys
  // pick up from where the reader is.
  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const nav = navRef.current;
      const target =
        nav?.querySelector<HTMLElement>('[aria-current="page"]') ??
        nav?.querySelector<HTMLElement>("a");
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Up/down walk the links in reading order.
  const onNavKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const links = Array.from(
      navRef.current?.querySelectorAll<HTMLElement>("a") ?? [],
    );
    const index = links.indexOf(document.activeElement as HTMLElement);
    const next =
      links[
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

      <nav
        ref={navRef}
        aria-label="All documentation pages"
        onKeyDown={onNavKeyDown}
        className="docs-shelf-panel bg-background relative max-h-full overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto grid w-full max-w-[76rem] gap-x-12 gap-y-8 px-5 pt-6 pb-8 sm:px-8 lg:grid-cols-[10rem_minmax(0,3fr)_minmax(0,2fr)] lg:pt-8 lg:pb-10">
          <div
            className="docs-shelf-group grid grid-cols-2 content-start gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-1"
            style={{ ["--g" as string]: 0 }}
          >
            {guides.map((group) => (
              <ShelfSection
                key={group.label}
                group={group}
                currentUrl={currentUrl}
                onNavigate={navigate}
              />
            ))}
          </div>

          {primary && (
            <ShelfSection
              group={primary}
              currentUrl={currentUrl}
              onNavigate={navigate}
              listClassName="columns-2 gap-x-6 sm:columns-3"
              className="docs-shelf-group"
              style={{ ["--g" as string]: 1 }}
            />
          )}

          {rest.map((group, i) => (
            <ShelfSection
              key={group.label}
              group={group}
              currentUrl={currentUrl}
              onNavigate={navigate}
              listClassName="columns-2 gap-x-6 sm:columns-3 lg:columns-2"
              className="docs-shelf-group"
              style={{ ["--g" as string]: i + 2 }}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
