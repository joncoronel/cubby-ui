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
  /** Imperative handle exposing `toSVGString`, `toDataURL`, and `getMatrix`. */
  ref?: React.Ref<QRCodeHandle>;
};

/** Narrows an unknown logo value to a {@link QRLogoObject}. */
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
  className,
  ref,
  ...props
}: QRCodeProps) {
  const imageLogo = logo != null && isImageLogo(logo);
  const hasLogo = logo != null && logo !== false;
  const elementLogo = hasLogo && !imageLogo;

  const { model, matrix, renderOptions } = React.useMemo(() => {
    const logoObject: QRLogoObject | undefined = imageLogo
      ? (logo as QRLogoObject)
      : hasLogo
        ? { src: "" }
        : undefined;

    const encoded = encode(value, {
      ecLevel: resolveEcLevel(ecLevel, hasLogo),
      minVersion,
    });

    const options: QRRenderOptions = {
      dotStyle,
      margin,
      foreground,
      background,
      finder,
      logoSize,
      logoPadding,
      logo: logoObject,
    };

    return {
      matrix: encoded,
      renderOptions: options,
      model: buildRenderModel(encoded, options),
    };
  }, [
    value,
    ecLevel,
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
    minVersion,
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
      role={props.role ?? "img"}
      viewBox={`0 0 ${model.viewBox} ${model.viewBox}`}
      shapeRendering={model.crisp ? "crispEdges" : undefined}
      className={cn("block", className)}
    >
      {model.background ? (
        <rect width={model.viewBox} height={model.viewBox} fill={model.background} />
      ) : null}
      {model.dataPath ? <path d={model.dataPath} fill={model.foreground} /> : null}
      {model.finders.map((f, i) => (
        <React.Fragment key={i}>
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
export { encode, toSVGString, toDataURL } from "./lib";
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
  QRDataURLOptions,
} from "./lib/types";
