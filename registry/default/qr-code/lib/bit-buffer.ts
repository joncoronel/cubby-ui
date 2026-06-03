/**
 * A growable buffer of bits, used to assemble the QR data bit stream before it
 * is packed into codewords.
 */
export class BitBuffer {
  private readonly bits: number[] = [];

  /** The number of bits currently stored. */
  get length(): number {
    return this.bits.length;
  }

  /**
   * Appends the lower `len` bits of `value`, most-significant bit first.
   */
  append(value: number, len: number): void {
    if (len < 0 || len > 31 || value >>> len !== 0) {
      throw new RangeError("Value does not fit in the given bit length");
    }
    for (let i = len - 1; i >= 0; i--) {
      this.bits.push((value >>> i) & 1);
    }
  }

  /** Reads the bit at `index`. */
  get(index: number): number {
    return this.bits[index];
  }

  /**
   * Packs the bit stream into a byte array, most-significant bit first. The
   * buffer length must be a multiple of 8.
   */
  toBytes(): Uint8Array {
    if (this.length % 8 !== 0) {
      throw new Error("Bit buffer is not byte-aligned");
    }
    const out = new Uint8Array(this.length / 8);
    for (let i = 0; i < this.length; i++) {
      out[i >>> 3] |= this.bits[i] << (7 - (i & 7));
    }
    return out;
  }
}
