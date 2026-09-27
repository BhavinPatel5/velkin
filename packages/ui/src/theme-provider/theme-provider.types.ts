import type {
  ThemeConfig,
  ThemePreference,
  VuThemeConfig,
  VuThemeSeeds,
  VuThemeTint,
  VuThemeVars,
} from "./internals/theme-core.js";

export type VuThemeProviderScope = "root" | "host" | "both";

export type VuThemeProviderChangeDetail = {
  mode: "light" | "dark";
  preference: ThemePreference;
};

export { VU_THEME_EVENT } from "./internals/theme-core.js";

export interface ThemeContextValue {
  mode: "light" | "dark";
  preference: ThemePreference;
  theme: ThemeConfig;
  setPreference: (pref: ThemePreference) => void;
  togglePreference: () => ThemePreference;
}

export type { ThemeConfig, ThemePreference, VuThemeConfig, VuThemeSeeds, VuThemeTint, VuThemeVars };
