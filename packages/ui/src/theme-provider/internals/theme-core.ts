import { canUseDocument, isClient } from "../../internals/utils/env.js";
import {
  INTENT_FILL_KEY_TO_ROLE,
  intentForegroundForRole,
} from "../../internals/utils/intent-foreground.js";
import { expandThemeConfig, type VuThemeConfig, type VuThemeVars } from "./theme-config.js";

export type { VuThemeConfig, VuThemeSeeds, VuThemeTint, VuThemeVars } from "./theme-config.js";
export { expandThemeConfig, extractBrandHue, DEFAULT_BRAND_HUE } from "./theme-config.js";

/** Theme tokens (`--vu-*`), merge helpers, static CSS (SSR-safe); use `<vu-theme-provider>` in the browser. */
export const VU_CSS_VAR_PREFIX = "vu" as const;

/** Resolved light + dark token sheets plus the raw `--vu-*` overrides applied last. */
export interface ThemeConfig {
  light: ThemeModeConfig;
  dark: ThemeModeConfig;
  vars?: VuThemeVars;
}

/** Stored or UI preference: fixed mode or follow OS (`system`). */
export type ThemePreference = "light" | "dark" | "system";

/** Advanced per-mode token patch; authors use `VuThemeConfig`, tooling patches tokens directly. */
export type PartialTheme = Partial<{
  light: Partial<ThemeModeConfig>;
  dark: Partial<ThemeModeConfig>;
}>;

/** One mode: primitives, semantic colors, and layout tokens (`LAYOUT_DEFAULT` fills gaps in defaults). */
export interface ThemeModeConfig {
  primitives: {
    white: string;
    black: string;
    snow: string;
    eclipse: string;
  };
  spacing: string;
  borderWidth: string;
  fieldBorderWidth: string;
  disabledOpacity: string;
  ringOffsetWidth: string;
  cursorInteractive: string;
  cursorDisabled: string;
  radius: string;
  fieldRadius: string;
  skeletonAnimation: string;
  tooltipDelay: string;
  tooltipCloseDelay: string;
  background: string;
  foreground: string;
  surface: string;
  surfaceForeground: string;
  surfaceSecondary: string;
  surfaceSecondaryForeground: string;
  surfaceTertiary: string;
  surfaceTertiaryForeground: string;
  overlay: string;
  overlayForeground: string;
  muted: string;
  scrollbar: string;
  default: string;
  defaultForeground: string;
  accent: string;
  accentForeground: string;
  fieldBackground: string;
  fieldForeground: string;
  fieldPlaceholder: string;
  fieldBorder: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  danger: string;
  dangerForeground: string;
  segment: string;
  segmentForeground: string;
  border: string;
  separator: string;
  focus: string;
  link: string;
  backdrop: string;
  surfaceShadow: string;
  overlayShadow: string;
  fieldShadow: string;
}

export const THEME_KEY = "theme";

/** Shipped sans stack for `defaultTheme` (`--vu-font-sans`). */
export const DEFAULT_FONT_SANS =
  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** Shipped mono stack for `defaultTheme` (`--vu-font-mono`). */
export const DEFAULT_FONT_MONO =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

const PRIMITIVES_DEFAULT = {
  white: "oklch(100% 0 0)",
  black: "oklch(0% 0 0)",
  snow: "oklch(0.9911 0 0)",
  eclipse: "oklch(0.2103 0.0059 285.89)",
} as const;

/** Default layout-related token values merged into each mode. */
export const LAYOUT_DEFAULT = {
  spacing: "0.25rem",
  borderWidth: "1px",
  fieldBorderWidth: "0px",
  disabledOpacity: "0.5",
  ringOffsetWidth: "2px",
  cursorInteractive: "pointer",
  cursorDisabled: "not-allowed",
  radius: "0.5rem",
  fieldRadius: "var(--vu-control-radius-md)",
  skeletonAnimation: "shimmer",
  tooltipDelay: "1500ms",
  tooltipCloseDelay: "500ms",
} as const;

const SCROLLBAR_DERIVED: Record<string, string> = {
  "scrollbar-thumb": "var(--vu-color-scrollbar)",
  "scrollbar-track": "transparent",
  "scrollbar-gutter": "auto",
  "scrollbar-width": "thin",
  "scrollbar-color": "var(--vu-scrollbar-thumb) var(--vu-scrollbar-track)",
};

