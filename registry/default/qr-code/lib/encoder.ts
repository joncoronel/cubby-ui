/**
 * Top-level QR encoding pipeline.
 *
 * Implements ISO/IEC 18004 for Numeric, Alphanumeric, and Byte (UTF-8) modes
 * across versions 1–40 and all four error correction levels, with automatic
 * mode/version/mask selection.
 */

import type { ECLevel, EncodeOptions, QRMatrix, QRMode } from "./types";
import { BitBuffer } from "./bit-buffer";
import { detectMode, makeSegment, type Segment } from "./mode";
import { computeDivisor, computeRemainder } from "./reed-solomon";
import { buildMatrix } from "./matrix";
import {
  MODE_INDICATOR,
  getCharCountBits,
  getNumDataCodewords,
  getNumRawDataModules,
  getNumEcBlocks,
  getEccCodewordsPerBlock,
} from "./tables";

const EC_BOOST_ORDER: ECLevel[] = ["M", "Q", "H"];

/** Total bits a segment occupies at a given version (headers + payload). */
function getTotalBits(segment: Segment, version: number): number {
  return 4 + getCharCountBits(segment.mode, version) + segment.dataBits;
}

/**
 * Encodes `data` into a QR matrix.
 *
 * @throws if the data does not fit in any version up to `maxVersion`, or if a
 * forced mode cannot represent the data.
 */
export function encode(data: string, options: EncodeOptions = {}): QRMatrix {
  const requestedEcl: ECLevel = options.ecLevel ?? "M";
  const minVersion = clampVersion(options.minVersion ?? 1);
  const maxVersion = clampVersion(options.maxVersion ?? 40);
  const boostEcl = options.boostEcl ?? true;

  const mode: QRMode =
    !options.mode || options.mode === "auto"
      ? detectMode(data)
      : options.mode;
  const segment = makeSegment(data, mode);

  // Select the smallest version (≥ minVersion) that fits at the requested EC.
  let version = -1;
  for (let v = minVersion; v <= maxVersion; v++) {
    if (getTotalBits(segment, v) <= getNumDataCodewords(v, requestedEcl) * 8) {
      version = v;
      break;
    }
  }
  if (version === -1) {
    throw new Error(
      "Data is too long to encode in a QR code at the requested error correction level",
    );
  }

  // Boost the EC level for free if the chosen version has spare capacity.
  let ecLevel = requestedEcl;
  if (boostEcl) {
    const usedBits = getTotalBits(segment, version);
    for (const candidate of EC_BOOST_ORDER) {
      if (usedBits <= getNumDataCodewords(version, candidate) * 8) {
        ecLevel = candidate;
      }
    }
  }

  // Assemble the data bit stream.
  const buffer = new BitBuffer();
  buffer.append(MODE_INDICATOR[mode], 4);
  buffer.append(segment.numChars, getCharCountBits(mode, version));
  segment.appendData(buffer);

  const capacityBits = getNumDataCodewords(version, ecLevel) * 8;
  buffer.append(0, Math.min(4, capacityBits - buffer.length)); // Terminator.
  buffer.append(0, (8 - (buffer.length % 8)) % 8); // Byte-align.

  // Pad bytes alternate 0xEC / 0x11 until the capacity is filled.
  for (let pad = 0xec; buffer.length < capacityBits; pad ^= 0xec ^ 0x11) {
    buffer.append(pad, 8);
  }

  const dataCodewords = buffer.toBytes();
  const allCodewords = addEccAndInterleave(dataCodewords, version, ecLevel);
  const { modules, size, mask } = buildMatrix(version, ecLevel, allCodewords);

  return { size, modules, version, ecLevel, mode, maskPattern: mask };
}

/**
 * Splits data codewords into blocks, appends Reed–Solomon error correction,
 * and interleaves the result per ISO/IEC 18004.
 */
export function addEccAndInterleave(
  data: Uint8Array,
  version: number,
  ecLevel: ECLevel,
): Uint8Array {
  const numBlocks = getNumEcBlocks(version, ecLevel);
  const blockEccLen = getEccCodewordsPerBlock(version, ecLevel);
  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);
  const maxDataLen = shortBlockLen - blockEccLen + 1;

  const dataParts: Uint8Array[] = [];
  const eccParts: Uint8Array[] = [];
  const divisor = computeDivisor(blockEccLen);
  let offset = 0;
  for (let i = 0; i < numBlocks; i++) {
    const dataLen = maxDataLen - (i < numShortBlocks ? 1 : 0);
    const part = data.slice(offset, offset + dataLen);
    offset += dataLen;
    dataParts.push(part);
    eccParts.push(computeRemainder(part, divisor));
  }

  const result: number[] = [];
  for (let i = 0; i < maxDataLen; i++) {
    for (let j = 0; j < numBlocks; j++) {
      if (i < dataParts[j].length) {
        result.push(dataParts[j][i]);
      }
    }
  }
  for (let i = 0; i < blockEccLen; i++) {
    for (let j = 0; j < numBlocks; j++) {
      result.push(eccParts[j][i]);
    }
  }
  return Uint8Array.from(result);
}

function clampVersion(version: number): number {
  return Math.max(1, Math.min(40, Math.floor(version)));
}
