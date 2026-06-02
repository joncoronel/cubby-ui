"use client";

import * as React from "react";
import { useAnimatedHeight } from "@/registry/default/hooks/use-animated-height";
import { cn } from "@/lib/utils";

type TransitionPanelInitialFocus =
  | boolean
  | React.RefObject<HTMLElement | null>;

type TransitionPanelProps = React.ComponentProps<"div"> & {
  /**
   * The viewKey of the currently visible view. Must match the `viewKey` of
   * one of the `<TransitionPanelView>` descendants.
   */
  activeKey: string;
  /**
   * Transition style. Defaults to "slide".
   *
   *  - `"slide"`: views slide horizontally and the transition is
   *    direction-aware (forward slides in from the right, back from the left).
   *  - `"fade"`: views crossfade with a subtle scale (`0.96 → 1`). The
   *    transition is non-directional and the opacity / scale duration adapts
   *    to the height change via `--tp-fade-duration` (override it for a fixed
   *    crossfade).
   */
  transition?: "slide" | "fade";
};

type TransitionPanelViewProps = React.ComponentProps<"div"> & {
  /**
   * Identifier matched against the parent's `activeKey` to determine which
   * view is visible.
   */
  viewKey: string;
  /**
   * What to focus when this view becomes active after a swap. Mirrors Base
   * UI's `initialFocus` convention so the API feels familiar.
   *
   *  - `true` (default): focus the first tabbable element inside the view
   *  - `false`: don't move focus
   *  - `RefObject<HTMLElement>`: focus that specific element
   *
   * Skipped on the initial render — the parent (popover / dialog / sheet /
   * page) owns first-mount focus via its own focus manager. Focus is
   * applied with `{ preventScroll: true }` so the entrance animation can
   * still translate the view in without the browser scroll-jumping to
   * follow the focused element.
   */
  initialFocus?: TransitionPanelInitialFocus;
};

const SLIDE_DISTANCE = "18%";

// Selector for elements that can hold focus. Mirrors Base UI's tabbable
// candidate set, minus the rarely-relevant `iframe`, `object`, `embed`,
// `details`, and `audio/video[controls]` cases — consumers in those niches
// should pass an explicit `initialFocus` ref. Includes `[contenteditable]`
// so rich-text editor surfaces (TipTap, Lexical, ProseMirror, etc.) are
// caught automatically, and excludes `input[type="hidden"]` since hidden
// inputs are never a focus target.
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

// ---------------------------------------------------------------------------
// Alternative implementation note (Motion / FLIP)
// ---------------------------------------------------------------------------
// The height animation here is D-tier in the render-pipeline classification
// (animates the real `height` CSS property → triggers layout per frame). The
// cost is negligible for the typical popover/panel use case: isolated subtree,
// brief interaction-driven transition, small content area.
//
// If a future consumer has a high-frequency or large-surface use case where
// S-tier (compositor-only) height animation matters, the Motion-based
// alternative looks like:
//
//   <motion.div layout>                  // parent: animates via transform:scale
//     {views.map(({ key, node }) => (
//       <motion.div key={key} layout="position">
//         {node}                          // layout="position" applies inverse
//       </motion.div>                     // scale so descendants don't warp
//     ))}
//   </motion.div>
//
// Trade-offs to consider before switching:
//   + S-tier height animation (composite-only, runs on the compositor thread).
//   − Adds ~25–30kb gzipped Motion dep to any consumer that doesn't already
//     use Motion. That's the main reason this primitive defaults to CSS.
//   − Every direct view wrapper needs `layout="position"`; miss one and the
//     parent's scale transform warps that subtree.
//   − Motion's FLIP measurement adds edge cases (rapid swaps, interrupted
//     transitions) that the CSS path avoids.
//
// Recommendation: keep CSS as the default for design-system reuse; switch to
// Motion in a fork or sibling component when there's actual measured need.