/** Per-mode derived tokens: soft intent variants plus the elevation palette. */
const VU_DERIVED_MODE_LIGHT: Record<string, string> = {
  /** Close contact shadow. */
  "shadow-ambient": "rgba(0, 0, 0, 0.06)",
  /** Cast shadow for lifted layers (overlays, menus, popovers). */
  "shadow-key": "rgba(0, 0, 0, 0.1)",
  /** Hairline edge that separates a layer from its backdrop; unused in light mode. */
  "shadow-rim": "transparent",
  "color-accent-soft": "color-mix(in oklab, var(--vu-color-accent) 15%, transparent)",
  "color-accent-soft-foreground":
    "color-mix(in oklab, var(--vu-color-accent) 70%, var(--vu-color-foreground) 30%)",
  "color-accent-soft-hover": "color-mix(in oklab, var(--vu-color-accent) 20%, transparent)",
  "color-danger-soft": "color-mix(in oklab, var(--vu-color-danger) 15%, transparent)",
  "color-danger-soft-foreground":
    "color-mix(in oklab, var(--vu-color-danger) 70%, var(--vu-color-foreground) 40%)",
  "color-danger-soft-hover": "color-mix(in oklab, var(--vu-color-danger) 20%, transparent)",
  "color-warning-soft": "color-mix(in oklab, var(--vu-color-warning) 15%, transparent)",
  "color-warning-soft-foreground":
    "color-mix(in oklab, var(--vu-color-warning) 80%, var(--vu-color-foreground) 70%)",
  "color-warning-soft-hover": "color-mix(in oklab, var(--vu-color-warning) 20%, transparent)",
  "color-success-soft": "color-mix(in oklab, var(--vu-color-success) 15%, transparent)",
  "color-success-soft-foreground":
    "color-mix(in oklab, var(--vu-color-success) 80%, var(--vu-color-foreground) 60%)",
  "color-success-soft-hover": "color-mix(in oklab, var(--vu-color-success) 20%, transparent)",
  "color-default-soft": "color-mix(in oklab, var(--vu-color-default) 50%, transparent)",
  "color-default-soft-foreground": "var(--vu-color-default-foreground)",
  "color-default-soft-hover": "color-mix(in oklab, var(--vu-color-default) 60%, transparent)",
};

/** Dark elevation reads through deeper black casts plus a faint light rim — never a white glow. */
const VU_DERIVED_MODE_DARK: Record<string, string> = {
  "shadow-ambient": "rgba(0, 0, 0, 0.45)",
  "shadow-key": "rgba(0, 0, 0, 0.6)",
  "shadow-rim": "rgba(255, 255, 255, 0.06)",
  "color-accent-soft": "color-mix(in oklab, var(--vu-color-accent) 12%, transparent)",
  "color-accent-soft-foreground":
    "color-mix(in oklab, var(--vu-color-accent) 80%, var(--vu-color-foreground) 30%)",
  "color-accent-soft-hover": "color-mix(in oklab, var(--vu-color-accent) 16%, transparent)",
  "color-danger-soft": "color-mix(in oklab, var(--vu-color-danger) 15%, transparent)",
  "color-danger-soft-foreground":
    "color-mix(in oklab, var(--vu-color-danger) 80%, var(--vu-color-foreground) 30%)",
  "color-danger-soft-hover": "color-mix(in oklab, var(--vu-color-danger) 20%, transparent)",
  "color-warning-soft": "color-mix(in oklab, var(--vu-color-warning) 12%, transparent)",
  "color-warning-soft-foreground":
    "color-mix(in oklab, var(--vu-color-warning) 80%, var(--vu-color-foreground) 30%)",
  "color-warning-soft-hover": "color-mix(in oklab, var(--vu-color-warning) 16%, transparent)",
  "color-success-soft": "color-mix(in oklab, var(--vu-color-success) 12%, transparent)",
  "color-success-soft-foreground":
    "color-mix(in oklab, var(--vu-color-success) 80%, var(--vu-color-foreground) 30%)",
  "color-success-soft-hover": "color-mix(in oklab, var(--vu-color-success) 16%, transparent)",
  "color-default-soft": "color-mix(in oklab, var(--vu-color-default) 50%, transparent)",
  "color-default-soft-foreground": "var(--vu-color-default-foreground)",
  "color-default-soft-hover": "color-mix(in oklab, var(--vu-color-default) 60%, transparent)",
};

