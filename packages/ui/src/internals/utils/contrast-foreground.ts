import { resolveCssColor } from "./color-conversion.js";
import { parseOklch, recommendedForegroundToken } from "./theme-contrast.js";

/** Approximate WCAG relative luminance from an oklch L channel when RGB parse is unavailable. */
function foregroundFromOklchLightness(colorCss: string): string | null {
  const match = colorCss.trim().match(/oklch\(\s*([\d.]+)\s*%?/i);
  if (!match) return null;
  const raw = Number(match[1]);
  if (!Number.isFinite(raw)) return null;
  const lightness = raw > 1 ? raw / 100 : raw;
  return lightness > 0.55 ? "var(--vu-eclipse)" : "var(--vu-snow)";
}

/** Dark or light primitive text token by WCAG contrast of the given color. */
export function autoForegroundFor(colorCss: string, host?: HTMLElement): string {
  const fromOklch = parseOklch(colorCss) ? recommendedForegroundToken(colorCss) : null;
  if (fromOklch) return fromOklch;

  const parsed = resolveCssColor(colorCss, host);
  if (parsed) {
    const channel = (v: number) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const { r, g, b } = parsed.rgb;
    const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    return luminance > 0.45 ? "var(--vu-eclipse)" : "var(--vu-snow)";
  }
  return foregroundFromOklchLightness(colorCss) ?? "var(--vu-snow)";
}
