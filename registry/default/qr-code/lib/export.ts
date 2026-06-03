/**
 * Export helpers: a pure SSR-safe SVG string builder and a client-side data URL
 * generator (PNG/JPEG via an offscreen canvas, or a vector SVG data URL).
 */

import type {
  QRMatrix,
  QRExportOptions,
  QRRenderOptions,
  QRDataURLOptions,
} from "./types";
import { encode } from "./encoder";
import { buildQRCodeSVG, resolveEcLevel } from "./svg-builder";

const DEFAULT_PIXEL_SIZE = 1024;

/**
 * Encodes and renders a QR code to an SVG string. Pure and dependency-free, so
 * it is safe to call on the server (route handlers, RSC, Node scripts).
 */
export function toSVGString(options: QRExportOptions): string {
  const hasLogo = Boolean(options.logo);
  const matrix = encode(options.value, {
    ecLevel: resolveEcLevel(options.ecLevel, hasLogo),
    minVersion: options.minVersion,
  });
  return buildQRCodeSVG(
    matrix,
    { ...options, title: options.title ?? options.value },
    options.size,
  );
}

/** Builds a vector `data:image/svg+xml` URL from an SVG string. */
export function svgToDataURL(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Renders an SVG string to a data URL. `"svg"` returns a vector data URL with
 * no canvas; `"png"`/`"jpeg"` rasterize via an offscreen canvas and therefore
 * require a browser environment.
 */
export async function rasterize(
  svg: string,
  options: { type?: "png" | "jpeg" | "svg"; quality?: number; pixelSize?: number } = {},
): Promise<string> {
  const type = options.type ?? "png";
  if (type === "svg") {
    return svgToDataURL(svg);
  }

  if (typeof window === "undefined" && typeof OffscreenCanvas === "undefined") {
    throw new Error(
      "Rasterizing to PNG/JPEG requires a browser environment; use toSVGString() or type: \"svg\" on the server.",
    );
  }

  const pixelSize = options.pixelSize ?? DEFAULT_PIXEL_SIZE;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImage(url);
    const { canvas, context } = createCanvas(pixelSize);
    if (type === "jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, pixelSize, pixelSize);
    }
    context.drawImage(image, 0, 0, pixelSize, pixelSize);
    return await canvasToDataURL(canvas, type, options.quality);
  } catch (error) {
    if (error instanceof DOMException && error.name === "SecurityError") {
      throw new Error(
        "Cannot export this QR code to PNG/JPEG: the canvas was tainted by a " +
          'cross-origin image. Use a same-origin or data-URI logo, or export with type: "svg".',
      );
    }
    throw error;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Encodes, renders, and converts a QR code to a data URL in one call (client
 * side for raster formats).
 */
export async function toDataURL(
  options: QRDataURLOptions & { value: string },
): Promise<string> {
  const type = options.type ?? "png";
  const pixelSize = options.pixelSize ?? DEFAULT_PIXEL_SIZE;
  const hasLogo = Boolean(options.logo);
  const matrix = encode(options.value, {
    ecLevel: resolveEcLevel(options.ecLevel, hasLogo),
    minVersion: options.minVersion,
  });
  // Size the SVG to the target raster resolution for a crisp rasterization.
  const size = type === "svg" ? options.size : pixelSize;
  const renderOptions =
    type === "svg"
      ? (options as QRRenderOptions)
      : await inlineCrossOriginLogo(options as QRRenderOptions);
  const svg = buildQRCodeSVG(matrix, renderOptions, size);
  return rasterize(svg, { type, quality: options.quality, pixelSize });
}

/** Convenience: convert an already-encoded matrix to a data URL. */
export async function matrixToDataURL(
  matrix: QRMatrix,
  renderOptions: QRRenderOptions,
  options: QRDataURLOptions = {},
): Promise<string> {
  const type = options.type ?? "png";
  const pixelSize = options.pixelSize ?? DEFAULT_PIXEL_SIZE;
  const size = type === "svg" ? options.size : pixelSize;
  const resolved =
    type === "svg" ? renderOptions : await inlineCrossOriginLogo(renderOptions);
  const svg = buildQRCodeSVG(matrix, resolved, size);
  return rasterize(svg, { type, quality: options.quality, pixelSize });
}

/** Whether a logo `src` points to a different origin (and is not inlined). */
function isCrossOriginUrl(src: string): boolean {
  if (/^(data:|blob:)/i.test(src)) {
    return false;
  }
  if (typeof location === "undefined") {
    return /^[a-z]+:\/\//i.test(src);
  }
  try {
    return new URL(src, location.href).origin !== location.origin;
  } catch {
    return false;
  }
}

/**
 * Rasterizing an SVG that references a cross-origin image taints the canvas, so
 * `toDataURL` would throw a `SecurityError`. When the logo is cross-origin we
 * fetch it (which only succeeds if the host sends CORS headers) and inline it as
 * a data URI. If that fails, we throw a clear, actionable error.
 */
async function inlineCrossOriginLogo(
  options: QRRenderOptions,
): Promise<QRRenderOptions> {
  const src = options.logo?.src;
  if (!src || !isCrossOriginUrl(src)) {
    return options;
  }
  try {
    const response = await fetch(src, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }
    const dataUrl = await blobToDataURL(await response.blob());
    return { ...options, logo: { ...options.logo!, src: dataUrl } };
  } catch {
    throw new Error(
      `Cannot rasterize a QR code with a cross-origin logo ("${src}") to PNG/JPEG — ` +
        `the canvas would be tainted. Use a same-origin or data-URI logo, ensure the ` +
        `image host sends CORS headers, or export with type: "svg".`,
    );
  }
}

async function loadImage(url: string): Promise<CanvasImageSource> {
  if (typeof Image !== "undefined") {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load SVG for rasterization"));
      img.src = url;
    });
  }
  const response = await fetch(url);
  return createImageBitmap(await response.blob());
}

function createCanvas(size: number): {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
} {
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not acquire a 2D canvas context");
    }
    return { canvas, context };
  }
  const canvas = new OffscreenCanvas(size, size);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not acquire a 2D canvas context");
  }
  return { canvas, context };
}

async function canvasToDataURL(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  type: "png" | "jpeg",
  quality?: number,
): Promise<string> {
  const mime = type === "png" ? "image/png" : "image/jpeg";
  if (canvas instanceof OffscreenCanvas) {
    const blob = await canvas.convertToBlob({ type: mime, quality });
    return blobToDataURL(blob);
  }
  return canvas.toDataURL(mime, quality);
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read rasterized blob"));
    reader.readAsDataURL(blob);
  });
}
