import type { VuThemeConfig } from "@velkin/ui/theme-provider";
import type { ReactElement } from "react";

export { defaultThemeCss, themeToCriticalCss } from "@velkin/ui/theme-provider";
export { htmlThemeProps, themeInitScript, VuThemeInitScript } from "./theme-init.js";

/** SSR-critical `--vu-*` tokens plus blocking mode script — pair with `<VuThemeProvider>`. */
export function VuThemeHead(props?: { theme?: VuThemeConfig }): ReactElement;
