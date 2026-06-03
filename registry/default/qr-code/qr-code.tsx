"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  ECLevel,
  QRCodeHandle,
  QRDotStyle,
  QRFinderStyle,
  QRFinderTuple,
  QRLogo,
  QRLogoObject,
  QRRenderOptions,
} from "./lib/types";
import { encode } from "./lib/encoder";
import { buildRenderModel, serializeModel, resolveEcLevel } from "./lib/svg-builder";
import { matrixToDataURL } from "./lib/export";

export type QRCodeProps = Omit<
  React.ComponentProps<"svg">,
  "children" | "ref"
> & {
  /** The data to encode (URL, text, etc.). */
  value: string;
  /** Error correction level. Defaults to `"M"`; auto-raised when a logo is set. */
  ecLevel?: ECLevel;
  /** Module dot style. Defaults to `"square"`. */
  dotStyle?: QRDotStyle;
  /** Quiet-zone width in modules. Defaults to `4`. */
  margin?: number;
  /** Foreground (dark module) color. Defaults to `"currentColor"`. */
  foreground?: string;
  /** Background color. Defaults to `"transparent"`. */
  background?: string;
  /** Unified or per-corner `[topLeft, topRight, bottomLeft]` finder styling. */
  finder?: QRFinderStyle | QRFinderTuple;
  /** A center logo: an image descriptor or any React element. */
  logo?: QRLogo;
  /** Fraction of the symbol width occupied by the logo (clamped to ≤ 0.3). */
  logoSize?: number;
  /** Quiet area in modules knocked out around the logo. Defaults to `1`. */
  logoPadding?: number;
  /** Minimum QR version (1–40). */
  minVersion?: number;
  /** Rendered size in pixels. The `viewBox` stays in module units. */
  size?: number | string;
  /**
   * Accessible name, rendered as an SVG `<title>`. Defaults to `value`. Pass
   * `aria-hidden` instead to mark a decorative code.
   */
  title?: string;
  /** Imperative handle exposing `toSVGString`, `toDataURL`, and `getMatrix`. */
  ref?: React.Ref<QRCodeHandle>;
};

function isImageLogo(logo: QRLogo): logo is QRLogoObject {
  return (
    typeof logo === "object" &&
    logo !== null &&
    "src" in logo &&
    typeof (logo as QRLogoObject).src === "string"
  );
}

/**
 * Renders a QR code as pure, scalable SVG with customizable dot styles, finder
 * patterns, and an optional center logo.
 */
function QRCode({
  value,
  ecLevel,
  dotStyle,
  margin,
  foreground,
  background,
  finder,
  logo,
  logoSize,
  logoPadding,
  minVersion,
  size,
  title,
  className,
  ref,
  ...props
}: QRCodeProps) {
  const imageLogo = logo != null && isImageLogo(logo);
  const hasLogo = logo != null && logo !== false;
  const elementLogo = hasLogo && !imageLogo;
  const resolvedEcLevel = resolveEcLevel(ecLevel, hasLogo);
  // A consumer marking the code decorative (`aria-hidden`) shouldn't get an
  // auto-filled accessible name from `value`.
  const isDecorative =
    props["aria-hidden"] === true || props["aria-hidden"] === "true";
  const accessibleTitle = isDecorative ? title : (title ?? value);

  // Encoding is the expensive step (8-mask penalty scoring), so it is memoized
  // separately on primitive deps — style and logo changes never re-encode.
  const matrix = React.useMemo(
    () => encode(value, { ecLevel: resolvedEcLevel, minVersion }),
    [value, resolvedEcLevel, minVersion],
  );

  const { model, renderOptions } = React.useMemo(() => {
    const logoObject: QRLogoObject | undefined = imageLogo
      ? (logo as QRLogoObject)
      : hasLogo
        ? { src: "" }
        : undefined;

    const options: QRRenderOptions = {
      dotStyle,
      margin,
      foreground,
      background,
      finder,
      logoSize,
      logoPadding,
      logo: logoObject,
      title: accessibleTitle,
    };

    return { renderOptions: options, model: buildRenderModel(matrix, options) };
  }, [
    matrix,
    dotStyle,
    margin,
    foreground,
    background,
    finder,
    logo,
    imageLogo,
    hasLogo,
    logoSize,
    logoPadding,
    accessibleTitle,
  ]);

  React.useImperativeHandle(
    ref,
    (): QRCodeHandle => ({
      toSVGString: () => serializeModel(model, size),
      toDataURL: (options) => matrixToDataURL(matrix, renderOptions, options),
      getMatrix: () => matrix,
    }),
    [model, matrix, renderOptions, size],
  );

  const dimension = size != null ? { width: size, height: size } : {};

  return (
    <svg
      {...props}
      {...dimension}
      data-slot="qr-code"
      data-dot-style={dotStyle ?? "square"}
      role={props.role ?? "img"}
      viewBox={`0 0 ${model.viewBox} ${model.viewBox}`}
      shapeRendering={model.crisp ? "crispEdges" : undefined}
      className={cn("block", className)}
    >
      {model.title ? <title>{model.title}</title> : null}
      {model.background ? (
        <rect width={model.viewBox} height={model.viewBox} fill={model.background} />
      ) : null}
      {model.dataPath ? <path d={model.dataPath} fill={model.foreground} /> : null}
      {model.finders.map((f) => (
        <React.Fragment key={f.id}>
          <path d={f.outerPath} fill={f.outerColor} fillRule="evenodd" />
          <path d={f.innerPath} fill={f.innerColor} />
        </React.Fragment>
      ))}
      {model.knockout ? (
        <rect
          x={model.knockout.x}
          y={model.knockout.y}
          width={model.knockout.size}
          height={model.knockout.size}
          fill={model.knockout.color}
        />
      ) : null}
      {imageLogo && model.image ? (
        <image
          href={model.image.href}
          x={model.image.x}
          y={model.image.y}
          width={model.image.width}
          height={model.image.height}
          preserveAspectRatio="xMidYMid meet"
          aria-label={model.image.alt}
        />
      ) : null}
      {elementLogo && model.image ? (
        <foreignObject
          x={model.image.x}
          y={model.image.y}
          width={model.image.width}
          height={model.image.height}
        >
          <div className="flex h-full w-full items-center justify-center">
            {logo as React.ReactNode}
          </div>
        </foreignObject>
      ) : null}
    </svg>
  );
}

export { QRCode };
export { encode } from "./lib/encoder";
export { toSVGString, toDataURL } from "./lib/export";
export type {
  ECLevel,
  QRMode,
  QRMatrix,
  QRDotStyle,
  QRFinderStyle,
  QRFinderTuple,
  QRLogo,
  QRLogoObject,
  QRCodeHandle,
  QRExportOptions,
  QRDataURLType,
  QRDataURLOptions,
} from "./lib/types";
