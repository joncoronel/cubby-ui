"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useAnimatedHeight } from "@/registry/default/hooks/use-animated-height";
import { cn } from "@/lib/utils";

type TransitionPanelInitialFocus =
  | boolean
  | React.RefObject<HTMLElement | null>;

type TransitionPanelProps = useRender.ComponentProps<"div"> & {
  /** viewKey of the visible view. Must match a `<TransitionPanelView>` descendant. */
  activeKey: string;
  /**
   * Transition style (default `"slide"`):
   *  - `"slide"`: direction-aware horizontal slide (forward from the right,
   *    back from the left).
   *  - `"fade"`: non-directional crossfade with a subtle scale from `0.96` to
   *    `1`, duration adapting to the height change via `--tp-fade-duration`.
   */
  transition?: "slide" | "fade";
};

type TransitionPanelViewProps = useRender.ComponentProps<"div"> & {
  /** Matched against the parent's `activeKey` to determine visibility. */
  viewKey: string;
  /**
   * What to focus when this view becomes active after a swap (Base UI's
   * `initialFocus` convention):
   *  - `true` (default): first tabbable element inside the view
   *  - `false`: don't move focus
   *  - `RefObject<HTMLElement>`: that specific element
   *
   * Skipped on initial render (the parent owns first-mount focus).
   */
  initialFocus?: TransitionPanelInitialFocus;
};

const SLIDE_DISTANCE = "18%";

// Tabbable candidate set, mirroring Base UI. Skips niche cases (iframe, object,
// media with controls); pass an explicit `initialFocus` ref for those. Includes
// `[contenteditable]` for rich-text surfaces, and excludes hidden inputs.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"])';

type ViewEntry = {
  el: HTMLElement;
  initialFocus: TransitionPanelInitialFocus;
};

type TransitionPanelContextValue = {
  activeKey: string;
  transition: "slide" | "fade";
  enterFrom: string;
  exitTo: string;
  mounted: boolean;
  registerView: (
    key: string,
    el: HTMLElement,
    initialFocus: TransitionPanelInitialFocus,
  ) => () => void;
};

const TransitionPanelContext =
  React.createContext<TransitionPanelContextValue | null>(null);

// Does the browser defer `display: block` to `none` until the exit transition
// finishes (via `transition-behavior: allow-discrete`)? Chrome and Safari do.
// Firefox parses `allow-discrete` (it shows up in computed style) but still
// flips `display:none` instantly, killing the exit animation. There's no
// `@supports` query that catches this (Firefox claims support), so we sniff the
// UA. When this returns false the exit runs through a JS deferred-hide instead
// (see `TransitionPanelView`). Entering works everywhere regardless: it uses
// `@starting-style`, not the discrete exit.
function supportsDiscreteDisplayExit(): boolean {
  if (typeof navigator === "undefined") return true; // SSR: assume the CSS path
  return !/firefox/i.test(navigator.userAgent);
}

function useCssExitSupported(): boolean {
  // Start as `true` so SSR and the first client render agree (both take the CSS
  // path, and inactive views are `display:none` either way so nothing flashes).
  // Correct it after mount, which happens before any swap can fire.
  const [supported, setSupported] = React.useState(true);
  React.useEffect(() => {
    setSupported(supportsDiscreteDisplayExit());
  }, []);
  return supported;
}

// Why CSS instead of Motion: the height animation drives the real `height`
// property (layout per frame), which is fine for the typical isolated, brief,
// small-area panel swap. A Motion `layout` approach animates via transform
// (compositor only) but adds ~25-30kb to every consumer plus FLIP edge cases on
// rapid swaps. Not worth it as a design-system default. Reach for Motion in a
// fork if a high-frequency or large-surface case ever proves it's needed.

