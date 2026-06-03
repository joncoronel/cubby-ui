/**
 * Public entry point for the QR code encoder and renderer library.
 *
 * Every export is named (no default exports) so consumers and bundlers can
 * tree-shake unused parts of the library.
 */

export { encode, addEccAndInterleave } from "./encoder";
export {
  buildRenderModel,
  serializeModel,
  buildQRCodeSVG,
  resolveEcLevel,
} from "./svg-builder";
export type {
  QRRenderModel,
  FinderRender,
  KnockoutRect,
  ImageRender,
} from "./svg-builder";
export {
  toSVGString,
  toDataURL,
  svgToDataURL,
  rasterize,
  matrixToDataURL,
} from "./export";

export type {
  ECLevel,
  QRMode,
  EncodeOptions,
  QRMatrix,
  QRDotStyle,
  QRFinderStyle,
  QRFinderTuple,
  QRLogoObject,
  QRLogo,
  QRRenderOptions,
  QRExportOptions,
  QRDataURLType,
  QRDataURLOptions,
  QRCodeHandle,
} from "./types";
