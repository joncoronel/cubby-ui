/**
 * Arithmetic in the Galois field GF(256) used by QR Reed–Solomon coding.
 *
 * The field is defined modulo the primitive polynomial
 * `x^8 + x^4 + x^3 + x^2 + 1` (`0x11D`), per ISO/IEC 18004. Multiplication is
 * implemented with the carry-less "Russian peasant" method, so no lookup
 * tables are required and the module stays tiny and tree-shakeable.
 */

/** The QR primitive polynomial for GF(256), with the high bit dropped. */
const PRIMITIVE = 0x11d;

/**
 * Multiplies two field elements in GF(256). Both operands and the result are
 * bytes (0–255).
 */
export function gfMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    // Multiply `z` by 2, reducing modulo the primitive polynomial.
    z = (z << 1) ^ ((z >>> 7) * PRIMITIVE);
    // Conditionally add `x` when bit `i` of `y` is set.
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}