/**
 * Animated swap between N named views, in two styles: `slide` (default,
 * direction-aware horizontal slide) and `fade` (non-directional crossfade with
 * a subtle scale from `0.96` to `1`). Pure CSS, no Motion: `@starting-style`,
 * `transition-discrete` for the `display` swap, and CSS custom properties.
 * Height animates via `useAnimatedHeight`, gated to swaps only so content that
 * animates its own height isn't fought by a competing tween.
 *
 * Compound component: `TransitionPanelView` children share state through
 * `TransitionPanelContext` and register themselves via `registerView`. Views
 * needn't be direct children. HOCs, fragments, Suspense, and conditional or
 * mapped renderings all route through context, and registration re-derives view
 * order from DOM position so a remounted view keeps its source-order slot.
 *
 * Both `TransitionPanel` and `TransitionPanelView` accept any `<div>` prop, a
 * composed `ref`, and a Base UI `render` prop (e.g. render a view as a `Card`).
 *
 * Data attributes (Base UI conventions):
 *   - Root: `data-transition="slide" | "fade"`,
 *           `data-activation-direction="left" | "right" | "none"`
 *   - View: `data-active` (presence when active), `data-viewkey="..."`
 *
 * CSS custom properties (set on root, inherited by views; overridable via the
 * `style` prop or a CSS rule):
 *   - `--tp-duration` (default `240ms`): height plus slide/opacity duration.
 *   - `--tp-fade-duration`: crossfade duration in `fade` mode. Defaults to the
 *     size-adaptive `--fade-duration` the height observer writes; set a fixed
 *     value to opt out of the adaptive crossfade. (Don't set `--fade-duration`
 *     yourself, it's the observer-written source for this default.)
 *   - `--tp-ease` / `--tp-fade-ease`: easing for height/slide and crossfade.
 *
 * Browser support: the entrance animation needs `@starting-style` (Chrome 117+,
 * Safari 17.4+, Firefox 129+); older browsers degrade to an instant, motionless
 * swap. The exit defers `display:none` via `transition-behavior: allow-discrete`
 * where the browser supports it (Chrome/Safari). Firefox doesn't defer it on the
 * way out, so there the exit falls back to a JS-deferred hide (see
 * `TransitionPanelView`). That keeps the exit animation in every engine while
 * Chrome/Safari stay pure-CSS at runtime.
 *
 * Usage:
 * ```tsx
 * <TransitionPanel activeKey={step} transition="fade">
 *   <TransitionPanelView viewKey="list">...</TransitionPanelView>
 *   <TransitionPanelView viewKey="create">...</TransitionPanelView>
 * </TransitionPanel>
 * ```
 */
