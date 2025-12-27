import type { TOCItemType } from "fumadocs-core/toc";

// ============================================================================
// Configuration Constants
// ============================================================================

// Known constants from Tailwind v4 classes used in TOC items
// py-1.5 = 0.375rem = 6px (with first:pt-0, last:pb-0)
// text-sm = 0.875rem font-size with 1.25rem (20px) line-height
// py-4 on nav = 1rem = 16px top padding before first item
const ITEM_PADDING_Y = 6;
const ITEM_LINE_HEIGHT = 20;
const NAV_PADDING_TOP = 16;

export const CORNER_RADIUS = 4;
// Minimum x-offset ensures circle (6px with -translate-x-1/2) doesn't clip
export const MIN_X_OFFSET = 4;
// Animation duration in milliseconds
export const ANIMATION_DURATION = 150;

// Line offset for stepped mode (only 2 levels: depth 2 vs depth 3+)
// Value offset by 3px to maintain indent with MIN_X_OFFSET base position
export function getLineOffset(depth: number): number {
  return depth <= 2 ? 0 : 13;
}

// Text indentation based on heading depth
// Values offset by 3px to maintain gap with MIN_X_OFFSET track position
export function getItemOffset(depth: number): number {
  if (depth <= 2) return 15;
  if (depth === 3) return 27;
  return 39;
}

// Segment data for path tracing
export interface PathSegment {
  offset: number;
  top: number;
  bottom: number;
}

// SVG data returned by path computation
export interface TocSvgData {
  path: string;
  width: number;
  height: number;
  endX: number;
  endY: number;
  segments: PathSegment[];
}

/**
 * Build SVG path string from segments.
 * Uses quadratic bezier curves for smooth corners at depth changes.
 */
function buildSvgPath(segments: PathSegment[]): string {
  const d: string[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const prevSeg = segments[i - 1];
    const nextSeg = segments[i + 1];

    if (i === 0) {
      d.push(`M${seg.offset} ${seg.top}`);
    } else if (prevSeg && seg.offset !== prevSeg.offset) {
      d.push(
        `Q${seg.offset} ${seg.top},${seg.offset} ${seg.top + CORNER_RADIUS}`,
      );
    } else {
      d.push(`L${seg.offset} ${seg.top}`);
    }

    if (nextSeg && seg.offset !== nextSeg.offset) {
      const cornerBottom = seg.bottom;
      d.push(`L${seg.offset} ${cornerBottom - CORNER_RADIUS}`);
      const nextTop = nextSeg.top;
      const dx = nextSeg.offset - seg.offset;
      const dy = nextTop - cornerBottom;
      const diagLength = Math.sqrt(dx * dx + dy * dy);
      const ratio = Math.min(CORNER_RADIUS / diagLength, 0.5);
      const midX = seg.offset + dx * ratio;
      const midY = cornerBottom + dy * ratio;
      d.push(`Q${seg.offset} ${cornerBottom},${midX} ${midY}`);
      const endRatio = 1 - Math.min(CORNER_RADIUS / diagLength, 0.5);
      const endX = seg.offset + dx * endRatio;
      const endY = cornerBottom + dy * endRatio;
      d.push(`L${endX} ${endY}`);
    } else {
      d.push(`L${seg.offset} ${seg.bottom}`);
    }
  }

  return d.join(" ");
}

/**
 * Compute TOC SVG path data from TOC items without DOM access.
 * Uses known Tailwind values for predictable single-line text items.
 *
 * This enables server-side rendering of the track outline.
 */
export function computeTocSvgData(
  toc: TOCItemType[],
  stepped: boolean,
): TocSvgData | null {
  if (toc.length === 0) return null;

  const segments: PathSegment[] = [];
  let cumulativeY = NAV_PADDING_TOP;
  let w = 0;
  let h = 0;

  for (let i = 0; i < toc.length; i++) {
    const isFirst = i === 0;
    const isLast = i === toc.length - 1;

    // Calculate padding for this item (first:pt-0, last:pb-0)
    const paddingTop = isFirst ? 0 : ITEM_PADDING_Y;
    const paddingBottom = isLast ? 0 : ITEM_PADDING_Y;

    // Calculate x-offset based on depth
    const offset = stepped
      ? Math.max(MIN_X_OFFSET, getLineOffset(toc[i].depth) + 1)
      : MIN_X_OFFSET;

    // Calculate y-positions
    const top = cumulativeY + paddingTop;
    const contentHeight = ITEM_LINE_HEIGHT;
    const bottom = isLast
      ? cumulativeY + paddingTop + contentHeight / 2
      : cumulativeY + paddingTop + contentHeight;

    w = Math.max(offset, w);
    h = Math.max(h, bottom);
    segments.push({ offset, top, bottom });

    // Move to next item position
    cumulativeY += paddingTop + contentHeight + paddingBottom;
  }

  const path = buildSvgPath(segments);
  const lastSeg = segments[segments.length - 1];

  return {
    path,
    width: w + 1,
    height: h,
    endX: lastSeg?.offset ?? 1,
    endY: lastSeg?.bottom ?? h,
    segments,
  };
}

// ============================================================================
// DefaultTOC-specific computation (different offset values)
// ============================================================================

// DefaultTOC line offset for stepped mode
function getDefaultLineOffset(depth: number): number {
  return depth <= 2 ? 0 : 10;
}

// DefaultTOC SVG data (simpler - no segments/endX/endY needed)
export interface DefaultTocSvgData {
  path: string;
  width: number;
  height: number;
}

/**
 * Compute DefaultTOC SVG path data from TOC items without DOM access.
 * Uses DefaultTOC's specific offset values (different from FillTOC).
 *
 * This enables server-side rendering of the track outline.
 */
export function computeDefaultTocSvgData(
  toc: TOCItemType[],
  stepped: boolean,
): DefaultTocSvgData | null {
  if (toc.length === 0) return null;

  const segments: PathSegment[] = [];
  let cumulativeY = NAV_PADDING_TOP;
  let w = 0;
  let h = 0;

  for (let i = 0; i < toc.length; i++) {
    const isFirst = i === 0;
    const isLast = i === toc.length - 1;

    // Calculate padding for this item (first:pt-0, last:pb-0)
    const paddingTop = isFirst ? 0 : ITEM_PADDING_Y;
    const paddingBottom = isLast ? 0 : ITEM_PADDING_Y;

    // DefaultTOC offset: stepped ? getLineOffset(depth) + 1 : 1 (no MIN_X_OFFSET)
    const offset = stepped ? getDefaultLineOffset(toc[i].depth) + 1 : 1;

    // Calculate y-positions (track extends to bottom of content, not center for last)
    const top = cumulativeY + paddingTop;
    const contentHeight = ITEM_LINE_HEIGHT;
    const bottom = cumulativeY + paddingTop + contentHeight;

    w = Math.max(offset, w);
    h = Math.max(h, bottom);
    segments.push({ offset, top, bottom });

    // Move to next item position
    cumulativeY += paddingTop + contentHeight + paddingBottom;
  }

  const path = buildSvgPath(segments);

  return {
    path,
    width: w + 1,
    height: h,
  };
}
