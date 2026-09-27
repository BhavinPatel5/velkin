import { expect } from "vitest";
import {
  AA_CONTRAST_RATIO,
  AA_LARGE_CONTRAST_RATIO,
  SEMANTIC_COLOR_ROLES,
  checkAccentHueSeparation,
  checkSolidPair,
  intentForegroundForRole,
  minContrastForIntentRole,
  parseOklch,
  recommendedForegroundToken,
  startingAccentOklch,
} from "../../../../internals/utils/theme-contrast.js";
import { createTheme, defaultTheme, resolveModeVars } from "../../internals/theme-core.js";
import { SHOWCASE_THEME_PRESETS } from "../../../../showcase/theme-presets.js";

function sheetColors(config: ReturnType<typeof createTheme>, mode: "light" | "dark") {
  const vars = resolveModeVars(config, mode);
  const colors: Record<string, string> = {};
  const foregrounds: Record<string, string> = {};
  for (const role of SEMANTIC_COLOR_ROLES) {
    colors[role] = vars[`color-${role}`] ?? "";
    foregrounds[role] = vars[`color-${role}-foreground`] ?? "";
  }
  return { colors, foregrounds };
}

function expectSheetPasses(label: string, config: ReturnType<typeof createTheme>) {
  for (const mode of ["light", "dark"] as const) {
    const { colors, foregrounds } = sheetColors(config, mode);
    for (const role of SEMANTIC_COLOR_ROLES) {
      const row = checkSolidPair(role, colors[role]!, foregrounds[role]!);
      expect(row, `${label} ${mode} ${role} parsable`).toBeTruthy();
      expect(foregrounds[role]).toBe(intentForegroundForRole(role, mode));
      if (label === "defaultTheme") {
        expect(row!.ratio, `${label} ${mode} ${role} ${row!.ratio}:1`).toBeGreaterThanOrEqual(
          minContrastForIntentRole(role),
        );
      }
    }
    expect(checkAccentHueSeparation(colors), `${label} ${mode} hue gap`).toEqual([]);
  }
}

describe("theme contrast guidelines", () => {
  it("parses percent and unitless oklch lightness", () => {
    expect(parseOklch("oklch(64% 0.18 236)")?.[0]).toBeCloseTo(0.64, 4);
    expect(parseOklch("oklch(0.64 0.18 236)")?.[2]).toBe(236);
  });

  it("maps intent foreground roles", () => {
    expect(intentForegroundForRole("accent", "light")).toBe("var(--vu-snow)");
    expect(intentForegroundForRole("danger", "dark")).toBe("var(--vu-snow)");
    expect(intentForegroundForRole("success", "light")).toBe("var(--vu-eclipse)");
    expect(intentForegroundForRole("default", "dark")).toBe("var(--vu-snow)");
    expect(minContrastForIntentRole("accent")).toBe(AA_LARGE_CONTRAST_RATIO);
    expect(minContrastForIntentRole("success")).toBe(AA_CONTRAST_RATIO);
  });

  it("recommendedForegroundToken stays available for diagnostics", () => {
    expect(recommendedForegroundToken("oklch(0.64 0.18 236)")).toBe("var(--vu-eclipse)");
    expect(recommendedForegroundToken("oklch(0.35 0.12 236)")).toBe("var(--vu-snow)");
  });

  it("startingAccentOklch matches Signal Blue at hue 236", () => {
    expect(startingAccentOklch(236, "light")).toBe("oklch(0.64 0.18 236)");
    expect(startingAccentOklch(236, "dark")).toBe("oklch(0.7 0.14 236)");
  });

  it("rejects a mid-lightness violet that fails AA on both primitives", () => {
    const eclipse = checkSolidPair("accent", "oklch(0.58 0.2 264)", "var(--vu-eclipse)");
    const snow = checkSolidPair("accent", "oklch(0.58 0.2 264)", "var(--vu-snow)");
    expect(eclipse?.ratio).toBeLessThan(AA_CONTRAST_RATIO);
    expect(snow?.ratio).toBeLessThan(AA_CONTRAST_RATIO);
  });

  it("defaultTheme semantic fills pass intent foreground rules", () => {
    expectSheetPasses("defaultTheme", defaultTheme);
  });

  it("showcase presets (except default) pass intent foreground rules and hue separation", () => {
    for (const preset of SHOWCASE_THEME_PRESETS) {
      if (preset.id === "default") continue;
      expectSheetPasses(`showcase:${preset.id}`, createTheme(preset.theme));
    }
  });
});