const VU_DERIVED: Record<string, string> = {
  "color-surface-hover":
    "color-mix(in oklab, var(--vu-color-surface) 92%, var(--vu-color-surface-foreground) 8%)",

  "color-surface-active":
    "color-mix(in oklab, var(--vu-color-surface) 84%, var(--vu-color-surface-foreground) 16%)",
  "color-field-hover":
    "color-mix(in oklab, var(--vu-color-field) 90%, var(--vu-color-field-foreground) 2%)",

  "color-field-active":
    "color-mix(in oklab, var(--vu-color-field) 86%, var(--vu-color-field-foreground) 14%)",
  "color-background-secondary":
    "color-mix(in oklab, var(--vu-color-background) 96%, var(--vu-color-foreground) 4%)",
  "color-background-tertiary":
    "color-mix(in oklab, var(--vu-color-background) 92%, var(--vu-color-foreground) 8%)",
  "color-background-inverse": "var(--vu-color-foreground)",
  "color-default-hover":
    "color-mix(in oklab, var(--vu-color-default) 96%, var(--vu-color-default-foreground) 4%)",
  "color-accent-hover":
    "color-mix(in oklab, var(--vu-color-accent) 90%, var(--vu-color-accent-foreground) 10%)",
  "color-success-hover":
    "color-mix(in oklab, var(--vu-color-success) 90%, var(--vu-color-success-foreground) 10%)",
  "color-warning-hover":
    "color-mix(in oklab, var(--vu-color-warning) 90%, var(--vu-color-warning-foreground) 10%)",
  "color-danger-hover":
    "color-mix(in oklab, var(--vu-color-danger) 90%, var(--vu-color-danger-foreground) 10%)",
  "color-field-focus": "var(--vu-color-field)",
  "color-field-border-hover":
    "color-mix(in oklab, var(--vu-color-field-border) 88%, var(--vu-color-field-foreground) 10%)",
  "color-field-border-focus":
    "color-mix(in oklab, var(--vu-color-field-border) 74%, var(--vu-color-field-foreground) 22%)",
  "color-overlay-hover":
    "color-mix(in oklab, var(--vu-color-overlay) 92%, var(--vu-color-overlay-foreground) 8%)",
  "color-separator-secondary":
    "color-mix(in oklab, var(--vu-color-surface) 85%, var(--vu-color-surface-foreground) 15%)",
  "color-separator-tertiary":
    "color-mix(in oklab, var(--vu-color-surface) 81%, var(--vu-color-surface-foreground) 19%)",
  "color-border-secondary":
    "color-mix(in oklab, var(--vu-color-surface) 78%, var(--vu-color-surface-foreground) 22%)",
  "color-border-tertiary":
    "color-mix(in oklab, var(--vu-color-surface) 66%, var(--vu-color-surface-foreground) 34%)",
  "radius-xs": "calc(var(--vu-radius) * 0.25)",
  "radius-sm": "calc(var(--vu-radius) * 0.5)",
  "radius-md": "calc(var(--vu-radius) * 1)",
  "radius-lg": "calc(var(--vu-radius) * 1.25)",
  "radius-xl": "calc(var(--vu-radius) * 1.5)",
  "radius-2xl": "calc(var(--vu-radius) * 2)",
  "radius-3xl": "calc(var(--vu-radius) * 3)",
  "radius-4xl": "calc(var(--vu-radius) * 4)",
  "radius-full": "9999px",
  "radius-surface": "var(--vu-radius-2xl)",
  "radius-overlay": "var(--vu-radius-2xl)",

  "control-radius-xs": "var(--vu-radius-sm)",
  "control-radius-sm": "var(--vu-radius-md)",
  "control-radius-md": "var(--vu-radius-xl)",
  "control-radius-lg": "calc(var(--vu-radius) * 1.75)",
  "control-radius-xl": "var(--vu-radius-2xl)",
  "ease-out-cubic": "cubic-bezier(0.215, 0.61, 0.355, 1)",
  "ease-out-fluid": "cubic-bezier(0.32, 0.72, 0, 1)",
  "ease-in-out-cubic": "cubic-bezier(0.645, 0.045, 0.355, 1)",
  "ease-linear": "linear",
  /** @deprecated Prefer `--vu-ease-out-cubic`; kept as alias for consumer themes. */
  "ease-standard": "var(--vu-ease-out-cubic)",

  /** Typography & motion (Lit components). */
  "font-sans": DEFAULT_FONT_SANS,
  "font-mono": DEFAULT_FONT_MONO,
  "font-size-xs": "0.75rem",
  "font-size-sm": "0.875rem",
  "font-size-md": "1rem",
  "font-size-lg": "1.125rem",
  "font-size-xl": "1.25rem",
  "font-size-2xl": "1.5rem",
  "font-weight-normal": "400",
  "font-weight-medium": "500",
  "font-weight-semibold": "600",
  "font-weight-bold": "700",
  "letter-spacing-tight": "-0.025em",
  "letter-spacing-fine": "0.02em",
  "letter-spacing-normal": "0em",
  "letter-spacing-wide": "0.025em",
  "line-height-tight": "1.25",
  "line-height-snug": "1.375",
  "line-height-normal": "1.5",
  "line-height-none": "0",
  "duration-instant": "0ms",
  "duration-fast": "120ms",
  "duration-normal": "200ms",
  "duration-slow": "300ms",
  "duration-spin": "1s",
  /** Gap ring: background pad + focus color (use as box-shadow, not outline). */
  "focus-ring": "0 0 0 2px var(--vu-color-background), 0 0 0 4px var(--vu-color-focus)",
  "opacity-disabled-control": "0.6",
  "opacity-subtle": "0.75",
  "opacity-strong": "0.85",
  "z-raised": "1",
  "z-sticky": "10",
  "z-popover": "200",
  "z-overlay": "500",
  "z-tooltip": "600",
  /** Inline control heights (32 / 36 / 40px at 4px spacing). */
  "control-height-sm": "calc(var(--vu-spacing) * 8)",
  "control-height-md": "calc(var(--vu-spacing) * 9)",
  "control-height-lg": "calc(var(--vu-spacing) * 10)",
  /** Chrome shells (navbar, appbar) — slightly taller than controls. */
  "chrome-height-sm": "calc(var(--vu-spacing) * 9)",
  "chrome-height-md": "calc(var(--vu-spacing) * 10)",
  "chrome-height-lg": "calc(var(--vu-spacing) * 12)",
  "min-touch-target": "var(--vu-control-height-md)",
  /** Blur scale — use with `backdrop-filter` / `filter`; never borrow `--vu-space-*`. */
  "blur-none": "0",
  "blur-sm": "4px",
  "blur-md": "12px",
  "blur-lg": "20px",
  /** Mix % for glass fills when `data-glass` is on (overridden per mode in `VU_GLASS_CSS`). */
  "glass-fill": "65%",
  /** Backdrop saturation multiplier — `1` when glass is off; raised under `[data-glass]`. */
  "glass-saturate": "1",
  /** Composed backdrop recipes — prefer these over raw `blur(...)` so saturate stays in sync. */
  "surface-backdrop-filter":
    "blur(var(--vu-surface-blur, var(--vu-blur-none))) saturate(var(--vu-glass-saturate))",
  "overlay-backdrop-filter":
    "blur(var(--vu-overlay-blur, var(--vu-blur-none))) saturate(var(--vu-glass-saturate))",
  /**
   * Corner geometry for `border-radius` (`round` | `squircle` | …).
   * System default under `@supports` is `squircle` (`VU_CORNER_CSS`); fallback `round`.
   */
  "corner-shape": "round",
  /** Active surface/overlay glass switches — opaque when glass is off. */
  "surface-blur": "var(--vu-blur-none)",
  "overlay-blur": "var(--vu-blur-md)",
  "surface-fill": "100%",
  "overlay-fill": "85%",
  "glass-blur": "var(--vu-blur-none)",
  /** Opt-in page atmosphere token (`--vu-background-gradient`); theme-provider does not paint it — apps set `background-image` themselves. */
  "background-gradient": "none",
  "border-primary": "var(--vu-border-width) solid var(--vu-color-border)",
  "border-light": "1px solid var(--vu-color-separator)",
  /** Double border width for spinners / strong outlines. */
  "border-width-emphasis": "calc(var(--vu-border-width) * 2)",
  "space-0": "0",
  "space-half": "calc(var(--vu-spacing) * 0.5)",
  "space-0-75": "calc(var(--vu-spacing) * 0.75)",
  "space-1": "calc(var(--vu-spacing) * 1)",
  "space-1-25": "calc(var(--vu-spacing) * 1.25)",
  "space-1-5": "calc(var(--vu-spacing) * 1.5)",
  "space-2": "calc(var(--vu-spacing) * 2)",
  "space-2-5": "calc(var(--vu-spacing) * 2.5)",
  "space-3-5": "calc(var(--vu-spacing) * 3.5)",
  "space-4-5": "calc(var(--vu-spacing) * 4.5)",
  "space-3": "calc(var(--vu-spacing) * 3)",
  "space-4": "calc(var(--vu-spacing) * 4)",
  "space-5": "calc(var(--vu-spacing) * 5)",
  "space-6": "calc(var(--vu-spacing) * 6)",
  "space-7": "calc(var(--vu-spacing) * 7)",
  "space-8": "calc(var(--vu-spacing) * 8)",
  "space-9": "calc(var(--vu-spacing) * 9)",
  "space-10": "calc(var(--vu-spacing) * 10)",
  "space-12": "calc(var(--vu-spacing) * 12)",
  /** Semantic padding aliases — prefer over ad-hoc `calc(var(--vu-spacing) * N)`. */
  "padding-xs": "calc(var(--vu-spacing) * 2)",
  "padding-sm": "calc(var(--vu-spacing) * 3)",
  "padding-md": "calc(var(--vu-spacing) * 4)",
  "padding-lg": "calc(var(--vu-spacing) * 6)",
  "padding-xl": "calc(var(--vu-spacing) * 8)",
  /** Set by `vu-navbar` when a fixed bar reserves space on the document root. */
  "navbar-offset-top": "0px",
};

