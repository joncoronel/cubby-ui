"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PauseIcon, PlayIcon } from "@hugeicons/core-free-icons";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import { CopyButton } from "@/registry/default/copy-button/copy-button";
import { solidSurface } from "@/registry/default/lib/elevated";
import { usePackageManager } from "@/components/mdx/use-package-manager";
import { packageManagerCommands } from "@/components/mdx/package-manager-commands";
import { cn } from "@/lib/utils";

export interface ShowcaseItem {
  slug: string;
  name: string;
  demo: React.ReactNode;
}

/** How long each showpiece stays before the next one comes in. */
const DWELL_MS = 5200;

/** The site's settle curve: fast out of the gate, long gentle landing. */
const EASE_OUT_EXPO = "cubic-bezier(0.19, 1, 0.22, 1)";
/** A quick, decisive exit: most of the move in the first few frames. */
const EASE_EXIT = "cubic-bezier(0.25, 1, 0.5, 1)";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The hero's proof: one install command joined to the component it
 * installs. The command's component name changes letter by letter and the
 * component above it swaps in, live. It moves on by itself while it's on
 * screen, until the reader picks one, pauses it, points at it, or focuses
 * inside it.
 */
export function Showcase({ items }: { items: ShowcaseItem[] }) {
  const [index, setIndex] = React.useState(0);
  // Which way the swap travels: forward (1) sends the old demo left and
  // brings the new one in from the right, like moving along the tabs.
  const [direction, setDirection] = React.useState<1 | -1>(1);
  // Pointer and focus pause it separately: sharing one flag, moving the
  // pointer away resumed it with focus still inside, and the next swap made
  // the focused panel inert.
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  // A tab picked or the pause button pressed: stays put until resumed.
  const [stopped, setStopped] = React.useState(false);
  const [onScreen, setOnScreen] = React.useState(true);
  // Auto-advance, and its dwell line, start only after mount, together, and
  // never under reduced motion.
  const [canAdvance, setCanAdvance] = React.useState(false);
  const [pm] = usePackageManager();
  const baseId = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const tablistRef = React.useRef<HTMLDivElement>(null);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const panelRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const shownRef = React.useRef(index);
  const [pill, setPill] = React.useState<{ x: number; w: number } | null>(null);
  const [pillReady, setPillReady] = React.useState(false);

  React.useEffect(() => {
    setCanAdvance(!prefersReducedMotion());
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const go = (next: number): void => {
    if (next === index) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  // Arrow keys, Home and End move between tabs (one Tab stop for the row).
  const onTabKeyDown = (event: React.KeyboardEvent): void => {
    const last = items.length - 1;
    const next =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setStopped(true);
    go(next);
    tabRefs.current[next]?.focus();
  };

  // The highlight slides to the current tab, measured from the tab itself so
  // it fits any label (re-measured when the row or any tab resizes, say a
  // font swapping in); the tab row scrolls it into view on a narrow screen.
  React.useLayoutEffect(() => {
    const list = tablistRef.current;
    const measure = (): void => {
      const tab = tabRefs.current[index];
      if (tab) setPill({ x: tab.offsetLeft, w: tab.offsetWidth });
    };
    measure();
    const tab = tabRefs.current[index];
    if (list && tab) {
      const left = tab.offsetLeft - 16;
      const right = tab.offsetLeft + tab.offsetWidth + 16 - list.clientWidth;
      if (list.scrollLeft > left) list.scrollTo({ left, behavior: "smooth" });
      else if (list.scrollLeft < right)
        list.scrollTo({ left: right, behavior: "smooth" });
    }
    if (!list) return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    tabRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [index]);
  // Placed once without motion, so it doesn't slide in from the edge.
  React.useEffect(() => {
    if (pill && !pillReady) requestAnimationFrame(() => setPillReady(true));
  }, [pill, pillReady]);

  // The swap: the old demo leaves quickly, drifting a little the way the
  // tabs moved and softening, and the new one settles in from the other
  // side just behind it, so the two barely overlap. Web Animations rather
  // than CSS, so a quick second click cancels mid-move and starts from
  // where things are.
  React.useLayoutEffect(() => {
    const from = shownRef.current;
    shownRef.current = index;
    if (from === index) return;
    const leaving = panelRefs.current[from];
    const arriving = panelRefs.current[index];
    for (const el of [leaving, arriving]) {
      // Only the swap's own: the panel's scroll fade runs on CSS
      // scroll-driven animations, which cancelling everything killed.
      el?.getAnimations()
        .filter((a) => !(a instanceof CSSAnimation))
        .forEach((a) => a.cancel());
    }
    if (prefersReducedMotion()) {
      leaving?.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 120,
        easing: "ease-out",
      });
      arriving?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 180,
        easing: "ease-out",
      });
      return;
    }
    leaving?.animate(
      [
        { opacity: 1, transform: "translateX(0)", filter: "blur(0px)" },
        {
          opacity: 0,
          transform: `translateX(${-12 * direction}px)`,
          filter: "blur(3px)",
        },
      ],
      { duration: 160, easing: EASE_EXIT },
    );
    arriving?.animate(
      [
        {
          opacity: 0,
          transform: `translateX(${16 * direction}px)`,
          filter: "blur(4px)",
        },
        { opacity: 1, transform: "translateX(0)", filter: "blur(0px)" },
      ],
      { duration: 380, delay: 70, easing: EASE_OUT_EXPO, fill: "backwards" },
    );
  }, [index, direction]);

  const auto = canAdvance && onScreen && !stopped && !hovered && !focused;

  React.useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => {
      // Moving on is always forward, the wrap back to the first included.
      setDirection(1);
      setIndex((i) => (i + 1) % items.length);
    }, DWELL_MS);
    return () => window.clearTimeout(id);
  }, [index, auto, items.length]);

  const item = items[index];
  const head = packageManagerCommands("shadcn@latest add @cubby-ui/", "run")[
    pm
  ];
  const command = head + item.slug;

  return (
    <div
      ref={rootRef}
      className="flex w-full flex-col gap-3"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div className="flex items-center gap-2">
        <div
          role="tablist"
          aria-label="Showcased components"
          ref={tablistRef}
          onKeyDown={onTabKeyDown}
          className="scroll-fade-x relative -mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {pill && (
            <span
              aria-hidden="true"
              style={{
                transform: `translateX(${pill.x}px)`,
                width: pill.w,
                transitionTimingFunction: EASE_OUT_EXPO,
              }}
              className={cn(
                "pointer-events-none absolute top-0 left-0 h-8 rounded-full bg-(--land-on-field) motion-reduce:transition-none",
                pillReady && "transition-[transform,width] duration-[400ms]",
              )}
            />
          )}
          {items.map((it, i) => (
            <button
              key={it.slug}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={i === index}
              aria-controls={`${baseId}-panel-${i}`}
              tabIndex={i === index ? 0 : -1}
              onClick={() => {
                setStopped(true);
                go(i);
              }}
              className={cn(
                // The label changes colour with the highlight arriving under
                // it (the pill itself is the element above); before the pill
                // is measured, the current tab paints its own fill.
                "relative h-8 shrink-0 overflow-hidden rounded-full px-3 text-sm font-medium outline-0 outline-offset-2 outline-transparent transition-colors duration-200 outline-solid focus-visible:outline-2 focus-visible:outline-(--land-on-field)",
                i === index
                  ? cn("text-(--land-field)", !pill && "bg-(--land-on-field)")
                  : "text-(--land-on-field-muted) hover:bg-(--land-field-line) hover:text-(--land-on-field)",
              )}
            >
              {i === index && auto && (
                <span
                  key={index}
                  aria-hidden="true"
                  style={{ ["--dwell" as string]: `${DWELL_MS}ms` }}
                  className="land-dwell absolute inset-x-3 bottom-1 h-px bg-(--land-field)/40"
                />
              )}
              {it.name}
            </button>
          ))}
        </div>
        {canAdvance && (
          <button
            type="button"
            onClick={() => setStopped((s) => !s)}
            aria-label={stopped ? "Resume the showcase" : "Pause the showcase"}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-(--land-on-field-muted) outline-0 outline-offset-2 outline-transparent outline-solid hover:bg-(--land-field-line) hover:text-(--land-on-field) focus-visible:outline-2 focus-visible:outline-(--land-on-field)"
          >
            <HugeiconsIcon
              icon={stopped ? PlayIcon : PauseIcon}
              strokeWidth={2}
              className="size-4"
            />
          </button>
        )}
      </div>

      <div
        className={cn(
          "land-stage text-foreground overflow-hidden rounded-[1.25rem]",
          solidSurface(3, 6),
        )}
      >
        {/* Every demo stays laid out, stacked in one cell (a hidden one
            measured zero, so its text morph animated its box from nothing
            when it came back); the swap above animates between them. */}
        <div className="grid h-[16rem]">
          {items.map((it, i) => (
            <div
              key={it.slug}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              role="tabpanel"
              id={`${baseId}-panel-${i}`}
              aria-labelledby={`${baseId}-tab-${i}`}
              inert={i !== index}
              aria-hidden={i !== index}
              className={cn(
                // Taller content (an opened tree) scrolls inside the stage
                // with faded edges; safe centring starts it at the top
                // instead of pushing it off both ends.
                "scroll-fade flex items-center-safe justify-center overflow-y-auto overscroll-contain p-4 [grid-area:1/1] sm:p-5",
                i === index ? "opacity-100" : "opacity-0",
              )}
            >
              {it.demo}
            </div>
          ))}
        </div>

        {/* The command that installs what's above it. */}
        <div className="bg-muted text-foreground border-border flex items-center gap-2 border-t py-2.5 pr-2 pl-4">
          {/* Scrolls sideways when it doesn't fit, with the edge fade
              showing which way there's more. */}
          <code className="scroll-fade-x block min-w-0 flex-1 overflow-x-auto overflow-y-hidden font-mono text-[0.8125rem] whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-muted-foreground">$ </span>
            {head}
            <TextMorph
              value={item.slug}
              className="font-medium text-(--land-slug)"
            />
          </code>
          <CopyButton content={command} />
        </div>
      </div>
    </div>
  );
}
