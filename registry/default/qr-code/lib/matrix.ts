/**
 * QR symbol matrix construction: function patterns, codeword placement,
 * format/version information, and mask selection.
 */

import type { ECLevel } from "./types";
import {
  getSize,
  getEcFormatBits,
  getAlignmentPatternPositions,
} from "./tables";
import { maskBit, computePenalty } from "./mask";

interface BuiltMatrix {
  modules: boolean[][];
  size: number;
  mask: number;
}

/** Returns bit `i` of `value` as a boolean. */
function getBit(value: number, i: number): boolean {
  return ((value >>> i) & 1) !== 0;
}

/**
 * Builds the full module matrix for a version + EC level from its already
 * interleaved data-and-EC codewords. When `forcedMask` is omitted, the mask
 * with the lowest penalty score is selected automatically.
 */
export function buildMatrix(
  version: number,
  ecLevel: ECLevel,
  codewords: Uint8Array,
  forcedMask?: number,
): BuiltMatrix {
  const size = getSize(version);
  const modules: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false),
  );
  const isFunction: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false),
  );

  const setFunctionModule = (x: number, y: number, isDark: boolean): void => {
    modules[y][x] = isDark;
    isFunction[y][x] = true;
  };

  const drawFinderPattern = (cx: number, cy: number): void => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) {
          setFunctionModule(x, y, dist !== 2 && dist !== 4);
        }
      }
    }
  };

  const drawAlignmentPattern = (cx: number, cy: number): void => {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        setFunctionModule(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  };

  const drawFormatBits = (mask: number): void => {
    const data = (getEcFormatBits(ecLevel) << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) {
      rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    }
    const bits = ((data << 10) | rem) ^ 0x5412;

    // First copy, around the top-left finder.
    for (let i = 0; i <= 5; i++) {
      setFunctionModule(8, i, getBit(bits, i));
    }
    setFunctionModule(8, 7, getBit(bits, 6));
    setFunctionModule(8, 8, getBit(bits, 7));
    setFunctionModule(7, 8, getBit(bits, 8));
    for (let i = 9; i < 15; i++) {
      setFunctionModule(14 - i, 8, getBit(bits, i));
    }

    // Second copy, split across the other two finders.
    for (let i = 0; i < 8; i++) {
      setFunctionModule(size - 1 - i, 8, getBit(bits, i));
    }
    for (let i = 8; i < 15; i++) {
      setFunctionModule(8, size - 15 + i, getBit(bits, i));
    }
    setFunctionModule(8, size - 8, true); // Always-dark module.
  };

  const drawVersion = (): void => {
    if (version < 7) {
      return;
    }
    let rem = version;
    for (let i = 0; i < 12; i++) {
      rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    }
    const bits = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = getBit(bits, i);
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunctionModule(a, b, bit);
      setFunctionModule(b, a, bit);
    }
  };

  // Timing patterns.
  for (let i = 0; i < size; i++) {
    setFunctionModule(6, i, i % 2 === 0);
    setFunctionModule(i, 6, i % 2 === 0);
  }

  // Finder patterns (their light borders form the separators).
  drawFinderPattern(3, 3);
  drawFinderPattern(size - 4, 3);
  drawFinderPattern(3, size - 4);

  // Alignment patterns, skipping the three that overlap finder patterns.
  const align = getAlignmentPatternPositions(version);
  const numAlign = align.length;
  for (let i = 0; i < numAlign; i++) {
    for (let j = 0; j < numAlign; j++) {
      const corner =
        (i === 0 && j === 0) ||
        (i === 0 && j === numAlign - 1) ||
        (i === numAlign - 1 && j === 0);
      if (!corner) {
        drawAlignmentPattern(align[i], align[j]);
      }
    }
  }

  // Reserve the format and version areas.
  drawFormatBits(0);
  drawVersion();

  // Place the data and EC codewords in zig-zag order.
  let bitIndex = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right = 5;
    }
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x] && bitIndex < codewords.length * 8) {
          modules[y][x] = getBit(codewords[bitIndex >>> 3], 7 - (bitIndex & 7));
          bitIndex++;
        }
      }
    }
  }

  const applyMask = (mask: number): void => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!isFunction[y][x] && maskBit(mask, x, y)) {
          modules[y][x] = !modules[y][x];
        }
      }
    }
  };

  // Select the lowest-penalty mask unless one is forced.
  let mask = forcedMask;
  if (mask === undefined) {
    let minPenalty = Infinity;
    for (let m = 0; m < 8; m++) {
      applyMask(m);
      drawFormatBits(m);
      const penalty = computePenalty(modules, size);
      if (penalty < minPenalty) {
        mask = m;
        minPenalty = penalty;
      }
      applyMask(m); // Undo (XOR is self-inverse).
    }
  }
  mask = mask ?? 0;

  applyMask(mask);
  drawFormatBits(mask);

  return { modules, size, mask };
}
