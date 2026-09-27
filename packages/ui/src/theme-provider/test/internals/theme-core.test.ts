import { expect } from "vitest";
import {
  createTheme,
  DEFAULT_FONT_SANS,
  defaultTheme,
  expandThemeConfig,
  generateVarMap,
  getDefaultThemeStylesheet,
  mergeTheme,
  resolveModeVars,
  themeTokensToVars,
  VU_GLASS_CSS,
} from "../../internals/theme-core.js";

describe("theme-core", () => {
  it("ships default sans and mono font tokens", () => {
    const vars = generateVarMap(defaultTheme.light, "light");
    expect(vars["font-sans"]).toBe(DEFAULT_FONT_SANS);
    expect(vars["font-mono"]).toContain("ui-monospace");
  });

  it("emits semantic colors as --vu-color-* tokens", () => {
    const vars = generateVarMap(defaultTheme.light, "light");
    expect(vars["color-background"]).toBe("#f4f3ef");
    expect(vars["color-foreground"]).toBe("#12141a");
    expect(vars["color-accent"]).toBe("oklch(0.68 0.22 41)");
    expect(vars.background).toBeUndefined();
    expect(vars.foreground).toBeUndefined();
    expect(vars.accent).toBeUndefined();
  });

  it("keeps default color on the component-neutral scale", () => {
    const light = generateVarMap(defaultTheme.light, "light");
    const dark = generateVarMap(defaultTheme.dark, "dark");
    expect(light["color-default"]).toBe("oklch(0.92 0.01 95)");
    expect(dark["color-default"]).toBe("oklch(0.28 0.02 275)");
  });

  it("maps control heights and surface radii", () => {
    const vars = generateVarMap(defaultTheme.light, "light");
    expect(vars["control-height-sm"]).toBe("calc(var(--vu-spacing) * 8)");
    expect(vars["control-height-md"]).toBe("calc(var(--vu-spacing) * 9)");
    expect(vars["control-height-lg"]).toBe("calc(var(--vu-spacing) * 10)");
    expect(vars["min-touch-target"]).toBe("var(--vu-control-height-md)");
    expect(vars["radius-field"]).toBe("var(--vu-control-radius-md)");
    expect(vars["radius-surface"]).toBe("var(--vu-radius-2xl)");
    expect(vars["radius-overlay"]).toBe("var(--vu-radius-2xl)");
    expect(vars["control-radius-sm"]).toBe("var(--vu-radius-md)");
    expect(vars["control-radius-md"]).toBe("var(--vu-radius-xl)");
    expect(vars["control-radius-lg"]).toBe("calc(var(--vu-radius) * 1.75)");
  });

  it("emits shadows and field layout under canonical names", () => {
    const vars = generateVarMap(defaultTheme.light, "light");
    expect(vars["shadow-surface"]).toContain("rgba");
    expect(vars["color-field"]).toBe("var(--vu-white)");
    expect(vars["border-width-field"]).toBe("0px");
    expect(vars.radius).toBe("0.5rem");
    expect(vars["radius-4xl"]).toBe("calc(var(--vu-radius) * 4)");
    expect(vars["tooltip-delay"]).toBe("1500ms");
    expect(vars["tooltip-close-delay"]).toBe("500ms");
    expect(vars["scrollbar-thumb"]).toBe("var(--vu-color-scrollbar)");
    expect(vars["scrollbar-width"]).toBe("thin");
    expect(vars["color-accent-soft-foreground"]).toContain("70%");
  });

  it("emits dark-mode soft variants separately from light", () => {
    const light = generateVarMap(defaultTheme.light, "light");
    const dark = generateVarMap(defaultTheme.dark, "dark");
    expect(light["color-accent-soft"]).toContain("15%");
    expect(dark["color-accent-soft"]).toContain("12%");
  });

  it("emits blur scale and opaque-by-default glass switches", () => {
    const vars = generateVarMap(defaultTheme.light, "light");
    expect(vars["blur-none"]).toBe("0");
    expect(vars["blur-sm"]).toBe("4px");
    expect(vars["blur-md"]).toBe("12px");
    expect(vars["blur-lg"]).toBe("20px");
    expect(vars["glass-fill"]).toBe("65%");
    expect(vars["surface-blur"]).toBe("var(--vu-blur-none)");
    expect(vars["overlay-blur"]).toBe("var(--vu-blur-md)");
    expect(vars["surface-fill"]).toBe("100%");
    expect(vars["overlay-fill"]).toBe("85%");
    expect(vars["background-gradient"]).toBe("none");
  });

  it("mergeTheme accepts flat ThemeModeConfig overrides only", () => {
    const merged = mergeTheme({
      light: { accent: "#3366ff" },
      dark: { accent: "#2244cc" },
    });
    expect(merged.light.accent).toBe("#3366ff");
    expect(merged.dark.accent).toBe("#2244cc");
  });

  it("createTheme without seeds keeps the shipped defaults", () => {
    const theme = createTheme();
    expect(theme.light).toEqual(defaultTheme.light);
    expect(theme.dark).toEqual(defaultTheme.dark);
  });

  it("derives a tinted palette and intent foregrounds from primary", () => {
    const theme = createTheme({ primary: "oklch(0.58 0.2 264)" });
    expect(theme.light.accent).toBe("oklch(0.58 0.2 264)");
    expect(theme.light.background).toBe("oklch(0.95 0.01 264)");
    expect(theme.light.surfaceSecondary).toContain("264");
    expect(theme.light.accentForeground).toBe("var(--vu-snow)");
    expect(theme.dark.background).toContain("264");
    expect(theme.dark.accent).toBe("oklch(0.58 0.2 264)");
    expect(theme.dark.accentForeground).toBe("var(--vu-snow)");
  });

  it("keeps neutrals achromatic at tint none and honours a separate neutral hue", () => {
    const flat = createTheme({ primary: "oklch(0.58 0.2 264)", tint: "none" });
    expect(flat.light.background).toBe("oklch(0.95 0 0)");
    const split = createTheme({ primary: "oklch(0.58 0.2 264)", neutral: 120 });
    expect(split.light.surfaceSecondary).toContain("120");
    expect(split.light.accent).toBe("oklch(0.58 0.2 264)");
  });

  it("applies per-mode seeds and only the seeded intents", () => {
    const theme = createTheme({
      primary: "oklch(0.58 0.2 264)",
      danger: "oklch(0.6 0.22 25)",
      dark: { primary: "oklch(0.74 0.16 264)" },
    });
    expect(theme.dark.accent).toBe("oklch(0.74 0.16 264)");
    expect(theme.light.danger).toBe("oklch(0.6 0.22 25)");
    expect(theme.light.success).toBe(defaultTheme.light.success);
  });

  it("resolves raw vars last, accepting prefixed or bare names", () => {
    const theme = createTheme({
      primary: "oklch(0.58 0.2 264)",
      fontSans: "Inter, sans-serif",
      vars: { light: { "--vu-color-accent": "#ff00aa", "color-separator": "#eee" } },
    });
    const vars = resolveModeVars(theme, "light");
    expect(vars["color-accent"]).toBe("#ff00aa");
    expect(vars["color-accent-foreground"]).toBe("var(--vu-snow)");
    expect(vars["color-separator"]).toBe("#eee");
    expect(vars["font-sans"]).toBe("Inter, sans-serif");
  });

  it("does not patch intent foreground when vars override both fill and foreground", () => {
    const theme = createTheme({
      vars: {
        light: {
          "color-accent": "#112233",
          "color-accent-foreground": "var(--vu-snow)",
        },
      },
    });
    const vars = resolveModeVars(theme, "light");
    expect(vars["color-accent"]).toBe("#112233");
    expect(vars["color-accent-foreground"]).toBe("var(--vu-snow)");
  });

  it("patches all solid intent foregrounds when vars override fills only", () => {
    const theme = createTheme({
      vars: {
        light: {
          "color-accent": "oklch(0.64 0.18 236)",
          "color-danger": "oklch(0.35 0.18 25)",
        },
      },
    });
    const vars = resolveModeVars(theme, "light");
    expect(vars["color-accent-foreground"]).toBe("var(--vu-snow)");
    expect(vars["color-danger-foreground"]).toBe("var(--vu-snow)");
  });

  it("expandThemeConfig emits only the seeded keys", () => {
    const { tokens } = expandThemeConfig({ radius: "1rem" });
    expect(tokens.light?.radius).toBe("1rem");
    expect(tokens.light?.accent).toBeUndefined();
  });

  it("themeTokensToVars maps token keys to canonical --vu-* names", () => {
    const vars = themeTokensToVars({ fieldBackground: "#fff", surfaceShadow: "none" });
    expect(vars["--vu-color-field"]).toBe("#fff");
    expect(vars["--vu-shadow-surface"]).toBe("none");
  });

  it("builds dark elevation from black casts plus a faint rim, never a white glow", () => {
    const dark = generateVarMap(defaultTheme.dark, "dark");
    expect(dark["shadow-ambient"]).toBe("rgba(0, 0, 0, 0.45)");
    expect(dark["shadow-key"]).toBe("rgba(0, 0, 0, 0.6)");
    expect(dark["shadow-rim"]).toBe("rgba(255, 255, 255, 0.06)");
    for (const key of ["shadow-surface", "shadow-overlay", "shadow-field"]) {
      expect(dark[key]).not.toMatch(/rgba\(255/);
      expect(dark[key]).not.toContain("--vu-color-foreground");
    }
    expect(generateVarMap(defaultTheme.light, "light")["shadow-rim"]).toBe("transparent");
  });

  it("keeps glass elevation off the foreground so dark mode stays black-cast", () => {
    expect(VU_GLASS_CSS).not.toContain("--vu-color-foreground");
    expect(VU_GLASS_CSS).toContain("var(--vu-shadow-key)");
  });

  it("keeps authored intent foregrounds in the default stylesheet", () => {
    const css = getDefaultThemeStylesheet();
    expect(css).not.toContain("contrast-color(");
    expect(css).toContain("--vu-color-accent-foreground:var(--vu-snow)");
    expect(css).toContain("--vu-color-success-foreground:var(--vu-eclipse)");
    expect(css).toContain("--vu-color-danger-foreground:var(--vu-snow)");
  });
});
