/**
 * Neutral surface weight for components that paint a background but have no `color`
 * intent prop — use with `variant` (structure) + `tone` (surface stack depth).
 */

import { devWarnInvalidPropValue } from "./dev-warn.js";

/** Background weight on the neutral surface stack. */
export type VuSurfaceTone = "subtle" | "normal" | "strong";

const SURFACE_SECONDARY_HOVER =
  "color-mix(in oklab, var(--vu-color-surface-secondary) 92%, var(--vu-color-surface-secondary-foreground) 8%)";
const SURFACE_SECONDARY_ACTIVE =
  "color-mix(in oklab, var(--vu-color-surface-secondary) 84%, var(--vu-color-surface-secondary-foreground) 16%)";
const SURFACE_TERTIARY_HOVER =
  "color-mix(in oklab, var(--vu-color-surface-tertiary) 92%, var(--vu-color-surface-tertiary-foreground) 8%)";
const SURFACE_TERTIARY_ACTIVE =
  "color-mix(in oklab, var(--vu-color-surface-tertiary) 84%, var(--vu-color-surface-tertiary-foreground) 16%)";

/** CSS background/foreground pairs for the neutral surface stack. */
export const SURFACE_TONE_BG_VAR: Record<VuSurfaceTone, string> = {
  subtle: "var(--vu-color-surface-secondary)",
  normal: "var(--vu-color-surface)",
  strong: "var(--vu-color-surface-tertiary)",
};

export const SURFACE_TONE_FG_VAR: Record<VuSurfaceTone, string> = {
  subtle: "var(--vu-color-surface-secondary-foreground)",
  normal: "var(--vu-color-surface-foreground)",
  strong: "var(--vu-color-surface-tertiary-foreground)",
};

/** Hover channel paired with each `tone` bg — use for rows/triggers on neutral surfaces. */
export const SURFACE_TONE_HOVER_VAR: Record<VuSurfaceTone, string> = {
  subtle: SURFACE_SECONDARY_HOVER,
  normal: "var(--vu-color-surface-hover)",
  strong: SURFACE_TERTIARY_HOVER,
};

/** Pressed channel paired with each `tone` bg. */
export const SURFACE_TONE_ACTIVE_VAR: Record<VuSurfaceTone, string> = {
  subtle: SURFACE_SECONDARY_ACTIVE,
  normal: "var(--vu-color-surface-active)",
  strong: SURFACE_TERTIARY_ACTIVE,
};

const TONES = new Set<string>(["subtle", "normal", "strong"]);
const TONE_LIST = ["subtle", "normal", "strong"] as const;

/** One-step contrast for fields nested on a `tone` chrome surface (toolbar, filter card). */
export function nestedFieldTone(tone: VuSurfaceTone): VuSurfaceTone {
  return tone === "strong" ? "normal" : "strong";
}

/** Returns a tone value safe for CSS attribute selectors; unknown values fall back to `normal`. */
export function normalizeSurfaceTone(tone: string, host?: Element): VuSurfaceTone {
  if (TONES.has(tone)) return tone as VuSurfaceTone;
  if (host) {
    devWarnInvalidPropValue(host, "tone", tone, TONE_LIST, "normal");
  }
  return "normal";
}
