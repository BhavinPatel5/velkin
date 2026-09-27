/**
 * Canonical `radius` → corner tokens for inline / field controls (roles A, E).
 * `size` never drives corners — only padding, type, and hit target.
 */

/** Public radius presets for A/E controls (`full` replaces the old `pill` prop). */
export type VuControlRadius = "none" | "sm" | "md" | "lg" | "full";

/** CSS var for each radius preset — set on `<vu-theme-provider>` as `--vu-control-radius-*`. */
export const CONTROL_RADIUS_VAR_BY_RADIUS: Record<VuControlRadius, string> = {
  none: "0",
  sm: "var(--vu-control-radius-sm)",
  md: "var(--vu-control-radius-md)",
  lg: "var(--vu-control-radius-lg)",
  full: "var(--vu-radius-full)",
};

/** Resolves a radius string to a control-radius CSS var; unknown values fall back to `md`. */
export function controlRadiusVar(radius: string): string {
  if (radius in CONTROL_RADIUS_VAR_BY_RADIUS) {
    return CONTROL_RADIUS_VAR_BY_RADIUS[radius as VuControlRadius];
  }
  return CONTROL_RADIUS_VAR_BY_RADIUS.md;
}
