/** WCAG contrast + OKLCH helpers for shipped palettes. Never eyeball solid fills. */

export type OklchTriple = readonly [l: number, c: number, h: number];
export type LinearRgb = readonly [r: number, g: number, b: number];

export type ContrastLevel = "FAIL" | "AA-LARGE-ONLY" | "AA" | "AAA";

export type ForegroundToken = "var(--vu-eclipse)" | "var(--vu-snow)";

export const SEMANTIC_COLOR_ROLES = ["accent", "danger", "warning", "success"] as const;
export type SemanticColorRole = (typeof SEMANTIC_COLOR_ROLES)[number];

/** Solid intent roles that use the intent foreground map (includes neutral default). */
export type IntentForegroundRole = SemanticColorRole | "default";

/** WCAG AA for normal text on a solid fill (button labels). */
export const AA_CONTRAST_RATIO = 4.5;

/** AA large-text contrast (~3:1) for solid accent/danger on semibold labels. */
export const AA_LARGE_CONTRAST_RATIO = 3;

/** Minimum circular hue gap between accent and danger/warning/success. */
export const MIN_ACCENT_HUE_SEPARATION_DEG = 40;

/** Matches `PRIMITIVES_DEFAULT.eclipse` in theme-core. */
export const ECLIPSE_OKLCH = "oklch(0.27 0.065 285)";
/** Matches `PRIMITIVES_DEFAULT.snow` in theme-core. */
export const SNOW_OKLCH = "oklch(0.9911 0 0)";

const OKLCH_RE = /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*[\d.%]+)?\s*\)/i;

export function parseOklch(value: string): OklchTriple | null {
  const m = OKLCH_RE.exec(value.trim());
  if (!m) return null;
  let l = Number(m[1]);
  if (!Number.isFinite(l)) return null;
  if (m[2] === "%" || l > 1) l /= 100;
  const c = Number(m[3]);
  const h = Number(m[4]);
  if (!Number.isFinite(c) || !Number.isFinite(h)) return null;
  return [l, c, h];
}

/** OKLab → linear sRGB (Björn Ottosson). Out-of-gamut channels clip to 0–1. */
export function oklchToLinearSrgb([L, C, H]: OklchTriple): LinearRgb {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const clip = (ch: number) => Math.min(1, Math.max(0, ch));
  return [clip(r), clip(g), clip(bl)];
}

