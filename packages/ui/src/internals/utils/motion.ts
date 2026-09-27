/** Theme duration token names (`--vu-duration-*`). */
export type MotionDurationToken = "instant" | "fast" | "normal" | "slow";

/** Semantic easing roles mapped to `--vu-ease-*` tokens. */
export type MotionEasingRole = "enter" | "exit" | "interactive";

/** Fallback ms values when theme vars are unavailable (match `vu-theme-core`). */
export const MOTION_DURATION_MS: Record<MotionDurationToken, number> = {
  instant: 0,
  fast: 120,
  normal: 200,
  slow: 300,
};

const MOTION_EASING_FALLBACK: Record<MotionEasingRole, string> = {
  enter: "cubic-bezier(0.32, 0.72, 0, 1)",
  exit: "cubic-bezier(0.645, 0.045, 0.355, 1)",
  interactive: "cubic-bezier(0.215, 0.61, 0.355, 1)",
};

const MOTION_EASING_TOKEN: Record<MotionEasingRole, string> = {
  enter: "out-fluid",
  exit: "in-out-cubic",
  interactive: "out-cubic",
};

/** Media query string for `prefers-reduced-motion: reduce`. */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Reference ms used by popover presets before theme scaling. */
export const POPOVER_PRESET_DURATION_BASE = { enter: 220, exit: 160 } as const;

/** Shared spring curves for overlay / dialog enter (keep in sync with popover presets). */
export const MOTION_SPRING = {
  soft: "cubic-bezier(0.34, 1.28, 0.64, 1)",
  pop: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  exit: "cubic-bezier(0.36, 0, 0.66, -0.4)",
} as const;


/** Returns true when the user prefers reduced motion; SSR-safe. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Zeroes duration when reduced motion is preferred. */
export function motionDurationMs(durationMs: number): number {
  return prefersReducedMotion() ? 0 : durationMs;
}

/** Wires onfinish + timeout fallback for environments with partial WAAPI (e.g. jsdom). */
export function bindAnimationFinish(
  animation: Animation,
  durationMs: number,
  onFinish?: () => void,
): void {
  if (!onFinish) return;
  let settled = false;
  const finish = (): void => {
    if (settled) return;
    settled = true;
    onFinish();
  };
  animation.onfinish = finish;
  if (durationMs === 0) {
    queueMicrotask(finish);
    return;
  }
  setTimeout(finish, durationMs + 50);
}

/** Parses a CSS time value (`120ms`, `0.3s`) into milliseconds. */
export function parseDurationMs(raw: string): number {
  const value = raw.trim();
  if (!value) return 0;
  if (value.endsWith("ms")) return Number.parseFloat(value) || 0;
  if (value.endsWith("s")) return (Number.parseFloat(value) || 0) * 1000;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** Reads a computed custom property from `scope` or `:root`; SSR-safe. */
export function readCssCustomProperty(
  scope: Element | null | undefined,
  name: string,
  fallback = "",
): string {
  if (typeof getComputedStyle === "undefined") return fallback;
  const target = scope ?? document.documentElement;
  const value = getComputedStyle(target).getPropertyValue(name).trim();
  return value || fallback;
}

/** Resolves `--vu-duration-*` from the theme to milliseconds. */
export function readMotionDurationMs(
  scope: Element | null | undefined,
  token: MotionDurationToken = "normal",
): number {
  const fallback = `${MOTION_DURATION_MS[token]}ms`;
  const raw = readCssCustomProperty(scope, `--vu-duration-${token}`, fallback);
  return parseDurationMs(raw);
}

/** Resolves a theme time token (`--vu-tooltip-delay`, etc.) to milliseconds. */
export function readThemeTimeMs(
  scope: Element | null | undefined,
  tokenKebab: string,
  fallbackMs: number,
): number {
  const raw = readCssCustomProperty(scope, `--vu-${tokenKebab}`, `${fallbackMs}ms`);
  return parseDurationMs(raw);
}

/** Resolves `--vu-ease-*` from the theme for enter, exit, or interactive motion. */
export function readMotionEasing(
  scope: Element | null | undefined,
  role: MotionEasingRole,
): string {
  const token = MOTION_EASING_TOKEN[role];
  return readCssCustomProperty(scope, `--vu-ease-${token}`, MOTION_EASING_FALLBACK[role]);
}

/** Scales a popover preset duration to the active theme token ms. */
export function resolvePopoverDurationMs(
  scope: Element | null | undefined,
  phase: "open" | "close",
  presetMs: number,
): number {
  const token = phase === "open" ? "normal" : "fast";
  const base =
    phase === "open" ? POPOVER_PRESET_DURATION_BASE.enter : POPOVER_PRESET_DURATION_BASE.exit;
  const themeMs = readMotionDurationMs(scope, token);
  return motionDurationMs(Math.round(themeMs * (presetMs / base)));
}

/** Named presets keep their registry easing; theme tokens are the fallback only. */
export function resolvePopoverEasing(
  _scope: Element | null | undefined,
  _phase: "open" | "close",
  _preset: string,
  presetEasing: string,
): string {
  return presetEasing;
}
