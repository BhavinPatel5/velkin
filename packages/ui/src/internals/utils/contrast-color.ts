/**
 * CSS `contrast-color()` helpers for solid fills, plus JS luminance helpers
 * for canvas / SVG / preview surfaces where native CSS contrast cannot apply.
 *
 * Use only on opaque / solid surfaces. Soft tints, glass, and hover washes
 * should keep theme ink tokens (`--vu-color-foreground`, soft semantic darks).
 *
 * Always declare a CSS fallback first; wrap the enhance rule in `@supports`.
 *
 * 
 */

export type RgbChannels = { r: number; g: number; b: number };

/**
 * Parse `#rgb` / `#rrggbb` / `rgb()` / `rgba()` into 0–255 channels.
 * Returns `null` for CSS vars, named colors, oklch, etc.
 */
export function parseCssRgb(color: string): RgbChannels | null {
  const trimmed = color.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      if ([r, g, b].some((n) => Number.isNaN(n))) return null;
      return { r, g, b };
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if ([r, g, b].some((n) => Number.isNaN(n))) return null;
      return { r, g, b };
    }
    return null;
  }

  const m = trimmed.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i,
  );
  if (!m) return null;
  return {
    r: Math.min(255, Math.max(0, Number(m[1]))),
    g: Math.min(255, Math.max(0, Number(m[2]))),
    b: Math.min(255, Math.max(0, Number(m[3]))),
  };
}

/**
 * Rec.601 perceived luminance in 0–1 (matches historical chart/theme-gen usage).
 */