type IntentFillKeys = "default" | "accent" | "success" | "warning" | "danger";

/** Patch `*Foreground` using intent role rules (not max-contrast). */
function withIntentForegrounds<
  T extends Pick<ThemeModeConfig, IntentFillKeys | `${IntentFillKeys}Foreground`>,
>(mode: "light" | "dark", sheet: T): T {
  const keys: IntentFillKeys[] = ["default", "accent", "success", "warning", "danger"];
  const out = { ...sheet };
  for (const key of keys) {
    out[`${key}Foreground`] = intentForegroundForRole(key, mode);
  }
  return out;
}

/** Built-in light/dark theme — Kinetic (orangered hue 41); foreground pairs follow intent role rules. */
export const defaultTheme: ThemeConfig = {
  light: withIntentForegrounds("light", {
    primitives: { ...PRIMITIVES_DEFAULT },
    ...LAYOUT_DEFAULT,
    /* Cream canvas — landing companion for orangered brand */
    background: "#f4f3ef",
    foreground: "#12141a",
    surface: "var(--vu-white)",
    surfaceForeground: "var(--vu-color-foreground)",
    surfaceSecondary: "#ebe9e3",
    surfaceSecondaryForeground: "var(--vu-color-foreground)",
    surfaceTertiary: "#e2dfd7",
    surfaceTertiaryForeground: "var(--vu-color-foreground)",
    overlay: "var(--vu-white)",
    overlayForeground: "var(--vu-color-foreground)",
    muted: "oklch(0.55 0.014 95)",
    scrollbar: "color-mix(in oklch, var(--vu-color-foreground) 15%, transparent)",
    default: "oklch(0.92 0.01 95)",
    defaultForeground: "",

    /* accent — #FF4500 family; snow label on solid primary (≥3:1 large) */
    accent: "oklch(0.68 0.22 41)",
    accentForeground: "",

    fieldBackground: "var(--vu-white)",
    fieldForeground: "#12141a",
    fieldPlaceholder: "var(--vu-color-muted)",
    fieldBorder: "transparent",

    /* Teal / chartreuse-gold / magenta — ≥40° from accent H41 */
    success: "oklch(0.65 0.16 195)",
    successForeground: "",

    warning: "oklch(0.78 0.14 130)",
    warningForeground: "",

    danger: "oklch(0.58 0.22 280)",
    dangerForeground: "",

    segment: "var(--vu-white)",
    segmentForeground: "var(--vu-eclipse)",
    border: "oklch(0.86 0.012 95)",
    separator: "oklch(0.9 0.01 95)",
    focus: "var(--vu-color-accent)",
    link: "var(--vu-color-foreground)",
    backdrop: "rgba(0, 0, 0, 0.5)",

    surfaceShadow:
      "0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 0 1px 0 rgba(0, 0, 0, 0.06)",
    overlayShadow:
      "0 2px 8px 0 rgba(0, 0, 0, 0.06), 0 -6px 12px 0 rgba(0, 0, 0, 0.03), 0 14px 28px 0 rgba(0, 0, 0, 0.08)",
    fieldShadow:
      "0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 0 1px 0 rgba(0, 0, 0, 0.06)",
  }),
  dark: withIntentForegrounds("dark", {
    primitives: { ...PRIMITIVES_DEFAULT },
    ...LAYOUT_DEFAULT,
    /* Obsidian canvas — Emergent landing dark */
    background: "#0a0b10",
    foreground: "#f4f3ef",
    surface: "#111319",
    surfaceForeground: "var(--vu-color-foreground)",
    surfaceSecondary: "#181b24",
    surfaceSecondaryForeground: "var(--vu-color-foreground)",
    surfaceTertiary: "#1e2230",
    surfaceTertiaryForeground: "var(--vu-color-foreground)",
    overlay: "#111319",
    overlayForeground: "var(--vu-color-foreground)",
    muted: "oklch(0.7 0.015 95)",
    scrollbar: "color-mix(in oklch, var(--vu-color-foreground) 15%, transparent)",
    default: "oklch(0.28 0.02 275)",
    defaultForeground: "",

    /* Slightly deeper accent so snow labels clear the 3:1 floor */
    accent: "oklch(0.64 0.22 41)",
    accentForeground: "",

    fieldBackground: "#181b24",
    fieldForeground: "var(--vu-color-foreground)",
    fieldPlaceholder: "var(--vu-color-muted)",
    fieldBorder: "transparent",

    success: "oklch(0.65 0.16 195)",
    successForeground: "",

    warning: "oklch(0.78 0.14 130)",
    warningForeground: "",

    danger: "oklch(0.58 0.22 280)",
    dangerForeground: "",

    segment: "oklch(0.36 0.02 275)",
    segmentForeground: "var(--vu-color-foreground)",
    border: "oklch(0.32 0.02 275)",
    separator: "oklch(0.26 0.015 275)",
    focus: "var(--vu-color-accent)",
    link: "var(--vu-color-foreground)",
    backdrop: "rgba(0, 0, 0, 0.6)",
    surfaceShadow: "0 1px 2px 0 var(--vu-shadow-ambient), 0 0 0 1px var(--vu-shadow-rim) inset",
    overlayShadow:
      "0 10px 30px -6px var(--vu-shadow-key), 0 3px 10px -3px var(--vu-shadow-ambient), 0 0 0 1px var(--vu-shadow-rim) inset",
    fieldShadow: "0 0 0 0 transparent inset",
  }),
};

