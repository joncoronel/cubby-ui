/**
 * The single source of truth for QR SVG geometry.
 *
 * `buildRenderModel` resolves all render options into a plain data structure of
 * path strings and colors. The React component renders this model as JSX while
 * `buildQRCodeSVG` serializes the same model to a string, guaranteeing the
 * on-screen output and `toSVGString()` are identical.
 */

import type {
  ECLevel,
  QRMatrix,
  QRRenderOptions,
  QRDotStyle,
  QRFinderStyle,
  QRFinderTuple,
} from "./types";
import {
  buildDataPath,
  buildFinderOuter,
  buildFinderInner,
  finderOrigins,
} from "./path-builders";

const DEFAULT_MARGIN = 4;
const DEFAULT_FOREGROUND = "currentColor";
const DEFAULT_DOT_STYLE: QRDotStyle = "square";
const DEFAULT_LOGO_SIZE = 0.22;
const MAX_LOGO_SIZE = 0.3;
const DEFAULT_LOGO_PADDING = 1;
/** Corner ids in `finderOrigins` order: top-left, top-right, bottom-left. */
const FINDER_IDS = ["tl", "tr", "bl"] as const;

/** A resolved finder pattern: outer ring and inner eye, with paths and colors. */
export interface FinderRender {
  /** Corner identity (top-left, top-right, bottom-left) — a stable React key. */
  id: "tl" | "tr" | "bl";
  outerPath: string;
  outerColor: string;
  innerPath: string;
  innerColor: string;
}

/** A rectangle in viewBox units. */
export interface KnockoutRect {
  x: number;
  y: number;
  size: number;
  color: string;
}

/** An embedded image logo in viewBox units. */
export interface ImageRender {
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
  alt?: string;
}

/** Fully resolved geometry + colors ready to render or serialize. */
export interface QRRenderModel {
  /** Number of modules per side. */
  moduleCount: number;
  /** ViewBox side length (`moduleCount + 2 * margin`). */
  viewBox: number;
  margin: number;
  foreground: string;
  background?: string;
  dataPath: string;
  finders: FinderRender[];
  knockout?: KnockoutRect;
  image?: ImageRender;
  /** Accessible name, rendered as an SVG `<title>`. */
  title?: string;
  /** Whether every shape is axis-aligned (enables `crispEdges` rendering). */
  crisp: boolean;
}

const EC_RANK: Record<ECLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };

/**
 * Resolves the effective error correction level. When a logo is present and the
 * caller has not explicitly requested at least `"Q"`, the level is raised to
 * `"H"` so the symbol stays scannable despite the cleared center.
 */
export function resolveEcLevel(
  ecLevel: ECLevel | undefined,
  hasLogo: boolean,
): ECLevel {
  if (hasLogo && (ecLevel === undefined || EC_RANK[ecLevel] < EC_RANK.Q)) {
    return "H";
  }
  return ecLevel ?? "M";
}

function normalizeFinders(
  finder: QRFinderStyle | QRFinderTuple | undefined,
): QRFinderTuple {
  if (Array.isArray(finder)) {
    return finder;
  }
  const single = finder ?? {};
  return [single, single, single];
}

function resolveFinder(
  style: QRFinderStyle,
  dotStyle: QRDotStyle,
  foreground: string,
): { outerStyle: QRDotStyle; outerColor: string; innerStyle: QRDotStyle; innerColor: string } {
  const outerStyle = style.outerStyle ?? dotStyle;
  const outerColor = style.outerColor ?? foreground;
  return {
    outerStyle,
    outerColor,
    innerStyle: style.innerStyle ?? outerStyle,
    innerColor: style.innerColor ?? outerColor,
  };
}

