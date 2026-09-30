import { afterEach, describe, expect, it, vi } from "vitest";
import {
  scheduleMorph,
  type MorphSteps,
} from "@/registry/default/text-morph/lib/scheduler";

/** A change that logs each phase it reaches, then finishes with nothing. */
function* phases(log: string[], name: string, count: number): MorphSteps {
  for (let phase = 1; phase < count; phase++) {
    log.push(`${name}${phase}`);
    yield;
  }
  log.push(`${name}${count}`);
  return [];
}

const root = (): HTMLElement => document.createElement("span");
const flush = (): Promise<void> => new Promise((r) => queueMicrotask(r));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("scheduleMorph", () => {
  it("steps every change in an update through each phase together", async () => {
    const log: string[] = [];
    scheduleMorph({ root: root(), steps: phases(log, "a", 3), done: () => {} });
    scheduleMorph({ root: root(), steps: phases(log, "b", 3), done: () => {} });
    expect(log).toEqual([]);
    await flush();
    expect(log).toEqual(["a1", "b1", "a2", "b2", "a3", "b3"]);
  });

  it("runs a second change to the same label after the first", () => {
    const log: string[] = [];
    const label = root();
    scheduleMorph({ root: label, steps: phases(log, "a", 2), done: () => {} });
    scheduleMorph({ root: label, steps: phases(log, "b", 2), done: () => {} });
    expect(log).toEqual(["a1", "a2"]);
  });

  it("finishes the rest of a batch when one change throws", async () => {
    const reportError = vi.fn();
    vi.stubGlobal("reportError", reportError);
    const log: string[] = [];
    const done = { bad: vi.fn(), good: vi.fn() };
    function* failing(): MorphSteps {
      yield;
      throw new Error("boom");
    }
    scheduleMorph({ root: root(), steps: failing(), done: done.bad });
    scheduleMorph({
      root: root(),
      steps: phases(log, "b", 3),
      done: done.good,
    });
    await flush();
    expect(log).toEqual(["b1", "b2", "b3"]);
    expect(done.bad).toHaveBeenCalledWith([]);
    expect(done.good).toHaveBeenCalledWith([]);
    expect(reportError).toHaveBeenCalledOnce();
  });
});