export function perceivedLuminance(rgb: RgbChannels): number {
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

function srgbChannelToLinear(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG 2.1 relative luminance in 0–1. */
export function relativeLuminance(rgb: RgbChannels): number {
  return (
    0.2126 * srgbChannelToLinear(rgb.r) +
    0.7152 * srgbChannelToLinear(rgb.g) +
    0.0722 * srgbChannelToLinear(rgb.b)
  );
}

export type LuminanceMode = "perceived" | "wcag";

function luminanceOf(
  rgb: RgbChannels,
  mode: LuminanceMode = "perceived",
): number {
  return mode === "wcag" ? relativeLuminance(rgb) : perceivedLuminance(rgb);
}

/**
 * True when the fill is “light” enough that dark FG/overlays read better.
 * Unparseable colors return `false` (assume dark fill / light FG).
 */
export function isLightFill(
  color: string,
  threshold = 0.5,
  mode: LuminanceMode = "perceived",
): boolean {
  const rgb = parseCssRgb(color);
  if (!rgb) return false;
  return luminanceOf(rgb, mode) > threshold;
}

export type ContrastOnFillOptions = {
  /** Returned / used when the fill is light. */
  onLight?: string;
  /** Returned / used when the fill is dark. */
  onDark?: string;
  /** Luminance cutover. Default `0.5`. */
  threshold?: number;
  /** Default `perceived` (Rec.601). Use `wcag` for AA-aligned picks. */
  mode?: LuminanceMode;
  /** When parse fails. Defaults to `onDark`. */
  fallback?: string;
};

/**
 * Pick an opaque FG string for canvas / SVG paints against a solid fill.
 * Defaults: black on light fills, white on dark fills.
 */
export function contrastOnFill(
  color: string,
  options: ContrastOnFillOptions = {},
): string {
  const {
    onLight = "#000000",
    onDark = "#ffffff",
    threshold = 0.5,
    mode = "perceived",
    fallback = onDark,
  } = options;
  const rgb = parseCssRgb(color);
  if (!rgb) return fallback;
  return luminanceOf(rgb, mode) > threshold ? onLight : onDark;
}

/**
 * Semi-transparent overlay for patterns / ripples on a solid fill.
 */
export function contrastOverlay(
  color: string,
  options: ContrastOnFillOptions = {},
): string {
  return contrastOnFill(color, {
    onLight: "rgba(0,0,0,0.55)",
    onDark: "rgba(255,255,255,0.6)",
    threshold: 0.5,
    mode: "perceived",
    ...options,
  });
}

/**
 * Theme preview ink: primary on light swatches, inverse on dark.
 * Unparseable / non-hex CSS values fall back to `onLight` (theme text).
 */
export function contrastThemeInk(
  color: string,
  options: ContrastOnFillOptions = {},
): string {
  return contrastOnFill(color, {
    onLight: "var(--vu-color-foreground)",
    onDark: "var(--vu-color-foreground)",
    threshold: 0.6,
    mode: "perceived",
    fallback: "var(--vu-color-foreground)",
    ...options,
  });
}

/** Feature query used by every `@supports` enhance block. */
export const CONTRAST_COLOR_SUPPORT_QUERY = "(color: contrast-color(red))" as const;

/** Fallback FG when the fill is assumed dark (most brand solids / no-@supports). */
export const ON_COLOR_FALLBACK_LIGHT = "var(--vu-snow)" as const;

/** Fallback FG when a JS luminance check finds a light fill (canvas / SVG only). */
export const ON_COLOR_FALLBACK_DARK = "var(--vu-eclipse)" as const;

function asCssVarRef(fillVar: string): string {
  const trimmed = fillVar.trim();
  if (trimmed.startsWith("var(")) return trimmed;
  if (trimmed.startsWith("--")) return `var(${trimmed})`;
  return trimmed;
}

/**
 * Returns `contrast-color(var(--fill))` (or `contrast-color(<color>)`).
 */
export function cssContrastColor(fillVar: string): string {
  return `contrast-color(${asCssVarRef(fillVar)})`;
}

export type CssOnFillOptions = {
  /**
   * Selector whose `color` should follow the fill
   * (e.g. `.chip`, `button`, `:host([variant="solid"]) button`).
   */
  selector: string;
  /**
   * Fill custom property or `var()` expression to contrast against
   * (e.g. `--chip-bg-color`, `var(--btn-bg-color)`).
   */
  fillVar: string;
  /**
   * Pre-`@supports` fallback. Defaults to on-color light (white) token.
   * Pass `false` to omit the fallback declaration (when the selector already sets `color`).
   */
  fallback?: string | false;
  /**
   * Appended to `selector` inside `@supports` only
   * (e.g. `:not([data-text-explicit])`).
   */
  enhanceSuffix?: string;
  /** CSS property to set. Default `color`. */
  property?: string;
};

/**
 * Fallback-first + `@supports` enhance block for a solid fill foreground.
 *
 */
export function cssOnFill(options: CssOnFillOptions): string {
  const {
    selector,
    fillVar,
    fallback = ON_COLOR_FALLBACK_LIGHT,
    enhanceSuffix = "",
    property = "color",
  } = options;

  const fill = asCssVarRef(fillVar);
  const enhanceSelector = `${selector}${enhanceSuffix}`;
  const fallbackRule =
    fallback === false
      ? ""
      : `${selector} {\n  ${property}: ${fallback};\n}\n`;

  return `${fallbackRule}@supports ${CONTRAST_COLOR_SUPPORT_QUERY} {
  ${enhanceSelector} {
    ${property}: ${cssContrastColor(fill)};
  }
}`;
}

/**
 * Multi-rule `@supports` enhance only (no fallback declarations).
 * Use when selectors already set fallback `color` via other rules / inline vars.
 *
 */
export function cssOnFillEnhance(
  rules: Array<{
    selector: string;
    fillVar: string;
    property?: string;
  }>,
): string {
  if (!rules.length) return "";

  const body = rules
    .map(({ selector, fillVar, property = "color" }) => {
      return `  ${selector} {\n    ${property}: ${cssContrastColor(fillVar)};\n  }`;
    })
    .join("\n");

  return `@supports ${CONTRAST_COLOR_SUPPORT_QUERY} {\n${body}\n}`;
}