function TransitionPanel({
  activeKey,
  transition = "slide",
  render,
  className,
  style,
  children,
  ...props
}: TransitionPanelProps) {
  const { outerRef, innerRef } = useAnimatedHeight();

  // Shadow useAnimatedHeight's inner callback ref with a RefObject we can read
  // in `registerView` (for the DOM-order rebuild), still forwarding the node on.
  const innerDivRef = React.useRef<HTMLDivElement | null>(null);
  const setInnerRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      innerDivRef.current = node;
      innerRef(node);
    },
    [innerRef],
  );

  // View registry: the ref holds DOM elements + focus contracts (read only in
  // effects), while `orderedKeys` mirrors key order as state so render-time
  // logic (direction calc, dev warning) stays reactive and lint-clean.
  const viewsRef = React.useRef<Map<string, ViewEntry>>(new Map());
  const [orderedKeys, setOrderedKeys] = React.useState<string[]>([]);

  // Re-derive ordering from DOM position on each registration. A view that
  // unmounts and remounts would otherwise reinsert at the end of the Map and
  // break direction calc; `[data-viewkey]` in document order is React's source
  // order regardless of HOC / fragment / Suspense wrapping.
  const registerView = React.useCallback<
    TransitionPanelContextValue["registerView"]
  >((key, el, initialFocus) => {
    const inner = innerDivRef.current;
    if (inner) {
      const wrappers = Array.from(
        inner.querySelectorAll<HTMLElement>("[data-viewkey]"),
      );
      const next = new Map<string, ViewEntry>();
      for (const node of wrappers) {
        const k = node.dataset.viewkey;
        if (!k) continue;
        if (k === key) {
          next.set(k, { el, initialFocus });
        } else {
          const existing = viewsRef.current.get(k);
          if (existing) next.set(k, existing);
        }
      }
      viewsRef.current = next;
    } else {
      // innerDivRef is set before view layout effects run, so this shouldn't
      // fire in practice; fall back to insertion-order Map.set if it does.
      viewsRef.current.set(key, { el, initialFocus });
    }
    setOrderedKeys(Array.from(viewsRef.current.keys()));
    return () => {
      viewsRef.current.delete(key);
      setOrderedKeys((prev) => prev.filter((k) => k !== key));
    };
  }, []);

  // Track the previous active key for direction calc. Render-time conditional
  // setters below are safe: React discards and retries the render, so values
  // read after the `if` reflect the committed state.
  const [previousKey, setPreviousKey] = React.useState(activeKey);
  const [renderedKey, setRenderedKey] = React.useState(activeKey);

  // Gate the height transition to swaps only. The observer fires on *any*
  // content size change, and animating height here would fight a tween the
  // content is already running. Outside a swap, height writes apply instantly
  // so the panel tracks self-animating content frame-for-frame. Set on swap,
  // cleared by the root's own height `transitionend` (see `onTransitionEnd`) so
  // it honors any `--tp-duration` override; a same-height swap leaves it set
  // until the next height change, which is harmless.
  const [isSwapping, setIsSwapping] = React.useState(false);
  if (activeKey !== renderedKey) {
    setPreviousKey(renderedKey);
    setRenderedKey(activeKey);
    setIsSwapping(true);
  }

  // Direction from registry order (not React.Children, so views can be wrapped
  // / conditional / Suspense-gated). On first render `orderedKeys` is empty and
  // direction defaults to forward, but `mounted` is also false then so no slide
  // observes the placeholder.
  const currentIdx = orderedKeys.indexOf(activeKey);
  const previousIdx = orderedKeys.indexOf(previousKey);
  const direction = currentIdx >= previousIdx ? 1 : -1;

  // False only on initial render (both keys start equal); the first swap flips
  // it permanently. Gates `data-activation-direction` so consumers can tell
  // "first paint" from a real swap.
  const hasActivated = activeKey !== previousKey;

  // Dev warning, gated on a populated registry (view layout effects run after
  // this render's body on the initial mount).
  if (process.env.NODE_ENV !== "production") {
    if (orderedKeys.length > 0 && !orderedKeys.includes(activeKey)) {
      console.warn(
        `[TransitionPanel] activeKey="${activeKey}" doesn't match any ` +
          `registered TransitionPanelView viewKey. ` +
          `Registered: ${orderedKeys.join(", ")}.`,
      );
    }
  }

  // Skip `@starting-style` on first paint so the initial view doesn't animate
  // in on mount. The `requestAnimationFrame` defer is required: without it,
  // mobile Chrome still triggers `@starting-style` and slides the content in.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Focus management for swaps. Views stay mounted, so "autoFocus on mount"
  // can't fire on re-activation. `useLayoutEffect` (not `useEffect`) runs the
  // focus move before paint, keeping the inert-flip-to-refocus gap within a
  // frame. The one-shot mount flag skips first render (the parent owns initial
  // focus); a key-comparison gate would instead break back-navigation focus.
  const hasMountedRef = React.useRef(false);
  React.useLayoutEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    const entry = viewsRef.current.get(activeKey);
    if (!entry || entry.initialFocus === false) return;
    const target =
      entry.initialFocus === true
        ? entry.el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
        : entry.initialFocus.current;
    // `preventScroll` avoids scroll-jank from the browser chasing the focused
    // element while the entrance animation is still translating it in.
    target?.focus({ preventScroll: true });
  }, [activeKey]);

  // Direction-aware slide offsets, passed to views via context as CSS vars
  // (the class names are literal in the view source; only the values change).
  // Consumed in `slide` mode only.
  const enterFrom = direction === 1 ? SLIDE_DISTANCE : `-${SLIDE_DISTANCE}`;
  const exitTo = direction === 1 ? `-${SLIDE_DISTANCE}` : SLIDE_DISTANCE;

  const contextValue = React.useMemo<TransitionPanelContextValue>(
    () => ({
      activeKey,
      transition,
      enterFrom,
      exitTo,
      mounted,
      registerView,
    }),
    [activeKey, transition, enterFrom, exitTo, mounted, registerView],
  );

  // `data-activation-direction` matches Base UI's Tabs.Panel vocabulary:
  // "left" | "right" | "none" (slide is horizontal-only; "none" pre-activation).
  // Reported in `fade` mode too, for consumers driving their own directional
  // styling even though the built-in fade is non-directional.
  const activationDirection: "left" | "right" | "none" = !hasActivated
    ? "none"
    : direction === 1
      ? "right"
      : "left";

  const defaultProps = {
    "data-slot": "transition-panel",
    "data-transition": transition,
    "data-activation-direction": activationDirection,
    onTransitionEnd: (event: React.TransitionEvent<HTMLDivElement>) => {
      // Clear the swap flag when the root's own height transition finishes.
      // `target === currentTarget` ignores transitions bubbling up from views.
      if (
        event.target === event.currentTarget &&
        event.propertyName === "height"
      ) {
        setIsSwapping(false);
      }
    },
    // Defaults for the inherited CSS vars. Consumer `style` spreads after, so
    // any override wins. `--tp-fade-duration` falls back to the observer-written
    // `--fade-duration` (adaptive crossfade) until overridden to a fixed value;
    // `--tp-clip-margin` is the overflow-clip bleed (0 by default; bump it when
    // view content sits flush with a padded container's edge).
    style: {
      "--tp-duration": "240ms",
      "--tp-fade-duration": "var(--fade-duration, var(--tp-duration))",
      "--tp-ease": "cubic-bezier(0.32, 0.72, 0, 1)",
      "--tp-fade-ease": "cubic-bezier(0.26, 0.08, 0.25, 1)",
      "--tp-clip-margin": "0px",
      ...style,
    } as React.CSSProperties,
    className: cn(
      // `overflow-clip` (not `-hidden`): hidden still permits programmatic
      // `scrollIntoView` (e.g. focusing a deep descendant), which would scroll
      // this container and expose the clipped region; clip is a true non-scroll
      // container. `overflow-clip-margin` adds a bleed for focus rings / shadows
      // (see `--tp-clip-margin`). `contain-layout` scopes the height-driven
      // layout work here. Side effect: it becomes a containing block for
      // fixed/absolute descendants (flag if you position one inside).
      "overflow-clip contain-layout [overflow-clip-margin:var(--tp-clip-margin)]",
      // Only animate height while swapping (see `isSwapping` above).
      isSwapping &&
        "transition-[height] duration-(--tp-duration) ease-(--tp-ease)",
      "motion-reduce:transition-none",
      className,
    ),
    children: (
      <div ref={setInnerRef} className="grid grid-cols-[minmax(0,1fr)]">
        <TransitionPanelContext value={contextValue}>
          {children}
        </TransitionPanelContext>
      </div>
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    ref: outerRef,
    props: mergeProps<"div">(defaultProps, props),
  });
}