/**
 * Animated swap between N named views. Two transition styles:
 *
 *  - `transition="slide"` (default): direction-aware horizontal slide. Tracks
 *    the previous activeKey, compares its position in the view registry to the
 *    new one, and slides forward (entering from the right) or backward
 *    (entering from the left) accordingly.
 *  - `transition="fade"`: non-directional crossfade with a subtle scale
 *    (`0.96 → 1`). Opacity / scale ride `--tp-fade-duration`, which defaults
 *    to the size-adaptive `--fade-duration` so the fade speed tracks how much
 *    the height changed between views (override for a fixed crossfade).
 *
 * Pure CSS animation — no Motion. Uses `@starting-style` for the entry
 * keyframe, `transition-discrete` for the `display: block ↔ none` swap of
 * inactive views, and CSS custom properties for direction-aware slide
 * values. Height animates via `useAnimatedHeight` (ResizeObserver writes a
 * pixel height onto the outer container, CSS transitions it).
 *
 * Compound component pattern: state is shared with `TransitionPanelView`
 * via `TransitionPanelContext`. Each view renders its own DOM and reads
 * `activeKey`, the transition style, direction-aware CSS vars, and the
 * `mounted` gate from context. Views register themselves with the panel via the context's
 * `registerView` callback; the registry is the source of truth for view
 * order (used by direction calculation) and view DOM lookup (used by the
 * focus effect). On registration we re-derive order from DOM position, so
 * a view that unmounts and remounts (conditional rendering, Suspense,
 * lazy-loaded content) gets its source-order slot back instead of being
 * appended at the end of the Map.
 *
 * Composability: `TransitionPanelView` does not have to be a direct child
 * of `TransitionPanel`. Views can be wrapped in HOCs, fragments, error
 * boundaries, Suspense boundaries, or conditional/mapped renderings — all
 * routing through context.
 *
 * Inactive views are marked `inert` so focus can't land on hidden controls
 * during the swap's exit transition (display stays `block` for ~240ms while
 * the leaving view fades out under `transition-discrete`). Focus is moved
 * to the new view's target in `useLayoutEffect` so it happens before the
 * browser paints — minimizing the window where focus has been released by
 * the inert flip on the outgoing view but not yet moved to the incoming
 * one. Consumers can still opt out per-view via `initialFocus={false}`.
 *
 * Spread accepts any `<div>` prop (`id`, `role`, `aria-label`, `ref`,
 * `data-*`, etc.). The optional `ref` is composed with an internal ref
 * used for height measurement.
 *
 * Data attributes (Base UI conventions):
 *   - Root: `data-transition="slide" | "fade"`,
 *           `data-activation-direction="left" | "right" | "none"`
 *   - View: `data-active` (presence when active), `data-viewkey="..."`
 *
 * CSS custom properties (set on root, inherited by views). All overridable
 * per-instance via the `style` prop or per-app via a CSS rule:
 *   - `--tp-duration` (default `240ms`) — height transition duration, plus the
 *     slide / opacity transition duration in `slide` mode.
 *   - `--tp-fade-duration` — opacity / scale duration in `fade` mode. Defaults
 *     to the size-adaptive value the height observer writes to `--fade-duration`
 *     (falling back to `--tp-duration` before the first measure). Set it to a
 *     fixed value to opt out of the adaptive crossfade.
 *   - `--tp-ease` — easing for the height + slide transitions.
 *   - `--tp-fade-ease` — easing for the crossfade.
 *   (`--fade-duration` is the internal, observer-written source for the
 *   adaptive `--tp-fade-duration` default — don't set it directly.)
 *
 * Browser support: the entrance animation relies on `@starting-style` and
 * `transition-behavior: allow-discrete` (Chrome 117+, Safari 17.4+,
 * Firefox 129+). Older browsers degrade to an instant view swap with no
 * slide / fade animation — no broken state, just no motion.
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
  ref,
  className,
  style,
  children,
  ...rest
}: TransitionPanelProps) {
  const { outerRef, innerRef } = useAnimatedHeight();

  // Shadow the inner-div callback ref from useAnimatedHeight with a
  // RefObject we can read inside `registerView` (for the DOM-order rebuild).
  // The chained callback also forwards the node to useAnimatedHeight so its
  // ResizeObserver setup still runs.
  const innerDivRef = React.useRef<HTMLDivElement | null>(null);
  const setInnerRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      innerDivRef.current = node;
      innerRef(node);
    },
    [innerRef],
  );

  // Compose consumer `ref` with the internal `outerRef` used by
  // useAnimatedHeight (it reads `.current` inside its ResizeObserver
  // callback, so it needs a stable RefObject). Mutating `outerRef.current`
  // directly is safe — it's the same imperative pattern `useRef` uses
  // internally — and lets us forward the node to the consumer's ref shape
  // (callback or RefObject) without changing the hook's contract.
  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      outerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.RefObject<HTMLDivElement | null>).current = node;
      }
    },
    [outerRef, ref],
  );

  // View registry. The ref holds DOM elements + focus contracts (read
  // only inside effects, never during render). `orderedKeys` mirrors the
  // registry's key order as state, so render-time logic (direction calc,
  // dev warning) reads from state and not from the ref — keeping React
  // Compiler / react-hooks lint rules happy and reactivity correct.
  const viewsRef = React.useRef<Map<string, ViewEntry>>(new Map());
  const [orderedKeys, setOrderedKeys] = React.useState<string[]>([]);

  // On each registration we re-derive ordering from DOM position. Map
  // insertion order matches source order on the initial mount, but a view
  // that unmounts (e.g. {isPro && <TransitionPanelView ...>} toggled off)
  // and remounts later would otherwise reinsert at the end of the Map,
  // breaking direction calc. Querying `[data-viewkey]` returns elements in
  // document order, which is React's rendered source order regardless of
  // HOC / fragment / Suspense wrapping in between.
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
      // Layout effects run after the parent's DOM mutations (which set
      // innerDivRef.current), so this branch shouldn't fire in practice.
      // Fall back to plain insertion-order Map.set if it ever does.
      viewsRef.current.set(key, { el, initialFocus });
    }
    setOrderedKeys(Array.from(viewsRef.current.keys()));
    return () => {
      viewsRef.current.delete(key);
      setOrderedKeys((prev) => prev.filter((k) => k !== key));
    };
  }, []);

  // Track the previous active key for direction calculation. Render-time
  // conditional setter — React discards and retries the render when state
  // is updated during rendering, so the values read after the `if` block
  // reflect the new state in the committed render.
  const [previousKey, setPreviousKey] = React.useState(activeKey);
  const [renderedKey, setRenderedKey] = React.useState(activeKey);
  if (activeKey !== renderedKey) {
    setPreviousKey(renderedKey);
    setRenderedKey(activeKey);
  }

  // Direction calculation from registry order (not from React.Children, so
  // views can be wrapped / conditional / Suspense-gated). On the very first
  // render `orderedKeys` is empty because view layout effects haven't run
  // yet — both lookups miss and direction defaults to forward, but
  // `mounted` is also false on the first render so no slide animation
  // observes the placeholder value.
  const currentIdx = orderedKeys.indexOf(activeKey);
  const previousIdx = orderedKeys.indexOf(previousKey);
  const direction = currentIdx >= previousIdx ? 1 : -1;

  // True iff `activeKey` has differed from `previousKey` at least once.
  // Equal only on the initial render (both initialized from activeKey);
  // any subsequent transition (forward or back) flips this to true and
  // it stays true. Used to gate `data-activation-direction` so consumers
  // can distinguish "first paint, no animation yet" from a real swap.
  const hasActivated = activeKey !== previousKey;

  // Dev-only warning. Gated on `orderedKeys.length > 0` because the
  // registry is populated by view layout effects, which run after this
  // render's body on the initial mount.
  if (process.env.NODE_ENV !== "production") {
    if (orderedKeys.length > 0 && !orderedKeys.includes(activeKey)) {
      console.warn(
        `[TransitionPanel] activeKey="${activeKey}" doesn't match any ` +
          `registered TransitionPanelView viewKey. ` +
          `Registered: ${orderedKeys.join(", ")}.`,
      );
    }
  }

  // Skip `@starting-style` on first paint so the initially-active view
  // doesn't run an entrance animation on mount. Deferred via
  // `requestAnimationFrame` to guarantee the initial mounted-false render
  // has painted before the starting: classes are added — without the rAF,
  // mobile Chrome on Android appears to trigger `@starting-style` on the
  // active view anyway, sliding the popover content in from the right on
  // open.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Focus management for view swaps. Views stay mounted across swaps, so
  // the standard "autoFocus on mount" approach can't fire when a view
  // becomes active for the second time. We use `useLayoutEffect` (not
  // `useEffect`) so the focus call runs synchronously after commit but
  // before browser paint — keeping the gap between "outgoing view becomes
  // inert" and "incoming view receives focus" within a single frame.
  //
  // The parent (popover / dialog / sheet) owns first-render focus via its
  // own focus manager, so we skip the mount run via a one-shot flag. A
  // key-comparison gate (skip when activeKey equals its initial value)
  // would silently skip back-navigations to the initial view, breaking
  // focus on Back-button-style flows.
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
    // `preventScroll: true` avoids the browser scrolling the focused
    // element into view while the entrance animation is still translating
    // it back from its starting-style offset. Without this, focus during
    // the transition causes visible scroll-jank.
    target?.focus({ preventScroll: true });
  }, [activeKey]);

  // Direction-aware slide values, exposed via context to view children as
  // CSS custom properties. Tailwind's JIT sees the literal class names in
  // the view source (translate-x-(var(--tp-enter))); the var values change
  // per render based on direction. Only consumed in `slide` mode.
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
  // "left" | "right" | "none" (slide is horizontal-only). "none" before any
  // activation has happened — same convention Base UI uses for the
  // pre-interaction state. In `fade` mode the built-in animation is
  // non-directional, but this still reports the logical forward/back
  // direction for consumers who want to drive their own directional styling.
  const activationDirection: "left" | "right" | "none" = !hasActivated
    ? "none"
    : direction === 1
      ? "right"
      : "left";

  return (
    <div
      {...rest}
      ref={setRootRef}
      data-slot="transition-panel"
      data-transition={transition}
      data-activation-direction={activationDirection}
      style={
        {
          // Default duration for the height transition (on this element) and,
          // in `slide` mode, the slide/opacity transition on view wrappers
          // (which inherit the property). Consumer's inline style spreads
          // after, so any `--tp-duration` they set wins.
          "--tp-duration": "240ms",
          // Crossfade (`fade` mode) duration. Defaults to the size-adaptive
          // value the height observer writes to `--fade-duration`, falling
          // back to `--tp-duration` before the first measurement. Because the
          // consumer `style` spreads after, setting `--tp-fade-duration`
          // pins the crossfade to a fixed duration (the observer writes
          // `--fade-duration`, not this var, so it can't clobber an override).
          "--tp-fade-duration": "var(--fade-duration, var(--tp-duration))",
          // Easing for the height + slide transitions (`--tp-ease`) and the
          // crossfade (`--tp-fade-ease`). Both overridable via `style` / CSS.
          "--tp-ease": "cubic-bezier(0.32, 0.72, 0, 1)",
          "--tp-fade-ease": "cubic-bezier(0.26, 0.08, 0.25, 1)",
          // Bleed area for the overflow clip. Defaults to 0 because the
          // recommended composition puts internal padding inside each
          // view, so focus rings / shadows already render in safe
          // territory. Bump (e.g. "8px") when the panel is nested inside
          // a padded container where view content sits flush with the
          // panel's clip edge.
          "--tp-clip-margin": "0px",
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        // `overflow-clip` (not `overflow-hidden`) so the browser doesn't
        // treat this as a scrollable ancestor. `overflow: hidden` blocks
        // visible scrollbars but still allows *programmatic* scrolling,
        // which means `scrollIntoView` (fired when focus moves to a deep
        // descendant via label click etc.) will scroll this container,
        // shifting all content up and exposing any clipped bottom region.
        // `overflow: clip` makes the element a true non-scroll container.
        //
        // `overflow-clip-margin` gives the clip box a bleed area so
        // focus rings, drop shadows, and other decorations that extend
        // just outside an element's box can still render. Defaults to
        // 0 (see `--tp-clip-margin` above) because the recommended
        // composition keeps decoration-bearing elements inside view
        // padding, so they're already inside the clip box. Set it to a
        // few pixels when the panel is nested inside a padded container
        // where content sits flush with the clip edge.
        //
        // `contain-layout` scopes the height-driven layout work to this
        // subtree so the browser can skip recalculating surrounding layouts.
        // Side effect: this element becomes a containing block for `position:
        // fixed` / `absolute` descendants. Unlikely to matter for typical
        // panel content; flag if you put a viewport-positioned element here.
        "overflow-clip contain-layout [overflow-clip-margin:var(--tp-clip-margin)]",
        "transition-[height] duration-(--tp-duration) ease-(--tp-ease)",
        "motion-reduce:transition-none",
        className,
      )}
    >
      <div ref={setInnerRef} className="grid grid-cols-[minmax(0,1fr)]">
        <TransitionPanelContext value={contextValue}>
          {children}
        </TransitionPanelContext>
      </div>
    </div>
  );
}

TransitionPanel.displayName = "TransitionPanel";

function TransitionPanelView({
  viewKey,
  initialFocus = true,
  ref,
  className,
  style,
  children,
  ...rest
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
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  // Compose the consumer `ref` with the internal `wrapperRef` used by
  // `registerView`. Mirrors the pattern on `TransitionPanel` so callers
  // can attach observers or imperatively measure the view wrapper without
  // breaking the panel's own DOM reads.
  const setWrapperRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      wrapperRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.RefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref],
  );

  // useLayoutEffect (not useEffect) so registration happens before the
  // panel's own layout-effect-driven focus move. React runs layout effects
  // child-to-parent, so a view that mounts in the same render as an
  // activeKey change still gets registered in time for the focus lookup.
  React.useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    return registerView(viewKey, el, initialFocus);
  }, [viewKey, initialFocus, registerView]);

  return (
    <div
      {...rest}
      ref={setWrapperRef}
      aria-hidden={!isActive}
      inert={!isActive}
      data-slot="transition-panel-view"
      data-active={isActive ? "" : undefined}
      data-viewkey={viewKey}
      style={
        {
          // Consumer style spreads first so they can add their own
          // properties (padding, background, custom CSS vars). The
          // direction-aware slide vars override after — these are
          // panel-controlled and change every render, so a consumer
          // setting them would just break the slide animation. Unused in
          // `fade` mode (the className doesn't reference them there).
          ...style,
          "--tp-enter": enterFrom,
          "--tp-exit": exitTo,
        } as React.CSSProperties
      }
      className={cn(
        "[grid-area:1/1]",
        // Per-mode transition: `slide` translates on --tp-duration with
        // --tp-ease; `fade` scales + crossfades on --tp-fade-duration (which
        // defaults to the size-adaptive --fade-duration) with --tp-fade-ease.
        // All four vars are inherited from the root and overridable there.
        isFade
          ? "transition-[opacity,scale,display] duration-(--tp-fade-duration) ease-(--tp-fade-ease)"
          : "transition-[opacity,translate,display] duration-(--tp-duration) ease-(--tp-ease)",
        "transition-discrete",
        "motion-reduce:transition-none",
        mounted && "starting:opacity-0",
        mounted &&
          (isFade
            ? "starting:scale-[0.96]"
            : "starting:translate-x-(--tp-enter)"),
        isActive
          ? isFade
            ? "scale-100 opacity-100"
            : "translate-x-0 opacity-100"
          : cn(
              "pointer-events-none hidden opacity-0 contain-[size]",
              isFade ? "scale-[0.96]" : "translate-x-(--tp-exit)",
            ),
        className,
      )}
    >
      {children}
    </div>
  );
}

TransitionPanelView.displayName = "TransitionPanelView";

export { TransitionPanel, TransitionPanelView };
export type {
  TransitionPanelProps,
  TransitionPanelViewProps,
  TransitionPanelInitialFocus,
};
