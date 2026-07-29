import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnimatedHeight } from "@/registry/default/hooks/use-animated-height";

type ObserverRecord = {
  callback: ResizeObserverCallback;
  observed: Element[];
  disconnected: boolean;
};

let observers: ObserverRecord[];

class MockResizeObserver {
  private record: ObserverRecord;

  constructor(callback: ResizeObserverCallback) {
    this.record = { callback, observed: [], disconnected: false };
    observers.push(this.record);
  }

  observe(target: Element) {
    this.record.observed.push(target);
  }

  unobserve() {}

  disconnect() {
    this.record.disconnected = true;
  }
}

function resize(record: ObserverRecord, height: number) {
  const target = record.observed[0] as HTMLElement;
  act(() => {
    record.callback(
      [
        {
          target,
          borderBoxSize: [{ blockSize: height, inlineSize: 0 }],
        } as unknown as ResizeObserverEntry,
      ],
      record as unknown as ResizeObserver,
    );
  });
}

function setup(onResize?: (height: number, outer: HTMLElement) => void) {
  const rendered = renderHook(
    ({ cb }: { cb?: (height: number, outer: HTMLElement) => void }) =>
      useAnimatedHeight(cb),
    { initialProps: { cb: onResize } },
  );
  const outer = document.createElement("div");
  const inner = document.createElement("div");
  rendered.result.current.outerRef.current = outer;
  act(() => rendered.result.current.innerRef(inner));
  return { ...rendered, outer, inner };
}

beforeEach(() => {
  observers = [];
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useAnimatedHeight", () => {
  it("writes the measured height and fade duration onto the outer element", () => {
    const { outer } = setup();

    resize(observers[0], 100);

    expect(outer.style.height).toBe("100px");
    // diff of 100 from initial 0 -> 100 / 500 = 0.2s, within clamp range
    expect(outer.style.getPropertyValue("--fade-duration")).toBe("0.2s");
  });

  it("clamps the fade duration between 0.15s and 0.27s", () => {
    const { outer } = setup();

    resize(observers[0], 100);
    resize(observers[0], 110); // diff 10 -> clamped up to min
    expect(outer.style.getPropertyValue("--fade-duration")).toBe("0.15s");

    resize(observers[0], 500); // diff 390 -> clamped down to max
    expect(outer.style.getPropertyValue("--fade-duration")).toBe("0.27s");
  });

  it("ignores zero-height measurements", () => {
    const { outer } = setup();

    resize(observers[0], 0);

    expect(outer.style.height).toBe("");
  });

  it("calls onResize after each write with the height and outer element", () => {
    const onResize = vi.fn();
    const { outer } = setup(onResize);

    resize(observers[0], 100);

    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenCalledWith(100, outer);
    // The write lands before the callback runs, so consumers can retarget
    // an in-flight animation against the committed height.
    expect(outer.style.height).toBe("100px");
  });

  it("uses the latest onResize without rebuilding the observer", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender, outer } = setup(first);

    rerender({ cb: second });
    expect(observers).toHaveLength(1);

    resize(observers[0], 100);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(100, outer);
  });

  it("disconnects the previous observer when the inner node changes", () => {
    const { result } = setup();

    const replacement = document.createElement("div");
    act(() => result.current.innerRef(replacement));

    expect(observers[0].disconnected).toBe(true);
    expect(observers[1].observed).toEqual([replacement]);
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = setup();

    unmount();

    expect(observers[0].disconnected).toBe(true);
  });
});