/** Alias for the shipped brand sheet (`defaultTheme` / Kinetic). */
export const kineticTheme = defaultTheme;

/** @deprecated Use `defaultTheme` or `kineticTheme` — former Signal Blue alias. */
export const signalBlueTheme = defaultTheme;

/** Merge an advanced token patch into `defaultTheme` per mode. */
export function mergeTheme(tokens: PartialTheme = {}): ThemeConfig {
  return {
    light: deepMerge(defaultTheme.light, tokens.light ?? {}),
    dark: deepMerge(defaultTheme.dark, tokens.dark ?? {}),
  };
}

/** Resolve a `VuThemeConfig` into full light + dark sheets: defaults ← derived seeds ← `vars`. */
export function createTheme(config: VuThemeConfig = {}, host?: HTMLElement): ThemeConfig {
  const { tokens, vars } = expandThemeConfig(config, host);
  return { ...mergeTheme(tokens), vars };
}

/** Host and window event name when theme mode or preference changes. */
export const VU_THEME_EVENT = "vu-theme" as const;

/** Read stored preference (`light` | `dark` | `system`) from `localStorage`. */
export function getThemePreference(): ThemePreference {
  try {
    if (typeof localStorage !== "undefined") {
      const v = localStorage.getItem(THEME_KEY) as ThemePreference | null;
      return v === "light" || v === "dark" || v === "system" ? v : "system";
    }
  } catch {}
  return "system";
}

