import { describe, expect, it, vi } from "vitest";
import { fadeIn, fadeOut } from "@lit-labs/motion";
import { VU_ENTER_FADE_SCALE, VU_EXIT_FADE_SCALE, vuAnimateOptions, vuLayoutDefaultOptions } from "./lit-animate.js";

describe("vuAnimateOptions", () => {
  it("disables animation when reduced motion is preferred", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    expect(vuAnimateOptions(null).disabled).toBe(true);
    vi.unstubAllGlobals();
  });

  it("maps fade preset to Lit motion keyframes", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      media: "",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const opts = vuAnimateOptions(null, { preset: "fade" });
    expect(opts.in).toBe(fadeIn);
    expect(opts.out).toBe(fadeOut);
    expect(opts.keyframeOptions?.duration).toBe(200);
    vi.unstubAllGlobals();
  });

  it("maps enter-fade-scale preset to shared keyframes", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      media: "",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const opts = vuAnimateOptions(null, { preset: "enter-fade-scale" });
    expect(opts.in).toBe(VU_ENTER_FADE_SCALE);
    expect(opts.out).toBe(VU_EXIT_FADE_SCALE);
    vi.unstubAllGlobals();
  });

  it("omits enter/exit keyframes from layout controller defaults", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      media: "",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const opts = vuLayoutDefaultOptions(null, { preset: "fade" });
    expect(opts.in).toBeUndefined();
    expect(opts.out).toBeUndefined();
    expect(opts.keyframeOptions?.duration).toBe(200);
    vi.unstubAllGlobals();
  });

  it("exports a local animate binding", async () => {
    const mod = await import("./lit-animate.js");
    expect(typeof mod.animate).toBe("function");
  });
});