/** Resolves render options against an encoded matrix into a {@link QRRenderModel}. */
export function buildRenderModel(
  matrix: QRMatrix,
  options: QRRenderOptions = {},
): QRRenderModel {
  const margin = Math.max(0, options.margin ?? DEFAULT_MARGIN);
  const foreground = options.foreground ?? DEFAULT_FOREGROUND;
  const background =
    options.background && options.background !== "transparent"
      ? options.background
      : undefined;
  const dotStyle = options.dotStyle ?? DEFAULT_DOT_STYLE;
  const moduleCount = matrix.size;
  const viewBox = moduleCount + margin * 2;

  // Clone the matrix so logo knockout does not mutate the caller's data.
  const modules = matrix.modules.map((row) => row.slice());

  let knockout: KnockoutRect | undefined;
  let image: ImageRender | undefined;
  if (options.logo) {
    const logoSize = Math.min(MAX_LOGO_SIZE, Math.max(0, options.logoSize ?? DEFAULT_LOGO_SIZE));
    const padding = Math.max(0, options.logoPadding ?? DEFAULT_LOGO_PADDING);
    const imageModules = moduleCount * logoSize;
    const knockModules = imageModules + padding * 2;
    const center = moduleCount / 2;

    // Clear modules whose centers fall inside the knockout box.
    const half = knockModules / 2;
    const lo = center - half;
    const hi = center + half;
    for (let y = 0; y < moduleCount; y++) {
      for (let x = 0; x < moduleCount; x++) {
        const cx = x + 0.5;
        const cy = y + 0.5;
        if (cx >= lo && cx <= hi && cy >= lo && cy <= hi) {
          modules[y][x] = false;
        }
      }
    }

    knockout = {
      x: margin + center - half,
      y: margin + center - half,
      size: knockModules,
      color: background ?? "#ffffff",
    };

    const w = options.logo.width ?? imageModules;
    const h = options.logo.height ?? imageModules;
    image = {
      href: options.logo.src,
      x: margin + center - w / 2,
      y: margin + center - h / 2,
      width: w,
      height: h,
      alt: options.logo.alt,
    };
  }

  const dataPath = buildDataPath(modules, moduleCount, margin, dotStyle);

  const finderStyles = normalizeFinders(options.finder);
  const origins = finderOrigins(moduleCount);
  let crisp = dotStyle === "square";
  const finders: FinderRender[] = origins.map(([fx, fy], i) => {
    const resolved = resolveFinder(finderStyles[i] ?? {}, dotStyle, foreground);
    if (resolved.outerStyle !== "square" || resolved.innerStyle !== "square") {
      crisp = false;
    }
    return {
      id: FINDER_IDS[i],
      outerPath: buildFinderOuter(fx, fy, margin, resolved.outerStyle),
      outerColor: resolved.outerColor,
      innerPath: buildFinderInner(fx, fy, margin, resolved.innerStyle),
      innerColor: resolved.innerColor,
    };
  });

  return {
    moduleCount,
    viewBox,
    margin,
    foreground,
    background,
    dataPath,
    finders,
    knockout,
    image,
    title: options.title,
    crisp,
  };
}

/** Escapes a string for safe use inside a double-quoted SVG attribute. */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Serializes a {@link QRRenderModel} to an SVG string. */
export function serializeModel(
  model: QRRenderModel,
  size?: number | string,
): string {
  const vb = model.viewBox;
  const dimension =
    size === undefined
      ? ""
      : ` width="${escapeAttr(String(size))}" height="${escapeAttr(String(size))}"`;

  const shapeRendering = model.crisp ? ` shape-rendering="crispEdges"` : "";
  let svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}"${dimension}${shapeRendering} role="img">`;

  if (model.title) {
    svg += `<title>${escapeAttr(model.title)}</title>`;
  }
  if (model.background) {
    svg += `<rect width="${vb}" height="${vb}" fill="${escapeAttr(model.background)}"/>`;
  }
  if (model.dataPath) {
    svg += `<path d="${model.dataPath}" fill="${escapeAttr(model.foreground)}"/>`;
  }
  for (const finder of model.finders) {
    svg += `<path d="${finder.outerPath}" fill="${escapeAttr(finder.outerColor)}" fill-rule="evenodd"/>`;
    svg += `<path d="${finder.innerPath}" fill="${escapeAttr(finder.innerColor)}"/>`;
  }
  if (model.knockout) {
    const k = model.knockout;
    svg += `<rect x="${k.x}" y="${k.y}" width="${k.size}" height="${k.size}" fill="${escapeAttr(k.color)}"/>`;
  }
  // Element logos carry no `href` (they render as a live <foreignObject> and
  // can't be serialized), so skip emitting an empty <image> on export.
  if (model.image && model.image.href) {
    const img = model.image;
    const alt = img.alt ? ` aria-label="${escapeAttr(img.alt)}"` : "";
    svg +=
      `<image href="${escapeAttr(img.href)}" x="${img.x}" y="${img.y}" ` +
      `width="${img.width}" height="${img.height}" preserveAspectRatio="xMidYMid meet"${alt}/>`;
  }
  svg += "</svg>";
  return svg;
}

/** Builds a complete SVG string for an encoded matrix. */
export function buildQRCodeSVG(
  matrix: QRMatrix,
  options: QRRenderOptions = {},
  size?: number | string,
): string {
  return serializeModel(buildRenderModel(matrix, options), size);
}
