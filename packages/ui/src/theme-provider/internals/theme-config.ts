import { rgbToHsv, resolveCssColor } from "../../internals/utils/color-conversion.js";
import { intentForegroundForRole } from "../../internals/utils/intent-foreground.js";
import type { PartialTheme, ThemeModeConfig } from "./theme-core.js";

/** Default accent hue when a seed color cannot be parsed (matches `defaultTheme` / Kinetic). */
export const DEFAULT_BRAND_HUE = 41;

const DEFAULT_ACCENT_CHROMA = 0.18;

/** How strongly the neutral hue tints backgrounds, surfaces, and lines. */
export type VuThemeTint = "none" | "subtle" | "vivid";

/** Author-facing knobs; foregrounds, surfaces, lines, and elevation derive from these. */
export interface VuThemeSeeds {
  /** Brand color (any CSS color) — drives accent, focus, link, and the neutral tint hue. */
  primary?: string;
  /** Neutral hue for surfaces and lines: CSS color or hue number. Defaults to `primary`'s hue. */
  neutral?: string | number;
  /** Success intent color; the shipped contrast-checked default is used when omitted. */
  success?: string;
  /** Warning intent color; the shipped contrast-checked default is used when omitted. */
  warning?: string;
  /** Danger intent color; the shipped contrast-checked default is used when omitted. */
  danger?: string;
  /** Base corner radius (`--vu-radius`); every `--vu-radius-*` step derives from it. */
  radius?: string;
  /** Base spacing unit (`--vu-spacing`); every `--vu-space-*` step derives from it. */
  spacing?: string;
  /** Neutral tint strength. Default `"subtle"` once a palette seed is present. */
  tint?: VuThemeTint;
  /** Body font stack (`--vu-font-sans`). */
  fontSans?: string;
  /** Monospace font stack (`--vu-font-mono`). */
  fontMono?: string;
}

/** Raw `--vu-*` overrides per mode — the one escape hatch for tokens the seeds do not cover. */
export type VuThemeVars = {
  light?: Record<string, string>;
  dark?: Record<string, string>;
};

/** Minimal theme config: shared seeds, optional per-mode seeds, and a raw `vars` escape hatch. */
export interface VuThemeConfig extends VuThemeSeeds {
  /** Seed overrides applied to the light sheet only. */
  light?: VuThemeSeeds;
  /** Seed overrides applied to the dark sheet only. */
  dark?: VuThemeSeeds;
  /** Advanced raw `--vu-*` values applied after every derived token. */
  vars?: VuThemeVars;
}

type ModePatch = Partial<ThemeModeConfig>;

type NeutralKey =
  | "background"
  | "foreground"
  | "surface"
  | "surfaceSecondary"
  | "surfaceTertiary"
  | "overlay"
  | "muted"
  | "default"
  | "border"
  | "separator"
  | "segment"
  | "fieldBackground";

/** Neutral ramp anchored on `defaultTheme` lightness so seeded themes stay close to the shipped look. */
type NeutralRamp = Partial<Record<NeutralKey, { l: number; tint: number }>>;

const NEUTRAL_LIGHT: NeutralRamp = {
  background: { l: 0.95, tint: 1.6 },
  surfaceSecondary: { l: 0.975, tint: 0.8 },
  surfaceTertiary: { l: 0.91, tint: 2 },
  default: { l: 0.85, tint: 2 },
  border: { l: 0.86, tint: 2.4 },
  separator: { l: 0.89, tint: 1.8 },
  muted: { l: 0.563, tint: 6.5 },
  foreground: { l: 0.27, tint: 10.8 },
};

