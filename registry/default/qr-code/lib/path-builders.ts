/**
 * SVG path (`d` attribute) builders for QR modules and finder patterns.
 *
 * All coordinates are in module units. The same builders are used by the React
 * component and the standalone string serializer, so the rendered DOM and
 * `toSVGString()` output are identical.
 */

import type { QRDotStyle } from "./types";
import { cornerRadii } from "./rounded";

/** Corner radius (in module units) used by the rounded dot style. */
const DOT_RADIUS = 0.5;
/** Inscribed radius used by the circle dot style. */
const DOT_CIRCLE_RADIUS = 0.5;

/** Formats a number compactly: up to 4 decimals, no trailing zeros. */
function f(n: number): string {
  return Number(n.toFixed(4)).toString();
}

/** A full-cell square subpath at module (x, y), offset by `o`. */
function squareCell(x: number, y: number, o: number): string {
  const px = x + o;
  const py = y + o;
  return `M${f(px)} ${f(py)}h1v1h-1Z`;
}

/** A circle inscribed in the cell at module (x, y), offset by `o`. */
function circleCell(x: number, y: number, o: number): string {
  const cx = x + o + 0.5;
  const cy = y + o + 0.5;
  const r = DOT_CIRCLE_RADIUS;
  return `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(r * 2)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-r * 2)} 0Z`;
}

/** A snake-rounded subpath at module (x, y), offset by `o`. */
function roundedCell(
  modules: boolean[][],
  x: number,
  y: number,
  o: number,
): string {
  const r = DOT_RADIUS;
  const { topLeft, topRight, bottomRight, bottomLeft } = cornerRadii(modules, x, y);
  const px = x + o;
  const py = y + o;
  const x0 = px;
  const y0 = py;
  const x1 = px + 1;
  const y1 = py + 1;

  let d = `M${f(x0 + (topLeft ? r : 0))} ${f(y0)}`;
  d += `H${f(x1 - (topRight ? r : 0))}`;
  if (topRight) d += `A${f(r)} ${f(r)} 0 0 1 ${f(x1)} ${f(y0 + r)}`;
  d += `V${f(y1 - (bottomRight ? r : 0))}`;
  if (bottomRight) d += `A${f(r)} ${f(r)} 0 0 1 ${f(x1 - r)} ${f(y1)}`;
  d += `H${f(x0 + (bottomLeft ? r : 0))}`;
  if (bottomLeft) d += `A${f(r)} ${f(r)} 0 0 1 ${f(x0)} ${f(y1 - r)}`;
  d += `V${f(y0 + (topLeft ? r : 0))}`;
  if (topLeft) d += `A${f(r)} ${f(r)} 0 0 1 ${f(x0 + r)} ${f(y0)}`;
  d += "Z";
  return d;
}

/** Whether module (x, y) lies within one of the three finder pattern squares. */
export function isFinderModule(x: number, y: number, size: number): boolean {
  const inTopLeft = x <= 6 && y <= 6;
  const inTopRight = x >= size - 7 && y <= 6;
  const inBottomLeft = x <= 6 && y >= size - 7;
  return inTopLeft || inTopRight || inBottomLeft;
}

/**
 * Builds the merged data-module path for all dark modules, excluding the finder
 * patterns (which are rendered separately) and any cleared (knockout) modules.
 */
export function buildDataPath(
  modules: boolean[][],
  size: number,
  offset: number,
  style: QRDotStyle,
): string {
  let d = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!modules[y][x] || isFinderModule(x, y, size)) {
        continue;
      }
      if (style === "circle") {
        d += circleCell(x, y, offset);
      } else if (style === "rounded") {
        d += roundedCell(modules, x, y, offset);
      } else {
        d += squareCell(x, y, offset);
      }
    }
  }
  return d;
}

/** A rectangle subpath, wound clockwise or counter-clockwise. */
function rectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  clockwise: boolean,
): string {
  return clockwise
    ? `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`
    : `M${f(x)} ${f(y)}v${f(h)}h${f(w)}v${f(-h)}Z`;
}

/** A rounded-rectangle subpath, wound clockwise or counter-clockwise. */
function roundRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  clockwise: boolean,
): string {
  const r = Math.min(radius, w / 2, h / 2);
  if (clockwise) {
    return (
      `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}` +
      `V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}` +
      `H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}` +
      `V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`
    );
  }
  return (
    `M${f(x + r)} ${f(y)}A${f(r)} ${f(r)} 0 0 0 ${f(x)} ${f(y + r)}` +
    `V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 0 ${f(x + r)} ${f(y + h)}` +
    `H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 0 ${f(x + w)} ${f(y + h - r)}` +
    `V${f(y + r)}A${f(r)} ${f(r)} 0 0 0 ${f(x + w - r)} ${f(y)}Z`
  );
}

/** A ring (square with a concentric square hole) as an even-odd path. */
function ringPath(
  x: number,
  y: number,
  outer: number,
  thickness: number,
  style: QRDotStyle,
): string {
  const inner = outer - thickness * 2;
  const ix = x + thickness;
  const iy = y + thickness;
  if (style === "circle") {
    const oc = circleAt(x + outer / 2, y + outer / 2, outer / 2, true);
    const ic = circleAt(x + outer / 2, y + outer / 2, inner / 2, false);
    return oc + ic;
  }
  if (style === "rounded") {
    return (
      roundRectPath(x, y, outer, outer, outer / 3.5, true) +
      roundRectPath(ix, iy, inner, inner, inner / 3, false)
    );
  }
  return rectPath(x, y, outer, outer, true) + rectPath(ix, iy, inner, inner, false);
}

/** A circle path centered at (cx, cy), wound clockwise or counter-clockwise. */
function circleAt(cx: number, cy: number, r: number, clockwise: boolean): string {
  const sweep = clockwise ? 1 : 0;
  return (
    `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 ${sweep} ${f(r * 2)} 0` +
    `a${f(r)} ${f(r)} 0 1 ${sweep} ${f(-r * 2)} 0Z`
  );
}

/** A filled shape (eye) of the given style filling a `n×n` cell at (x, y). */
function fillShape(x: number, y: number, n: number, style: QRDotStyle): string {
  if (style === "circle") {
    return circleAt(x + n / 2, y + n / 2, n / 2, true);
  }
  if (style === "rounded") {
    return roundRectPath(x, y, n, n, n / 3, true);
  }
  return rectPath(x, y, n, n, true);
}

/** Top-left module coordinates of each finder's 7×7 square. */
export function finderOrigins(size: number): Array<[number, number]> {
  return [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ];
}

/** Builds the outer-ring path for a finder at origin (fx, fy), offset by `o`. */
export function buildFinderOuter(
  fx: number,
  fy: number,
  offset: number,
  style: QRDotStyle,
): string {
  return ringPath(fx + offset, fy + offset, 7, 1, style);
}

/** Builds the inner-eye path for a finder at origin (fx, fy), offset by `o`. */
export function buildFinderInner(
  fx: number,
  fy: number,
  offset: number,
  style: QRDotStyle,
): string {
  return fillShape(fx + offset + 2, fy + offset + 2, 3, style);
}
