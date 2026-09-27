import { describe, expect, it } from "vitest";
import {
  nestedFieldTone,
  normalizeSurfaceTone,
  SURFACE_TONE_BG_VAR,
  SURFACE_TONE_HOVER_VAR,
} from "./surface-tone.js";

describe("normalizeSurfaceTone", () => {
  it("returns known tones unchanged", () => {
    expect(normalizeSurfaceTone("subtle")).toBe("subtle");
    expect(SURFACE_TONE_BG_VAR.strong).toBe("var(--vu-color-surface-tertiary)");
    expect(SURFACE_TONE_HOVER_VAR.strong).toContain("--vu-color-surface-tertiary");
  });

  it("falls back to normal for unknown values", () => {
    expect(normalizeSurfaceTone("loud")).toBe("normal");
  });
});

describe("nestedFieldTone", () => {
  it("steps off the host surface so nested fields do not wash out", () => {
    expect(nestedFieldTone("subtle")).toBe("strong");
    expect(nestedFieldTone("normal")).toBe("strong");
    expect(nestedFieldTone("strong")).toBe("normal");
  });
});