TransitionPanel.displayName = "TransitionPanel";

function TransitionPanelView({
  viewKey,
  initialFocus = true,
  render,
  className,
  style,
  children,
  ...props
}: TransitionPanelViewProps) {
  const ctx = React.use(TransitionPanelContext);
  if (!ctx) {
    throw new Error(
      "TransitionPanelView must be rendered inside a TransitionPanel.",
    );
  }
  const { activeKey, transition, enterFrom, exitTo, mounted, registerView } =
    ctx;
  const isActive = viewKey === activeKey;
  const isFade = transition === "fade";
  const cssExit = useCssExitSupported();
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  // useLayoutEffect (not useEffect), plus child-to-parent ordering, makes a
  // view register before the panel's focus move reads the registry, even
  // when it mounts in the same render as the activeKey change.
  React.useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    return registerView(viewKey, el, initialFocus);
  }, [viewKey, initialFocus, registerView]);

  // JS-path exit hide (Firefox only; no-ops on the CSS path, see
  // `supportsDiscreteDisplayExit`). Lets the leaving view animate out as
  // `block`, then sets `display:none` once its transitions finish. We wait on
  // the Web Animations API (`el.getAnimations()`, then each `.finished`), like
  // Base UI's `useAnimationsFinished`: it covers every animated property at
  // once, is exact (no duration math), resolves right away under reduced motion,
  // and re-checks on abort so an interrupted swap waits for whatever replaced it.
  const [hidden, setHidden] = React.useState(!isActive);
  React.useEffect(() => {
    if (cssExit) return;
    if (isActive) {
      setHidden(false);
      return;
    }
    if (hidden) return;
    const el = wrapperRef.current;
    if (!el || typeof el.getAnimations !== "function") {
      setHidden(true);
      return;
    }
    let cancelled = false;
    const waitForExit = () => {
      Promise.all(el.getAnimations().map((animation) => animation.finished))
        .then(() => {
          if (!cancelled) setHidden(true);
        })
        .catch(() => {
          // A transition was aborted (e.g. an interrupted swap replaced it).
          // Wait for whatever is running now; if nothing is, just hide.
          if (cancelled) return;
          if (el.getAnimations().length > 0) waitForExit();
          else setHidden(true);
        });
    };
    // Defer a frame so the exit transition is registered before we read it.
    const id = requestAnimationFrame(waitForExit);
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [cssExit, isActive, hidden]);

  const defaultProps = {
    "aria-hidden": !isActive,
    inert: !isActive,
    "data-slot": "transition-panel-view",
    "data-active": isActive ? "" : undefined,
    "data-viewkey": viewKey,
    style: {
      // Consumer style spreads first; the panel-controlled slide vars override
      // after (they change every render, so a consumer value would just break
      // the slide). Unused in `fade` mode.
      ...style,
      "--tp-enter": enterFrom,
      "--tp-exit": exitTo,
    } as React.CSSProperties,
    className: cn(
      "[grid-area:1/1]",
      // Transitioned properties. `slide` translates on --tp-duration/--tp-ease;
      // `fade` scales + crossfades on --tp-fade-duration/--tp-fade-ease. `display`
      // is included only on the CSS-exit path (the JS path hides via the effect
      // above).
      isFade
        ? cssExit
          ? "transition-[opacity,scale,display]"
          : "transition-[opacity,scale]"
        : cssExit
          ? "transition-[opacity,translate,display]"
          : "transition-[opacity,translate]",
      isFade
        ? "duration-(--tp-fade-duration) ease-(--tp-fade-ease)"
        : "duration-(--tp-duration) ease-(--tp-ease)",
      cssExit && "transition-discrete",
      "motion-reduce:transition-none",
      mounted && "starting:opacity-0",
      // Slide sets the `translate` property *directly* rather than via Tailwind's
      // `translate-x-*` (which routes through the `@property`-registered var
      // `--tw-translate-x`). WebKit drops an `@starting-style` value on a
      // registered custom property when it's a `var()` reference, falling back to
      // the registered `initial-value: 0`. So `--tw-translate-x: var(--tp-enter)`
      // collapses to 0 and the entering view jumps in with no slide (only the
      // crossfade survives). Chrome resolves it fine. Setting `translate` directly
      // bypasses the registered var. Fade's `scale-*` is a literal, so it's safe.
      mounted &&
        (isFade ? "starting:scale-[0.96]" : "starting:[translate:var(--tp-enter)_0]"),
      isActive
        ? isFade
          ? "scale-100 opacity-100"
          : "[translate:0_0] opacity-100"
        : cn(
            "pointer-events-none opacity-0 contain-[size]",
            isFade ? "scale-[0.96]" : "[translate:var(--tp-exit)_0]",
            // CSS path hides now (`allow-discrete` defers the real
            // `display:none`); JS path waits for the deferred-hide effect above.
            (cssExit || hidden) && "hidden",
          ),
      className,
    ),
    children,
  };

  return useRender({
    defaultTagName: "div",
    render,
    ref: wrapperRef,
    props: mergeProps<"div">(defaultProps, props),
  });
}

TransitionPanelView.displayName = "TransitionPanelView";

export { TransitionPanel, TransitionPanelView };
export type {
  TransitionPanelProps,
  TransitionPanelViewProps,
  TransitionPanelInitialFocus,
};
