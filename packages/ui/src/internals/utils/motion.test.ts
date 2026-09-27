import { describe, expect, it, vi } from "vitest";
import {
  motionDurationMs,
  MOTION_DURATION_MS,
  parseDurationMs,
  prefersReducedMotion,
  POPOVER_PRESET_DURATION_BASE,
  readMotionDurationMs,
  resolvePopoverDurationMs,
  resolvePopoverEasing,
} from "./motion.js";

describe("parseDurationMs", () => {
  it("parses ms and s values", () => {
    expect(parseDurationMs("120ms")).toBe(120);
    expect(parseDurationMs("0.3s")).toBe(300);
    expect(parseDurationMs("")).toBe(0);
  });
});

describe("motionDurationMs", () => {
  it("returns zero when reduced motion is preferred", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    expect(prefersReducedMotion()).toBe(true);
    expect(motionDurationMs(300)).toBe(0);
    vi.unstubAllGlobals();
  });

  it("passes duration through when motion is allowed", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      media: "",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    expect(motionDurationMs(250)).toBe(250);
    vi.unstubAllGlobals();
  });
});

describe("resolvePopoverEasing", () => {
  it("returns the preset-authored curve", () => {
    const curve = "cubic-bezier(0.23, 1, 0.32, 1)";
    expect(resolvePopoverEasing(null, "open", "slide", curve)).toBe(curve);
  });
});

describe("resolvePopoverDurationMs", () => {
  it("scales preset ms to theme normal/fast tokens", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      media: "",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const enter = resolvePopoverDurationMs(null, "open", POPOVER_PRESET_DURATION_BASE.enter);
    expect(enter).toBe(MOTION_DURATION_MS.normal);
    const exit = resolvePopoverDurationMs(null, "close", POPOVER_PRESET_DURATION_BASE.exit);
    expect(exit).toBe(MOTION_DURATION_MS.fast);
    vi.unstubAllGlobals();
  });
});
