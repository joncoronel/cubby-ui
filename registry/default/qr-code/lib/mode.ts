/**
 * Mode detection and per-mode data segment encoding.
 *
 * Supports Numeric, Alphanumeric, and Byte (UTF-8) modes. A {@link Segment}
 * carries everything needed to emit its bit stream for a given version.
 */

import type { QRMode } from "./types";
import type { BitBuffer } from "./bit-buffer";
import { ALPHANUMERIC_CHARSET } from "./tables";

const NUMERIC_RE = /^[0-9]*$/;
const ALPHANUMERIC_RE = /^[0-9A-Z $%*+\-./:]*$/;

/** Char → value map for alphanumeric mode. */
const ALPHANUMERIC_MAP: Map<string, number> = new Map(
  Array.from(ALPHANUMERIC_CHARSET, (char, value) => [char, value]),
);

/** A single encoded data segment. */
export interface Segment {
  readonly mode: QRMode;
  /** Character count used by the char-count indicator. */
  readonly numChars: number;
  /** Length, in bits, of the payload (excluding mode + count headers). */
  readonly dataBits: number;
  /** Appends the payload bits to a buffer. */
  appendData(buffer: BitBuffer): void;
}

/** Selects the most compact mode that can represent `text`. */
export function detectMode(text: string): QRMode {
  if (NUMERIC_RE.test(text)) {
    return "numeric";
  }
  if (ALPHANUMERIC_RE.test(text)) {
    return "alphanumeric";
  }
  return "byte";
}

/** Builds a segment for `text` in the given mode. */
export function makeSegment(text: string, mode: QRMode): Segment {
  switch (mode) {
    case "numeric":
      return makeNumeric(text);
    case "alphanumeric":
      return makeAlphanumeric(text);
    case "byte":
      return makeBytes(text);
  }
}

function makeNumeric(text: string): Segment {
  if (!NUMERIC_RE.test(text)) {
    throw new Error("Text contains non-numeric characters");
  }
  const n = text.length;
  const dataBits = Math.floor(n / 3) * 10 + (n % 3 === 0 ? 0 : n % 3 === 1 ? 4 : 7);
  return {
    mode: "numeric",
    numChars: n,
    dataBits,
    appendData(buffer) {
      for (let i = 0; i < n; i += 3) {
        const chunk = text.slice(i, i + 3);
        buffer.append(Number.parseInt(chunk, 10), chunk.length * 3 + 1);
      }
    },
  };
}

function makeAlphanumeric(text: string): Segment {
  const n = text.length;
  const dataBits = Math.floor(n / 2) * 11 + (n % 2) * 6;
  return {
    mode: "alphanumeric",
    numChars: n,
    dataBits,
    appendData(buffer) {
      for (let i = 0; i < n; i += 2) {
        const first = ALPHANUMERIC_MAP.get(text[i]);
        if (first === undefined) {
          throw new Error("Text contains non-alphanumeric characters");
        }
        if (i + 1 < n) {
          const second = ALPHANUMERIC_MAP.get(text[i + 1]);
          if (second === undefined) {
            throw new Error("Text contains non-alphanumeric characters");
          }
          buffer.append(first * 45 + second, 11);
        } else {
          buffer.append(first, 6);
        }
      }
    },
  };
}

function makeBytes(text: string): Segment {
  const bytes = new TextEncoder().encode(text);
  return {
    mode: "byte",
    numChars: bytes.length,
    dataBits: bytes.length * 8,
    appendData(buffer) {
      for (const byte of bytes) {
        buffer.append(byte, 8);
      }
    },
  };
}
