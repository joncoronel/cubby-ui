/**
 * Data masking and penalty scoring per ISO/IEC 18004.
 *
 * `maskBit` returns whether a module at (x, y) is inverted by a given mask
 * pattern, and `computePenalty` scores a finished matrix using the four
 * standard penalty rules so the lowest-scoring mask can be chosen.
 */

const PENALTY_N1 = 3;
const PENALTY_N2 = 3;
const PENALTY_N3 = 40;
const PENALTY_N4 = 10;

/** Returns whether mask pattern `mask` (0–7) inverts the module at (x, y). */
export function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    case 7:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      throw new RangeError("Mask pattern out of range");
  }
}

/** Scores a finished matrix; lower is better. */
export function computePenalty(modules: boolean[][], size: number): number {
  let result = 0;

  // Rule 1 (rows) and rule 3 (finder-like patterns) along each row.
  for (let y = 0; y < size; y++) {
    let runColor = false;
    let runLength = 0;
    const history = [0, 0, 0, 0, 0, 0, 0];
    for (let x = 0; x < size; x++) {
      if (modules[y][x] === runColor) {
        runLength++;
        if (runLength === 5) {
          result += PENALTY_N1;
        } else if (runLength > 5) {
          result++;
        }
      } else {
        addHistory(runLength, history, size);
        if (!runColor) {
          result += countFinderPatterns(history) * PENALTY_N3;
        }
        runColor = modules[y][x];
        runLength = 1;
      }
    }
    result += terminateAndCount(runColor, runLength, history, size) * PENALTY_N3;
  }

  // Rule 1 (columns) and rule 3 along each column.
  for (let x = 0; x < size; x++) {
    let runColor = false;
    let runLength = 0;
    const history = [0, 0, 0, 0, 0, 0, 0];
    for (let y = 0; y < size; y++) {
      if (modules[y][x] === runColor) {
        runLength++;
        if (runLength === 5) {
          result += PENALTY_N1;
        } else if (runLength > 5) {
          result++;
        }
      } else {
        addHistory(runLength, history, size);
        if (!runColor) {
          result += countFinderPatterns(history) * PENALTY_N3;
        }
        runColor = modules[y][x];
        runLength = 1;
      }
    }
    result += terminateAndCount(runColor, runLength, history, size) * PENALTY_N3;
  }

  // Rule 2: 2×2 blocks of the same color.
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const color = modules[y][x];
      if (
        color === modules[y][x + 1] &&
        color === modules[y + 1][x] &&
        color === modules[y + 1][x + 1]
      ) {
        result += PENALTY_N2;
      }
    }
  }

  // Rule 4: deviation of dark module proportion from 50%.
  let dark = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules[y][x]) {
        dark++;
      }
    }
  }
  const total = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  result += k * PENALTY_N4;

  return result;
}

/** Counts finder-like 1:1:3:1:1 patterns recorded in a run history. */
function countFinderPatterns(history: number[]): number {
  const n = history[1];
  const core =
    n > 0 &&
    history[2] === n &&
    history[3] === n * 3 &&
    history[4] === n &&
    history[5] === n;
  return (
    (core && history[0] >= n * 4 && history[6] >= n ? 1 : 0) +
    (core && history[6] >= n * 4 && history[0] >= n ? 1 : 0)
  );
}

/** Finishes a line's run history (adding light borders) and counts patterns. */
function terminateAndCount(
  runColor: boolean,
  runLength: number,
  history: number[],
  size: number,
): number {
  if (runColor) {
    addHistory(runLength, history, size);
    runLength = 0;
  }
  runLength += size;
  addHistory(runLength, history, size);
  return countFinderPatterns(history);
}

/** Pushes a run length into the 7-entry history, padding the first run. */
function addHistory(runLength: number, history: number[], size: number): void {
  if (history[0] === 0) {
    runLength += size;
  }
  history.pop();
  history.unshift(runLength);
}
