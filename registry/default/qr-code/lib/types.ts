/**
 * Shared types for the QR code encoder and SVG renderer.
 *
 * Pure type declarations only — this file has zero runtime cost and is safe to
 * import from both server and client code.
 */

import type * as React from "react";

/** Error correction level, in ascending order of recovery capacity. */
export type ECLevel = "L" | "M" | "Q" | "H";

/** Supported encoding modes. Kanji is intentionally not implemented. */
export type QRMode = "numeric" | "alphanumeric" | "byte";

/** Options accepted by {@link encode}. */
export interface EncodeOptions {
  /** Error correction level. Defaults to `"M"`. */
  ecLevel?: ECLevel;
  /** Smallest version (1–40) to consider. Defaults to `1`. */
  minVersion?: number;
  /** Largest version (1–40) to consider. Defaults to `40`. */
  maxVersion?: number;
  /**
   * Force a specific mode. `"auto"` (the default) selects the most compact
   * mode that can represent the input.
   */
  mode?: QRMode | "auto";
  /**
   * When `true` (the default), the error correction level is silently upgraded
   * to the highest level the chosen version can hold for free.
   */
  boostEcl?: boolean;
}

/** A fully encoded QR symbol: a square grid of dark/light modules. */
export interface QRMatrix {
  /** Number of modules per side (`17 + 4 * version`). */
  size: number;
  /** Row-major grid; `modules[y][x] === true` means a dark module. */
  modules: boolean[][];
  /** The version (1–40) that was selected. */
  version: number;
  /** The error correction level actually used (may be boosted). */
  ecLevel: ECLevel;
  /** The mode actually used to encode the data. */
  mode: QRMode;
  /** The mask pattern (0–7) chosen during encoding. */
  maskPattern: number;
}

/** Visual style of a single module / dot. */
export type QRDotStyle = "square" | "circle" | "rounded";

/**
 * Independent styling for a finder pattern ("eye"). A finder has an outer 7×7
 * ring and an inner 3×3 eye that can be styled and colored separately.
 */
export interface QRFinderStyle {
  /** Style of the outer ring. Falls back to the component's `dotStyle`. */
  outerStyle?: QRDotStyle;
  /** Color of the outer ring. Falls back to `foreground`. */
  outerColor?: string;
  /** Style of the inner eye. Falls back to `outerStyle`. */
  innerStyle?: QRDotStyle;
  /** Color of the inner eye. Falls back to `outerColor` / `foreground`. */
  innerColor?: string;
}

/** A logo described by an image source rather than a React element. */
export interface QRLogoObject {
  /** Image URL or data URI. */
  src: string;
  /** Logo width, in module units. */
  width?: number;
  /** Logo height, in module units. */
  height?: number;
  /** Alternative text for the embedded image. */
  alt?: string;
}

/** The three finder patterns, ordered top-left, top-right, bottom-left. */
export type QRFinderTuple = [QRFinderStyle, QRFinderStyle, QRFinderStyle];

/** Render options shared by the component and the standalone SVG builders. */
export interface QRRenderOptions {
  ecLevel?: ECLevel;
  dotStyle?: QRDotStyle;
  /** Quiet-zone width, in modules. Defaults to `4`. */
  margin?: number;
  /** Foreground (dark module) color. Defaults to `"currentColor"`. */
  foreground?: string;
  /** Background color. Defaults to `"transparent"`. */
  background?: string;
  /** Unified or per-corner finder styling. */
  finder?: QRFinderStyle | QRFinderTuple;
  /** Fraction of the symbol width occupied by the logo (clamped to ≤ 0.3). */
  logoSize?: number;
  /** Quiet area, in modules, knocked out around the logo. Defaults to `1`. */
  logoPadding?: number;
  /** Logo image; only `QRLogoObject` logos are serialized by the SVG builder. */
  logo?: QRLogoObject;
  /** Minimum QR version. */
  minVersion?: number;
}

/** Options for the standalone {@link toSVGString} / {@link toDataURL} helpers. */
export interface QRExportOptions extends QRRenderOptions {
  /** The data to encode. */
  value: string;
  /** Rendered size, in pixels (used as the SVG `width`/`height`). */
  size?: number;
}

/** Output format for {@link toDataURL}. */
export type QRDataURLType = "png" | "jpeg" | "svg";

/** Options for {@link toDataURL}. */
export interface QRDataURLOptions extends Partial<QRExportOptions> {
  /** Output format. Defaults to `"png"`. */
  type?: QRDataURLType;
  /** JPEG quality (0–1). Ignored for other formats. */
  quality?: number;
  /** Output raster size per side, in pixels. Defaults to `1024`. */
  pixelSize?: number;
}

/** Imperative handle exposed by the `<QRCode>` ref. */
export interface QRCodeHandle {
  /** Returns the rendered SVG as a string (SSR-safe). */
  toSVGString: () => string;
  /** Returns a data URL for the rendered code (PNG/JPEG via canvas, or SVG). */
  toDataURL: (options?: QRDataURLOptions) => Promise<string>;
  /** Returns the underlying encoded matrix. */
  getMatrix: () => QRMatrix;
}

/** A logo accepted by the `<QRCode>` component. */
export type QRLogo = React.ReactNode | QRLogoObject;
