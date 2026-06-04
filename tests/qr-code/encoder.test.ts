import { describe, it, expect } from "vitest";
import { encode } from "@/registry/default/qr-code/lib/encoder";
import { maskBit } from "@/registry/default/qr-code/lib/mask";
import type { QRMatrix } from "@/registry/default/qr-code/lib/types";

const ALPHANUMERIC = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

/** Exact function-module map for a version-1 (21×21) symbol. */
function functionMapV1(): boolean[][] {
  const size = 21;
  const f = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const mark = (x: number, y: number) => {
    f[y][x] = true;
  };
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      mark(x, y);
      mark(20 - x, y);
      mark(x, 20 - y);
    }
  }
  for (let i = 0; i < size; i++) {
    mark(6, i);
    mark(i, 6);
  }
  for (let y = 0; y <= 8; y++) mark(8, y);
  for (let y = 13; y <= 20; y++) mark(8, y);
  for (let x = 0; x <= 8; x++) mark(x, 8);
  for (let x = 13; x <= 20; x++) mark(x, 8);
  return f;
}

/** Reverses the data path of a version-1 symbol back into a string. */
function decodeV1(qr: QRMatrix): { mode: number; count: number; text: string } {
  const size = qr.size;
  const f = functionMapV1();
  const m = qr.modules.map((row) => row.slice());
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!f[y][x] && maskBit(qr.maskPattern, x, y)) m[y][x] = !m[y][x];
    }
  }

  const bits: number[] = [];
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!f[y][x]) bits.push(m[y][x] ? 1 : 0);
      }
    }
  }

  let p = 0;
  const read = (n: number): number => {
    let v = 0;
    for (let i = 0; i < n; i++) v = (v << 1) | bits[p++];
    return v;
  };

  const mode = read(4);
  const count = read(9);
  let text = "";
  let remaining = count;
  while (remaining >= 2) {
    const v = read(11);
    text += ALPHANUMERIC[Math.floor(v / 45)] + ALPHANUMERIC[v % 45];
    remaining -= 2;
  }
  if (remaining === 1) text += ALPHANUMERIC[read(6)];
  return { mode, count, text };
}

describe("QR encoder", () => {
  it("encodes HELLO WORLD as a version-1 alphanumeric symbol", () => {
    const qr = encode("HELLO WORLD", { ecLevel: "Q" });
    expect(qr.version).toBe(1);
    expect(qr.size).toBe(21);
    expect(qr.mode).toBe("alphanumeric");
    expect(qr.ecLevel).toBe("Q");
    expect(qr.maskPattern).toBeGreaterThanOrEqual(0);
    expect(qr.maskPattern).toBeLessThanOrEqual(7);
  });

  it("round-trips the data path back to the original string", () => {
    const qr = encode("HELLO WORLD", { ecLevel: "Q" });
    const decoded = decodeV1(qr);
    expect(decoded.mode).toBe(0x2); // Alphanumeric mode indicator.
    expect(decoded.count).toBe(11);
    expect(decoded.text).toBe("HELLO WORLD");
  });

  it("auto-detects the most compact mode", () => {
    expect(encode("12345").mode).toBe("numeric");
    expect(encode("HELLO").mode).toBe("alphanumeric");
    expect(encode("hello").mode).toBe("byte"); // lowercase forces byte mode
    expect(encode("https://cubby-ui.dev").mode).toBe("byte");
  });

  it("grows the version to fit larger payloads", () => {
    const small = encode("HI", { ecLevel: "M", boostEcl: false });
    const large = encode("x".repeat(300), { ecLevel: "M" });
    expect(small.version).toBe(1);
    expect(large.version).toBeGreaterThan(small.version);
  });

  it("boosts the error correction level for free", () => {
    const qr = encode("A", { ecLevel: "L" });
    expect(qr.ecLevel).toBe("H"); // tiny payload fits the highest level at v1
  });

  it("respects an explicit error correction level when not boosting", () => {
    const qr = encode("HELLO WORLD", { ecLevel: "L", boostEcl: false });
    expect(qr.ecLevel).toBe("L");
  });

  it("produces a square boolean matrix", () => {
    const qr = encode("https://cubby-ui.dev");
    expect(qr.modules).toHaveLength(qr.size);
    for (const row of qr.modules) {
      expect(row).toHaveLength(qr.size);
      for (const cell of row) {
        expect(typeof cell).toBe("boolean");
      }
    }
  });

  it("is deterministic", () => {
    const a = encode("https://cubby-ui.dev", { ecLevel: "H" });
    const b = encode("https://cubby-ui.dev", { ecLevel: "H" });
    expect(a.modules).toEqual(b.modules);
    expect(a.maskPattern).toBe(b.maskPattern);
  });

  it("throws when the data cannot fit", () => {
    expect(() => encode("x".repeat(5000), { maxVersion: 1 })).toThrow();
  });

  it("places correct finder patterns at three corners", () => {
    const qr = encode("HELLO WORLD", { ecLevel: "Q" });
    const corners: Array<[number, number]> = [
      [0, 0],
      [qr.size - 7, 0],
      [0, qr.size - 7],
    ];
    for (const [ox, oy] of corners) {
      // Dark 7×7 border.
      for (let i = 0; i < 7; i++) {
        expect(qr.modules[oy][ox + i]).toBe(true);
        expect(qr.modules[oy + 6][ox + i]).toBe(true);
      }
      // Light ring at offset 1, dark center at offset 2-4.
      expect(qr.modules[oy + 1][ox + 1]).toBe(false);
      expect(qr.modules[oy + 3][ox + 3]).toBe(true);
    }
  });
});
