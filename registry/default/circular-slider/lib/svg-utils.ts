import { cn } from "@/lib/utils";
import {
  SVG_VIEWBOX_SIZE,
  SVG_CONFIG,
  RADIUS_CONFIG,
  DEFAULT_STROKE_WIDTH,
} from "./svg-constants";

/**
 * Convert pixels to SVG viewBox units
 */
export function pixelsToSvgUnits(
  pixels: number,
  containerSize: number,
): number {
  return pixels * (SVG_VIEWBOX_SIZE / containerSize);
}

/**
 * Calculate the inner edge of the track based on stroke width
 */
export function getTrackInnerEdge(
  strokeWidthInPixels: number,
  containerSize: number,
): number {
  const strokeWidthInSvgUnits = pixelsToSvgUnits(
    strokeWidthInPixels,
    containerSize,
  );
  return RADIUS_CONFIG.TRACK - strokeWidthInSvgUnits / 2;
}

/**
 * Create common props for SVG overlay elements
 */
export function createSvgOverlayProps(
  slot: string,
  className?: string,
  pointerEvents: boolean = true,
) {
  return {
    "data-slot": slot,
    viewBox: SVG_CONFIG.VIEWBOX_STRING,
    className: cn(
      "absolute inset-0 w-full h-full",
      !pointerEvents && "pointer-events-none",
      className,
    ),
  };
}

/**
 * Convert strokeWidth prop (in pixels) to SVG units
 * Returns the converted value or default if not provided
 */
export function strokeWidthToSvgUnits(
  strokeWidth: number | undefined,
  size: number,
): number {
  const pixels = strokeWidth ?? DEFAULT_STROKE_WIDTH;
  return pixelsToSvgUnits(pixels, size);
}
