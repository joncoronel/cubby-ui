/**
 * Reed–Solomon error correction over GF(256) for QR codes.
 *
 * `computeDivisor` builds the generator polynomial of a given degree, and
 * `computeRemainder` divides a block of data codewords by it to produce the
 * error correction codewords.
 */

import { gfMultiply } from "./galois";

/**
 * Computes the Reed–Solomon generator polynomial divisor for the given number
 * of error correction codewords (`degree`). Coefficients are returned highest
 * power first, excluding the leading term (which is always 1).
 */
export function computeDivisor(degree: number): Uint8Array {
  if (degree < 1 || degree > 255) {
    throw new RangeError("Reed–Solomon degree out of range");
  }
  // Start with the monomial "1" (i.e. the polynomial 0*x^(n-1) + … + 1).
  const result = new Uint8Array(degree);
  result[degree - 1] = 1;

  // Repeatedly multiply by (x - r^i), where r = 0x02 is a field generator.
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < result.length) {
        result[j] ^= result[j + 1];
      }
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

/**
 * Computes the `divisor.length` error correction codewords for the given data
 * block by polynomial division over GF(256).
 */
export function computeRemainder(
  data: ArrayLike<number>,
  divisor: Uint8Array,
): Uint8Array {
  const result = new Uint8Array(divisor.length);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ result[0];
    result.copyWithin(0, 1);
    result[result.length - 1] = 0;
    for (let j = 0; j < divisor.length; j++) {
      result[j] ^= gfMultiply(divisor[j], factor);
    }
  }
  return result;
}
