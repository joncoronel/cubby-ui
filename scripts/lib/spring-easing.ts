/**
 * Spring Physics → CSS linear() Easing Utility
 *
 * Converts spring parameters {stiffness, damping, mass} into a CSS linear()
 * easing function and settling duration. Intended for build-time / dev-time use
 * to generate static CSS values — not a runtime dependency.
 *
 * Based on the damped harmonic oscillator: m·x'' + c·x' + k·x = 0
 *
 * @example
 * ```ts
 * import { springToLinearCSS, SPRING_PRESETS } from "@/lib/spring-easing";
 *
 * const { css, durationMs } = springToLinearCSS(SPRING_PRESETS.smooth);
 * // css: "linear(0, 0.1389, 0.3658, ...)"
 * // durationMs: 520
 * ```
 */

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

/**
 * Spring presets for physics-based easing curves.
 */
export const SPRING_PRESETS = {
  /** Overdamped (ζ≈1.06) — slow, no overshoot */
  gentle: { stiffness: 560, damping: 68, mass: 1.85 },
  /** Overdamped (ζ≈1.07) — smooth deceleration, no overshoot. Default for enter/exit. */
  smooth: { stiffness: 580, damping: 60, mass: 1.35 },
  /** Barely underdamped (ζ≈0.96) — quick with minimal overshoot */
  snappy: { stiffness: 350, damping: 34, mass: 0.9 },
  /** Underdamped (ζ≈0.93) — fast with slight overshoot */
  brisk: { stiffness: 350, damping: 28, mass: 0.65 },
  /** Underdamped (ζ≈0.73) — visible bounce */
  bouncy: { stiffness: 240, damping: 19, mass: 0.7 },
  /** Underdamped (ζ≈0.62) — significant overshoot */
  elastic: { stiffness: 260, damping: 20, mass: 1 },
} as const satisfies Record<string, SpringConfig>;

export type SpringPresetName = keyof typeof SPRING_PRESETS;

interface SpringSimulationResult {
  /** CSS linear() easing string */
  css: string;
  /** Duration in milliseconds (time for spring to settle) */
  durationMs: number;
}

/**
 * Simulate a damped spring and convert to CSS linear() easing.
 *
 * @param config - Spring parameters {stiffness, damping, mass}
 * @param options.points - Number of linear() control points (default: auto-calculated)
 * @param options.threshold - Settlement threshold as fraction of total displacement (default: 0.001)
 * @param options.precision - Decimal places for linear() values (default: 4)
 */
export function springToLinearCSS(
  config: SpringConfig,
  options: {
    points?: number;
    threshold?: number;
    precision?: number;
  } = {},
): SpringSimulationResult {
  const { threshold = 0.001, precision = 4 } = options;

  // Simulate the spring
  const { samples, settlingTime } = simulateSpring(config, threshold);

  // Determine number of control points
  const numPoints =
    options.points ?? calculateAdaptivePointCount(config, settlingTime);

  // Resample at evenly-spaced intervals
  const resampled = resampleCurve(samples, numPoints);

  // Format as CSS linear() string
  const css = toLinearCSS(resampled, precision);
  const durationMs = Math.ceil(settlingTime * 1000);

  return { css, durationMs };
}

/**
 * Simulate the damped harmonic oscillator using RK4 integration.
 *
 * Equation: m·x'' + c·x' + k·x = 0
 * Initial conditions: x(0) = 1 (full displacement), x'(0) = 0 (at rest)
 * Progress = 1 - x(t) (goes from 0 to 1 as spring settles)
 */
