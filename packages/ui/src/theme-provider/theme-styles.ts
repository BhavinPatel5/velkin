import {
  createTheme,
  getDefaultThemeStylesheet,
  themeConfigToStylesheet,
  type VuThemeConfig,
} from "./internals/theme-core.js";

/** Shipped default palette as inline CSS for SSR / critical `<head>`. */
export const defaultThemeCss = getDefaultThemeStylesheet();

/** Inline CSS for `<head>` from brand seeds — pass the same object to `<vu-theme-provider theme>`. */
export function themeToCriticalCss(config: VuThemeConfig = {}): string {
  return themeConfigToStylesheet(createTheme(config));
}
