import {
  resolveActualTheme,
  type ThemePreference,
} from "../../theme-provider/internals/theme-core.js";
import {
  VU_THEME_SWITCHER_CHANGE_EVENT,
  type VuThemeSwitcherChangeDetail,
} from "../theme-switcher.types.js";

const CYCLE: ThemePreference[] = ["light", "system", "dark"];

/** Host surface for preference updates and event emission. */
export type ThemeSwitcherActionHost = {
  themeCtx?: {
    preference: ThemePreference;
    setPreference: (pref: ThemePreference) => void;
  };
  requestUpdate: () => void;
  dispatchEvent: (event: Event) => boolean;
};

/** Next preference in light → system → dark order. */
export function nextThemePreference(current: ThemePreference): ThemePreference {
  const index = CYCLE.indexOf(current);
  const next = CYCLE[(index + 1) % CYCLE.length];
  return next ?? "light";
}

/** Resolve the icon id for a preference value. */
export function iconForPreference(
  pref: ThemePreference,
  icons: { light: string; dark: string; system: string },
): string {
  if (pref === "dark") return icons.dark;
  if (pref === "system") return icons.system;
  return icons.light;
}

/** Build change detail using resolved mode for the target preference. */
export function themeSwitcherChangeDetail(
  preference: ThemePreference,
): VuThemeSwitcherChangeDetail {
  return {
    preference,
    mode: resolveActualTheme(preference),
  };
}

/** Apply preference via context and emit a local `vu-theme` event. */
export function applyThemePreference(host: ThemeSwitcherActionHost, next: ThemePreference): void {
  if (!host.themeCtx) return;
  host.themeCtx.setPreference(next);
  host.requestUpdate();
  emitThemeSwitcherChange(host, themeSwitcherChangeDetail(next));
}

/** Emit `vu-theme` after a user-driven preference change (non-bubbling). */
export function emitThemeSwitcherChange(
  host: { dispatchEvent: (event: Event) => boolean },
  detail: VuThemeSwitcherChangeDetail,
): void {
  host.dispatchEvent(
    new CustomEvent<VuThemeSwitcherChangeDetail>(VU_THEME_SWITCHER_CHANGE_EVENT, {
      detail,
      bubbles: false,
      composed: true,
    }),
  );
}