function simulateSpring(
  config: SpringConfig,
  threshold: number,
): { samples: number[]; settlingTime: number } {
  const { stiffness: k, damping: c, mass: m } = config;
  const dt = 1 / 600; // ~0.00167s timestep for accuracy
  const maxTime = 10; // Safety cap

  // Natural frequency — used to scale velocity threshold relative to spring speed
  const omega0 = Math.sqrt(k / m);

  // State: [position, velocity]
  let x = 1; // displacement from target (starts at 1)
  let v = 0; // velocity (starts at rest)

  const samples: number[] = [0]; // progress values, starting at 0
  let settlingTime = 0;
  let settledSteps = 0;
  const requiredSettledSteps = 10; // consecutive steps below threshold

  // Derivative function: returns [dx/dt, dv/dt]
  const deriv = (pos: number, vel: number): [number, number] => {
    const acceleration = (-k * pos - c * vel) / m;
    return [vel, acceleration];
  };

  for (let t = dt; t <= maxTime; t += dt) {
    // RK4 integration
    const [k1dx, k1dv] = deriv(x, v);
    const [k2dx, k2dv] = deriv(x + k1dx * dt * 0.5, v + k1dv * dt * 0.5);
    const [k3dx, k3dv] = deriv(x + k2dx * dt * 0.5, v + k2dv * dt * 0.5);
    const [k4dx, k4dv] = deriv(x + k3dx * dt, v + k3dv * dt);

    x += (dt / 6) * (k1dx + 2 * k2dx + 2 * k3dx + k4dx);
    v += (dt / 6) * (k1dv + 2 * k2dv + 2 * k3dv + k4dv);

    // Progress: 1 - displacement (0 = start, 1 = settled)
    samples.push(1 - x);

    // Check settlement: position below threshold AND velocity below
    // threshold × ω₀ (scales with spring speed, matching how most animation
    // libraries like react-spring and motion determine "at rest")
    if (Math.abs(x) < threshold && Math.abs(v) < threshold * omega0) {
      settledSteps++;
      if (settledSteps >= requiredSettledSteps) {
        settlingTime = t - (requiredSettledSteps - 1) * dt;
        break;
      }
    } else {
      settledSteps = 0;
    }
  }

  // If we didn't settle (shouldn't happen with reasonable configs), use max time
  if (settlingTime === 0) {
    settlingTime = maxTime;
  }

  return { samples, settlingTime };
}

/**
 * Determine how many linear() control points to use based on spring behavior.
 * Overdamped springs need fewer points; bouncy springs need more to capture oscillation.
 */
function calculateAdaptivePointCount(
  config: SpringConfig,
  settlingTime: number,
): number {
  const { stiffness: k, damping: c, mass: m } = config;
  const dampingRatio = c / (2 * Math.sqrt(k * m));

  if (dampingRatio >= 1) {
    // Overdamped/critically damped — monotonic curve, 20 points suffices
    return 20;
  }

  // Underdamped — need more points to capture oscillation peaks
  const dampedFreq = Math.sqrt(k / m) * Math.sqrt(1 - dampingRatio ** 2);
  const oscillationCycles = (settlingTime * dampedFreq) / (2 * Math.PI);

  // ~8 samples per oscillation cycle, minimum 24, maximum 60
  return Math.min(60, Math.max(24, Math.ceil(oscillationCycles * 8)));
}

/**
 * Resample simulation output to N evenly-spaced points.
 * First point is always 0, last is always 1.
 */
function resampleCurve(samples: number[], numPoints: number): number[] {
  const result: number[] = [];
  const lastIndex = samples.length - 1;

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const index = t * lastIndex;
    const lower = Math.floor(index);
    const upper = Math.min(lower + 1, lastIndex);
    const frac = index - lower;

    // Linear interpolation between simulation samples
    const value = samples[lower]! + frac * (samples[upper]! - samples[lower]!);
    result.push(value);
  }

  // Ensure endpoints are exact
  result[0] = 0;
  result[result.length - 1] = 1;

  return result;
}

/**
 * Format sampled values as a CSS linear() easing string.
 */
function toLinearCSS(samples: number[], precision: number): string {
  const values = samples.map((v) => {
    const rounded = Number(v.toFixed(precision));
    // Remove trailing zeros for cleaner output
    return String(rounded);
  });

  return `linear(${values.join(", ")})`;
}