/** Resolve preference to `light` or `dark` (uses `prefers-color-scheme` when `system`). */
export function resolveActualTheme(pref: ThemePreference): "light" | "dark" {
  if (!isClient()) return "light";
  if (pref === "system") {
    try {
      if (window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
    } catch {}
    return "light";
  }
  return pref;
}

/** Resolved mode from `<html data-theme>`, else system preference. */
export function getCurrentTheme(): "light" | "dark" {
  if (!canUseDocument()) return "light";
  const de = document.documentElement;
  const v = de.getAttribute("data-theme");
  if (v === "light" || v === "dark") return v;
  return isClient() && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Subscribe to `vu-theme` and get an initial callback; returns unsubscribe. */
export function onThemeChange(cb: (mode: "light" | "dark", preference?: ThemePreference) => void) {
  if (!isClient()) return () => {};
  const handler = (e: Event) => {
    const { mode, preference } = (e as CustomEvent).detail || {};
    if (mode === "light" || mode === "dark") cb(mode, preference);
    else cb(getCurrentTheme(), undefined);
  };
  window.addEventListener(VU_THEME_EVENT, handler);
  queueMicrotask(() => cb(getCurrentTheme(), undefined));
  return () => {
    window.removeEventListener(VU_THEME_EVENT, handler);
  };
}

function deepMerge<T>(target: T, source: Partial<T>): T {
  const t: any = Array.isArray(target) ? [...(target as any)] : { ...(target as any) };
  for (const k in source) {
    const sv: any = (source as any)[k];
    if (sv && typeof sv === "object" && !Array.isArray(sv)) {
      t[k] = deepMerge((target as any)[k] ?? {}, sv);
    } else if (sv !== undefined) {
      t[k] = sv;
    }
  }
  return t;
}

function camelToKebab(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Semantic color keys emitted as `--vu-color-*` (not bare `--vu-background`, etc.). */
const THEME_COLOR_KEYS = new Set([
  "background",
  "foreground",
  "surface",
  "surfaceForeground",
  "surfaceSecondary",
  "surfaceSecondaryForeground",
  "surfaceTertiary",
  "surfaceTertiaryForeground",
  "overlay",
  "overlayForeground",
  "muted",
  "scrollbar",
  "default",
  "defaultForeground",
  "accent",
  "accentForeground",
  "fieldBackground",
  "fieldForeground",
  "fieldPlaceholder",
  "fieldBorder",
  "success",
  "successForeground",
  "warning",
  "warningForeground",
  "danger",
  "dangerForeground",
  "segment",
  "segmentForeground",
  "border",
  "separator",
  "focus",
  "link",
  "backdrop",
]);

/** Maps authoring keys to canonical `--vu-*` consumer names. */
function themeTokenKey(key: string): string {
  switch (key) {
    case "surfaceShadow":
      return "shadow-surface";
    case "overlayShadow":
      return "shadow-overlay";
    case "fieldShadow":
      return "shadow-field";
    case "fieldRadius":
      return "radius-field";
    case "fieldBorderWidth":
      return "border-width-field";
    case "fieldBackground":
      return "color-field";
    default:
      if (THEME_COLOR_KEYS.has(key)) return `color-${camelToKebab(key)}`;
      return camelToKebab(key);
  }
}

function themeToCssVars(theme: Partial<ThemeModeConfig>): Record<string, string> {
  const out: Record<string, string> = {};
  const { primitives, ...rest } = theme;
  for (const [k, v] of Object.entries(primitives ?? {})) {
    out[camelToKebab(k)] = v;
  }
  for (const [k, v] of Object.entries(rest)) {
    if (typeof v === "string") out[themeTokenKey(k)] = v;
  }
  return out;
}

/** Flat map of `--vu-*` names to values for one mode. */
export function generateVarMap(
  theme: ThemeModeConfig,
  mode: "light" | "dark" = "light",
): Record<string, string> {
  const perMode = mode === "dark" ? VU_DERIVED_MODE_DARK : VU_DERIVED_MODE_LIGHT;
  return { ...themeToCssVars(theme), ...VU_DERIVED, ...SCROLLBAR_DERIVED, ...perMode };
}

/** Accepts `--vu-color-accent`, `--color-accent`, or `color-accent` spellings in `vars`. */
function normalizeVarName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.startsWith("--vu-")) return trimmed.slice("--vu-".length);
  return trimmed.startsWith("--") ? trimmed.slice(2) : trimmed;
}

function normalizeVars(vars?: Record<string, string>): Record<string, string> {
  if (!vars) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(vars)) out[normalizeVarName(k)] = v;
  return out;
}

