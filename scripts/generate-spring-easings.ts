#!/usr/bin/env bun
import {
  springToLinearCSS,
  SPRING_PRESETS,
  type SpringPresetName,
} from "./lib/spring-easing";

console.log("/* Spring Easings — generated from physics presets */");
console.log("/* Run: npx tsx scripts/generate-spring-easings.ts */\n");

for (const [name, config] of Object.entries(SPRING_PRESETS)) {
  const { css, durationMs } = springToLinearCSS(config);
  const dampingRatio = (
    config.damping /
    (2 * Math.sqrt(config.stiffness * config.mass))
  ).toFixed(3);

  console.log(
    `/* ${name}: stiffness=${config.stiffness}, damping=${config.damping}, mass=${config.mass}, ζ=${dampingRatio} */`,
  );
  console.log(`--ease-spring-${name}: ${css};`);
  console.log(`--duration-spring-${name}: ${durationMs}ms;\n`);
}

// Also output the default (smooth) as --ease-smooth / --duration-smooth for drop-in replacement
console.log("/* Drop-in replacement for --ease-smooth / --duration-smooth */");
const smooth = springToLinearCSS(SPRING_PRESETS.smooth);
console.log(`--ease-smooth: ${smooth.css};`);
console.log(`--duration-smooth: ${smooth.durationMs}ms;`);
