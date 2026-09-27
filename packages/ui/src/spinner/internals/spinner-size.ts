import type { VuSpinnerSizePreset } from "../spinner.types.js";

const PRESET_MAP: Record<VuSpinnerSizePreset, string> = {
  xs: "var(--vu-space-3)",
  sm: "var(--vu-space-6)",
  md: "var(--vu-control-height-sm)",
  lg: "var(--vu-control-height-md)",
  xl: "var(--vu-control-height-lg)",
};

const PRESET_KEYS = new Set<string>(Object.keys(PRESET_MAP));

/** True when `size` matches a built-in preset keyword. */
export function isSpinnerSizePreset(size: string): size is VuSpinnerSizePreset {
  return PRESET_KEYS.has(size.trim().toLowerCase());
}

/** Resolves preset keywords, bare numbers, or raw CSS lengths to a size token. */
export function resolveSpinnerSize(size: string): string {
  const raw = size.trim();
  const presetKey = raw.toLowerCase();
  if (PRESET_KEYS.has(presetKey)) return PRESET_MAP[presetKey as VuSpinnerSizePreset];
  if (!raw) return PRESET_MAP.md;
  if (/^\d+$/u.test(raw)) return `${raw}px`;
  return raw;
}

/** Normalizes the speed multiplier (1 = default rate). */
export function normalizeSpinnerSpeed(speed: number): number {
  if (!speed || speed <= 0) return 1;
  return speed;
}

/** Animation period from the speed multiplier (1 ≈ 0.8s per rotation). */
export function spinnerSpeedPeriod(speed: number): string {
  const normalized = normalizeSpinnerSpeed(speed);
  return `${(0.8 / normalized).toFixed(4)}s`;
}