/** Solid intent fills in `vars` that auto-patch `-foreground` when only the fill is overridden. */
const INTENT_VAR_PAIRS = [
  ["color-accent", "color-accent-foreground"],
  ["color-success", "color-success-foreground"],
  ["color-warning", "color-warning-foreground"],
  ["color-danger", "color-danger-foreground"],
  ["color-default", "color-default-foreground"],
] as const;

/** Recompute intent foregrounds when `vars` overrides a fill but not its paired foreground. */
function patchIntentForegroundVars(
  merged: Record<string, string>,
  overrides: Record<string, string>,
  mode: "light" | "dark",
): Record<string, string> {
  const out = { ...merged };
  for (const [fillKey, fgKey] of INTENT_VAR_PAIRS) {
    if (!(fillKey in overrides) || fgKey in overrides) continue;
    const fill = overrides[fillKey]?.trim();
    if (!fill) continue;
    const role = INTENT_FILL_KEY_TO_ROLE[fillKey as keyof typeof INTENT_FILL_KEY_TO_ROLE];
    out[fgKey] = intentForegroundForRole(role, mode);
  }
  return out;
}

/** Token map for one mode with the config's raw `vars` overrides applied last. */
export function resolveModeVars(
  config: ThemeConfig,
  mode: "light" | "dark",
  host?: HTMLElement,
): Record<string, string> {
  const overrides = normalizeVars(config.vars?.[mode]);
  const merged = { ...generateVarMap(config[mode], mode), ...overrides };
  void host;
  return patchIntentForegroundVars(merged, overrides, mode);
}

/** Convert an advanced token patch into `--vu-*` entries for `VuThemeConfig.vars`. */
export function themeTokensToVars(tokens: Partial<ThemeModeConfig>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(themeToCssVars(tokens))) out[`--vu-${k}`] = v;
  return out;
}

/** One CSS rule: `selector { --vu-…: …; }`. */
export function buildVarCSS(vars: Record<string, string>, selector: string): string {
  const p = VU_CSS_VAR_PREFIX;
  const body = Object.entries(vars)
    .map(([k, v]) => `--${p}-${k}:${v};`)
    .join("");
  return `${selector}{${body}}`;
}

/** Keyframes for `--vu-animate-*` tokens. */
export const VU_THEME_KEYFRAMES_CSS = `
@keyframes vu-spin {
  to { transform: rotate(360deg); }
}
@keyframes vu-skeleton {
  100% { transform: translateX(200%); }
}
@keyframes vu-caret-blink {
  0%, 70%, 100% { opacity: 1; }
  20%, 50% { opacity: 0; }
}
`.trim();

/** Higher-contrast soft foregrounds when `data-vibrant-palette="true"`. */
export const VU_VIBRANT_PALETTE_CSS = `
[data-vibrant-palette="true"]:not([data-theme="dark"]) {
  --vu-color-accent-soft-foreground: color-mix(in oklab, var(--vu-color-accent) 92%, var(--vu-color-foreground) 8%);
  --vu-color-danger-soft-foreground: color-mix(in oklab, var(--vu-color-danger) 92%, var(--vu-color-foreground) 8%);
  --vu-color-warning-soft-foreground: color-mix(in oklab, var(--vu-color-warning) 92%, var(--vu-color-foreground) 8%);
  --vu-color-success-soft-foreground: color-mix(in oklab, var(--vu-color-success) 92%, var(--vu-color-foreground) 8%);
}

[data-vibrant-palette="true"][data-theme="dark"] {
  --vu-color-accent-soft-foreground: color-mix(in oklab, var(--vu-color-accent) 92%, var(--vu-color-foreground) 8%);
  --vu-color-danger-soft-foreground: color-mix(in oklab, var(--vu-color-danger) 92%, var(--vu-color-foreground) 8%);
  --vu-color-warning-soft-foreground: color-mix(in oklab, var(--vu-color-warning) 92%, var(--vu-color-foreground) 8%);
  --vu-color-success-soft-foreground: color-mix(in oklab, var(--vu-color-success) 92%, var(--vu-color-foreground) 8%);
}
`.trim();

