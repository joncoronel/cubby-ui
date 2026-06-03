/**
 * Constant tables and derived geometry from ISO/IEC 18004.
 *
 * The full per-version codeword/block layout is derived arithmetically from two
 * compact tables (error correction codewords per block, and number of error
 * correction blocks) rather than a large hard-coded table.
 */

import type { ECLevel, QRMode } from "./types";

/** Ordinal index into the EC tables below, in ascending recovery order. */
const EC_ORDINAL: Record<ECLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };

/** 5-bit format-info value for each EC level (not the same as the ordinal). */
const EC_FORMAT_BITS: Record<ECLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

/** 4-bit mode indicator emitted at the start of each segment. */
export const MODE_INDICATOR: Record<QRMode, number> = {
  numeric: 0x1,
  alphanumeric: 0x2,
  byte: 0x4,
};

/** The 45-character alphanumeric set, indexed by value. */
export const ALPHANUMERIC_CHARSET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

// Indexed by [ecOrdinal][version]; index 0 of each row is an unused placeholder.
// prettier-ignore
const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  [-1,  7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // L
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28], // M
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // Q
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // H
];

// Indexed by [ecOrdinal][version]; index 0 of each row is an unused placeholder.
// prettier-ignore
const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2,  4,  4,  4,  4,  4,  6,  6,  6,  6,  7,  8,  8,  9,  9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25], // L
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5,  5,  5,  8,  9,  9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49], // M
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8,  8,  8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68], // Q
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8,  8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81], // H
];

/** Returns the number of modules per side for a version (`17 + 4 * version`). */
export function getSize(version: number): number {
  return version * 4 + 17;
}

/** Returns the EC ordinal for a level. */
export function getEcOrdinal(ecLevel: ECLevel): number {
  return EC_ORDINAL[ecLevel];
}

/** Returns the 5-bit format-info value for a level. */
export function getEcFormatBits(ecLevel: ECLevel): number {
  return EC_FORMAT_BITS[ecLevel];
}

/** Number of EC codewords per block for a version + level. */
export function getEccCodewordsPerBlock(
  version: number,
  ecLevel: ECLevel,
): number {
  return ECC_CODEWORDS_PER_BLOCK[EC_ORDINAL[ecLevel]][version];
}

/** Number of error correction blocks for a version + level. */
export function getNumEcBlocks(version: number, ecLevel: ECLevel): number {
  return NUM_ERROR_CORRECTION_BLOCKS[EC_ORDINAL[ecLevel]][version];
}

/**
 * Total number of data-and-EC modules available for a version, excluding all
 * function patterns and format/version information.
 */
export function getNumRawDataModules(version: number): number {
  if (version < 1 || version > 40) {
    throw new RangeError("Version out of range");
  }
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (version >= 7) {
      result -= 36;
    }
  }
  return result;
}

/** Number of usable data codewords (excluding EC) for a version + level. */
export function getNumDataCodewords(version: number, ecLevel: ECLevel): number {
  return (
    Math.floor(getNumRawDataModules(version) / 8) -
    getEccCodewordsPerBlock(version, ecLevel) * getNumEcBlocks(version, ecLevel)
  );
}

/** Width, in bits, of the character-count indicator for a mode + version. */
export function getCharCountBits(mode: QRMode, version: number): number {
  const band = version <= 9 ? 0 : version <= 26 ? 1 : 2;
  switch (mode) {
    case "numeric":
      return [10, 12, 14][band];
    case "alphanumeric":
      return [9, 11, 13][band];
    case "byte":
      return [8, 16, 16][band];
  }
}

/**
 * Returns the center coordinates of the alignment patterns for a version. The
 * three positions that collide with finder patterns are filtered out by the
 * caller.
 */
export function getAlignmentPatternPositions(version: number): number[] {
  if (version === 1) {
    return [];
  }
  const numAlign = Math.floor(version / 7) + 2;
  const step =
    version === 32
      ? 26
      : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result: number[] = [6];
  for (
    let pos = getSize(version) - 7;
    result.length < numAlign;
    pos -= step
  ) {
    result.splice(1, 0, pos);
  }
  return result;
}