const NEUTRAL_DARK: NeutralRamp = {
  background: { l: 0.12, tint: 1.6 },
  surface: { l: 0.2103, tint: 2 },
  surfaceSecondary: { l: 0.17, tint: 1.8 },
  surfaceTertiary: { l: 0.27, tint: 2 },
  overlay: { l: 0.2103, tint: 2 },
  default: { l: 0.37, tint: 2.4 },
  border: { l: 0.28, tint: 2.4 },
  separator: { l: 0.25, tint: 2 },
  muted: { l: 0.648, tint: 0.35 },
  segment: { l: 0.3964, tint: 2 },
  fieldBackground: { l: 0.18, tint: 2 },
};

const TINT_BASE_CHROMA: Record<VuThemeTint, number> = {
  none: 0,
  subtle: 0.006,
  vivid: 0.018,
};

/** Keeps tinted neutrals from reading as a colored wash. */
const MAX_NEUTRAL_CHROMA = 0.06;

const OKLCH_HUE_RE = /oklch\(\s*[\d.]+%?\s+[\d.]+\s+([\d.]+)(?:deg)?(?:\s*\/\s*[\d.%]+)?\s*\)/i;

/** Extract hue (0–360) from an oklch/hsl string or via RGB conversion; falls back to `DEFAULT_BRAND_HUE`. */
export function extractBrandHue(colorCss: string, host?: HTMLElement): number {
  const trimmed = colorCss.trim();
  const oklch = OKLCH_HUE_RE.exec(trimmed);
  if (oklch) {
    const h = Number(oklch[1]);
    if (Number.isFinite(h)) return ((h % 360) + 360) % 360;
  }
  const hsl = trimmed.match(/hsla?\(\s*([\d.]+)/i);
  if (hsl) {
    const h = Number(hsl[1]);
    if (Number.isFinite(h)) return ((h % 360) + 360) % 360;
  }
  const parsed = resolveCssColor(trimmed, host);
  if (parsed) return rgbToHsv(parsed.rgb).h;
  return DEFAULT_BRAND_HUE;
}

/** Parse chroma from an oklch color; falls back to `DEFAULT_ACCENT_CHROMA`. */
function extractChroma(colorCss: string): number {
  const m = colorCss.trim().match(/oklch\(\s*[\d.]+%?\s+([\d.]+)/i);
  if (!m) return DEFAULT_ACCENT_CHROMA;
  const c = Number(m[1]);
  return Number.isFinite(c) ? c : DEFAULT_ACCENT_CHROMA;
}

/** Parse lightness (0–1) from an oklch color. */
function extractLightness(colorCss: string): number | null {
  const m = colorCss.trim().match(/oklch\(\s*([\d.]+)(%?)/i);
  if (!m) return null;
  const raw = Number(m[1]);
  if (!Number.isFinite(raw)) return null;
  return m[2] === "%" || raw > 1 ? raw / 100 : raw;
}

function round(value: number, precision = 3): number {
  const f = 10 ** precision;
  return Math.round(value * f) / f;
}

function oklch(lightness: number, chroma: number, hue: number): string {
  if (chroma <= 0) return `oklch(${round(lightness, 4)} 0 0)`;
  return `oklch(${round(lightness, 4)} ${round(chroma)} ${round(hue, 2)})`;
}

/** Dark-mode accent: lift lightness into the readable band; non-oklch seeds pass through. */
function liftAccentForDark(accent: string): string {
  const lightness = extractLightness(accent);
  if (lightness === null) return accent;
  const next = Math.min(Math.max(lightness + 0.1, 0.55), 0.78);
  return accent.replace(/oklch\(\s*[\d.]+%?/i, `oklch(${round(next, 4)}`);
}

function neutralHueFor(seeds: VuThemeSeeds, host?: HTMLElement): number {
  if (typeof seeds.neutral === "number") return ((seeds.neutral % 360) + 360) % 360;
  if (typeof seeds.neutral === "string" && seeds.neutral.trim()) {
    return extractBrandHue(seeds.neutral, host);
  }
  if (seeds.primary?.trim()) return extractBrandHue(seeds.primary, host);
  return DEFAULT_BRAND_HUE;
}

function hasPaletteSeed(seeds: VuThemeSeeds): boolean {
  return !!seeds.primary?.trim() || seeds.neutral !== undefined || seeds.tint !== undefined;
}

function applyIntent(
  patch: ModePatch,
  mode: "light" | "dark",
  key: "success" | "warning" | "danger",
  value: string | undefined,
): void {
  if (!value) return;
  patch[key] = value;
  patch[`${key}Foreground`] = intentForegroundForRole(key, mode);
}

/** Derive one mode's token patch from seeds; unseeded tokens keep their `defaultTheme` value. */
function deriveMode(
  mode: "light" | "dark",
  seeds: VuThemeSeeds,
  /** Lifts the shared `primary` into the dark-readable band; skipped for an explicit `dark.primary`. */
  liftAccent: boolean,
  host?: HTMLElement,
): ModePatch {
  const patch: ModePatch = {};

  if (seeds.radius) patch.radius = seeds.radius;
  if (seeds.spacing) patch.spacing = seeds.spacing;
  applyIntent(patch, mode, "success", seeds.success);
  applyIntent(patch, mode, "warning", seeds.warning);
  applyIntent(patch, mode, "danger", seeds.danger);

  const primary = seeds.primary?.trim();
  if (primary) {
    const accent = liftAccent ? liftAccentForDark(primary) : primary;
    patch.accent = accent;
    patch.accentForeground = intentForegroundForRole("accent", mode);

    const accentHue = extractBrandHue(primary, host);
    const accentChroma = extractChroma(primary);
    patch.link =
      mode === "dark"
        ? oklch(0.8, Math.min(accentChroma * 0.6, 0.12), accentHue)
        : oklch(0.45, Math.min(accentChroma * 0.8, 0.16), accentHue);
  }

  if (!hasPaletteSeed(seeds)) return patch;

  const hue = neutralHueFor(seeds, host);
  const base = TINT_BASE_CHROMA[seeds.tint ?? "subtle"];
  const ramp = mode === "dark" ? NEUTRAL_DARK : NEUTRAL_LIGHT;

  for (const [key, step] of Object.entries(ramp) as [NeutralKey, { l: number; tint: number }][]) {
    patch[key] = oklch(step.l, Math.min(base * step.tint, MAX_NEUTRAL_CHROMA), hue);
  }

  if (mode === "light") {
    patch.fieldForeground = patch.foreground;
    patch.segmentForeground = patch.foreground;
  }

  return patch;
}

/** Extra `--vu-*` values that live outside `ThemeModeConfig` (fonts). */
function deriveExtraVars(seeds: VuThemeSeeds): Record<string, string> {
  const vars: Record<string, string> = {};
  if (seeds.fontSans) vars["--vu-font-sans"] = seeds.fontSans;
  if (seeds.fontMono) vars["--vu-font-mono"] = seeds.fontMono;
  return vars;
}

function seedsForMode(config: VuThemeConfig, mode: "light" | "dark"): VuThemeSeeds {
  const { light, dark, vars, ...shared } = config;
  return { ...shared, ...(mode === "dark" ? dark : light) };
}

/** Expand a `VuThemeConfig` into per-mode token patches plus the raw vars to apply last. */
export function expandThemeConfig(
  config: VuThemeConfig = {},
  host?: HTMLElement,
): { tokens: PartialTheme; vars: VuThemeVars } {
  const lightSeeds = seedsForMode(config, "light");
  const darkSeeds = seedsForMode(config, "dark");

  return {
    tokens: {
      light: deriveMode("light", lightSeeds, false, host),
      dark: deriveMode("dark", darkSeeds, false, host),
    },
    vars: {
      light: { ...deriveExtraVars(lightSeeds), ...config.vars?.light },
      dark: { ...deriveExtraVars(darkSeeds), ...config.vars?.dark },
    },
  };
}