/** App-wide glassmorphism when `data-glass` is set. */
export const VU_GLASS_CSS = `
[data-glass] {
  --vu-surface-blur: var(--vu-blur-md);
  --vu-overlay-blur: var(--vu-blur-md);
  --vu-glass-blur: var(--vu-blur-md);
  --vu-glass-saturate: 1.4;
  --vu-surface-fill: var(--vu-glass-fill);
  --vu-overlay-fill: var(--vu-glass-fill);
  --vu-shadow-surface:
    0 1px 2px 0 var(--vu-shadow-ambient),
    0 4px 16px -4px var(--vu-shadow-key);
  --vu-shadow-overlay:
    0 8px 28px -6px var(--vu-shadow-key),
    0 2px 8px -2px var(--vu-shadow-ambient),
    0 0 0 1px var(--vu-shadow-rim) inset;
}

[data-glass]:not([data-theme="dark"]) {
  --vu-glass-fill: 72%;
  /* Soft highlight rim so frosted panels read as glass, not fog. */
  --vu-shadow-rim: color-mix(in oklab, #fff 55%, transparent);
}

[data-glass][data-theme="dark"] {
  /* Higher fill than classic 45% — keeps type crisp over busy backdrops. */
  --vu-glass-fill: 62%;
  --vu-shadow-rim: rgba(255, 255, 255, 0.1);
}

@media (prefers-reduced-transparency: reduce) {
  [data-glass] {
    --vu-surface-blur: var(--vu-blur-none);
    --vu-overlay-blur: var(--vu-blur-none);
    --vu-glass-blur: var(--vu-blur-none);
    --vu-glass-saturate: 1;
    --vu-surface-fill: 100%;
    --vu-overlay-fill: 100%;
  }
}
`.trim();

/**
 * System-wide soft corners.
 * Progressive: Chromium 139+; other engines keep circular `border-radius` arcs.
 * Pair `corner-shape: var(--vu-corner-shape, round)` on rectangular rounded paint nodes.
 * True circles and pill caps (radio, switch, slider thumbs) use `corner-shape: round` instead.
 */
export const VU_CORNER_CSS = `
@supports (corner-shape: squircle) {
  :root,
  :host {
    --vu-corner-shape: squircle;
  }
}
`.trim();

/** Serialized stylesheet options (`includeKeyframes`, treated as true when unset). */
export type VuThemeStylesheetOptions = { includeKeyframes?: boolean };

/** Adds `scopeSelector` for per-root token sheets (theme islands). */
export type VuThemeScopedStylesheetOptions = VuThemeStylesheetOptions & { scopeSelector: string };

/** Default theme as a CSS string (`:root` + `html[data-theme="dark"]`). */
export function getDefaultThemeStylesheet(options?: VuThemeStylesheetOptions): string {
  return themeConfigToStylesheet(defaultTheme, options);
}

/** Serialize `ThemeConfig` to CSS: light on `:root`, dark on `html[data-theme="dark"]`. */
export function themeConfigToStylesheet(
  config: ThemeConfig,
  options?: VuThemeStylesheetOptions,
): string {
  const kf = options?.includeKeyframes !== false ? `${VU_THEME_KEYFRAMES_CSS}\n\n` : "";
  const vibrant = `${VU_VIBRANT_PALETTE_CSS}\n\n`;
  const corners = `${VU_CORNER_CSS}\n\n`;
  const glass = `${VU_GLASS_CSS}\n\n`;
  const light = buildVarCSS(resolveModeVars(config, "light"), ":root");
  const dark = buildVarCSS(resolveModeVars(config, "dark"), 'html[data-theme="dark"]');
  return `${kf}${vibrant}${corners}${glass}${light}\n\n${dark}`;
}

/** Scoped light + dark blocks for `scopeSelector` and `scopeSelector[data-theme="dark"]` (theme islands). */
export function themeConfigToScopedStylesheet(
  config: ThemeConfig,
  options: VuThemeScopedStylesheetOptions,
): string {
  const sel = options.scopeSelector.trim();
  const kf = options?.includeKeyframes !== false ? `${VU_THEME_KEYFRAMES_CSS}\n\n` : "";
  const vibrant = `${VU_VIBRANT_PALETTE_CSS}\n\n`;
  const corners = `${VU_CORNER_CSS}\n\n`;
  const glass = `${VU_GLASS_CSS}\n\n`;
  const light = buildVarCSS(resolveModeVars(config, "light"), sel);
  const darkSel = `${sel}[data-theme="dark"]`;
  const dark = buildVarCSS(resolveModeVars(config, "dark"), darkSel);
  return `${kf}${vibrant}${corners}${glass}${light}\n\n${dark}`;
}

/** Serialize one mode to a single selector block. */
export function themeModeToStylesheet(
  mode: ThemeModeConfig,
  selector: string,
  options?: VuThemeStylesheetOptions & { themeMode?: "light" | "dark" },
): string {
  const themeMode =
    options?.themeMode ?? (selector.includes('[data-theme="dark"]') ? "dark" : "light");
  const kf = options?.includeKeyframes ? `${VU_THEME_KEYFRAMES_CSS}\n\n` : "";
  return `${kf}${buildVarCSS(generateVarMap(mode, themeMode), selector)}`;
}