/** Relative luminance for already-linear sRGB (0–1). Not exported — avoids barrel clash with contrast-color.relativeLuminance. */
function relativeLuminanceLinear(rgb: LinearRgb): number {
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

export function contrastRatio(a: LinearRgb, b: LinearRgb): number {
  const l1 = relativeLuminanceLinear(a);
  const l2 = relativeLuminanceLinear(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export function levelForRatio(ratio: number): ContrastLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= AA_CONTRAST_RATIO) return "AA";
  if (ratio >= 3) return "AA-LARGE-ONLY";
  return "FAIL";
}

export function circularHueDelta(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return Math.min(diff, 360 - diff);
}

const ECLIPSE_RGB = oklchToLinearSrgb(parseOklch(ECLIPSE_OKLCH)!);
const SNOW_RGB = oklchToLinearSrgb(parseOklch(SNOW_OKLCH)!);

export function resolveForegroundRgb(foreground: string): LinearRgb | null {
  const token = foreground.trim();
  if (token === "var(--vu-eclipse)") return ECLIPSE_RGB;
  if (token === "var(--vu-snow)") return SNOW_RGB;
  const parsed = parseOklch(token);
  return parsed ? oklchToLinearSrgb(parsed) : null;
}

export interface SolidPairResult {
  role: string;
  value: string;
  foreground: string;
  ratio: number;
  level: ContrastLevel;
  bestForeground: ForegroundToken;
}

/** Prefer the primitive (eclipse vs snow) with the higher contrast against `value`. */
export function recommendedForegroundToken(value: string): ForegroundToken | null {
  const parsed = parseOklch(value);
  if (!parsed) return null;
  const rgb = oklchToLinearSrgb(parsed);
  const crEclipse = contrastRatio(rgb, ECLIPSE_RGB);
  const crSnow = contrastRatio(rgb, SNOW_RGB);
  return crEclipse >= crSnow ? "var(--vu-eclipse)" : "var(--vu-snow)";
}

/** Solid intent label: snow on accent/danger, eclipse on success/warning. */
export function intentForegroundForRole(
  role: IntentForegroundRole,
  mode: "light" | "dark",
): ForegroundToken {
  if (role === "accent" || role === "danger") return "var(--vu-snow)";
  if (role === "default") return mode === "dark" ? "var(--vu-snow)" : "var(--vu-eclipse)";
  return "var(--vu-eclipse)";
}

/** Minimum contrast ratio for a solid intent role (3:1 on accent/danger). */
export function minContrastForIntentRole(role: SemanticColorRole): number {
  if (role === "accent" || role === "danger") return AA_LARGE_CONTRAST_RATIO;
  return AA_CONTRAST_RATIO;
}

export function checkSolidPair(role: string, value: string, foreground: string): SolidPairResult | null {
  const parsed = parseOklch(value);
  const fgRgb = resolveForegroundRgb(foreground);
  if (!parsed || !fgRgb) return null;
  const rgb = oklchToLinearSrgb(parsed);
  const ratio = Math.round(contrastRatio(rgb, fgRgb) * 100) / 100;
  return {
    role,
    value,
    foreground,
    ratio,
    level: levelForRatio(ratio),
    bestForeground: recommendedForegroundToken(value) ?? "var(--vu-eclipse)",
  };
}

export function checkThemePairs(
  colors: Record<string, string>,
  foregrounds: Record<string, string>,
  roles: readonly string[] = SEMANTIC_COLOR_ROLES,
): SolidPairResult[] {
  const out: SolidPairResult[] = [];
  for (const role of roles) {
    const value = colors[role];
    const fg = foregrounds[role] ?? foregrounds[`${role}Foreground`];
    if (!value || !fg) continue;
    const row = checkSolidPair(role, value, fg);
    if (row) out.push(row);
  }
  return out;
}

/** Accent vs each other semantic role. Danger/warning/success may stay in conventional families. */
export function checkAccentHueSeparation(colors: Record<string, string>): string[] {
  const accent = colors.accent ? parseOklch(colors.accent) : null;
  if (!accent) return [];
  const warnings: string[] = [];
  for (const role of SEMANTIC_COLOR_ROLES) {
    if (role === "accent") continue;
    const parsed = colors[role] ? parseOklch(colors[role]!) : null;
    if (!parsed) continue;
    const delta = circularHueDelta(accent[2], parsed[2]);
    if (delta < MIN_ACCENT_HUE_SEPARATION_DEG) {
      warnings.push(
        `accent (H${accent[2]}) and ${role} (H${parsed[2]}) are only ${delta.toFixed(1)}° apart — keep ≥ ${MIN_ACCENT_HUE_SEPARATION_DEG}°.`,
      );
    }
  }
  return warnings;
}

interface HueFamilyStart {
  hue: number;
  lightL: number;
  lightC: number;
  darkL: number;
  darkC: number;
}

/** Midpoints of the hue-family starting ranges in the theme guidelines. Always validate after. */
const HUE_FAMILY_STARTS: readonly HueFamilyStart[] = [
  { hue: 22, lightL: 0.66, lightC: 0.19, darkL: 0.64, darkC: 0.17 },
  { hue: 78, lightL: 0.79, lightC: 0.15, darkL: 0.82, darkC: 0.13 },
  { hue: 148, lightL: 0.71, lightC: 0.16, darkL: 0.7, darkC: 0.14 },
  { hue: 192, lightL: 0.67, lightC: 0.13, darkL: 0.7, darkC: 0.11 },
  { hue: 236, lightL: 0.64, lightC: 0.18, darkL: 0.7, darkC: 0.14 },
  { hue: 292, lightL: 0.65, lightC: 0.18, darkL: 0.7, darkC: 0.15 },
  { hue: 348, lightL: 0.65, lightC: 0.18, darkL: 0.7, darkC: 0.15 },
];

function nearestHueFamily(hue: number): HueFamilyStart {
  let best = HUE_FAMILY_STARTS[0]!;
  let bestDelta = circularHueDelta(hue, best.hue);
  for (const family of HUE_FAMILY_STARTS) {
    const delta = circularHueDelta(hue, family.hue);
    if (delta < bestDelta) {
      best = family;
      bestDelta = delta;
    }
  }
  return best;
}

function roundToken(n: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

/** Starting accent OKLCH for a brand hue. Tune, then run `npm run check:theme`. */
export function startingAccentOklch(
  hue: number,
  mode: "light" | "dark",
  chromaOverride?: number,
): string {
  const family = nearestHueFamily(hue);
  const h = roundToken(((hue % 360) + 360) % 360, 2);
  if (mode === "light") {
    const c = roundToken(chromaOverride ?? family.lightC);
    return `oklch(${family.lightL} ${c} ${h})`;
  }
  const c = roundToken(chromaOverride != null ? Math.max(chromaOverride * 0.85, 0.1) : family.darkC);
  return `oklch(${family.darkL} ${c} ${h})`;
}
