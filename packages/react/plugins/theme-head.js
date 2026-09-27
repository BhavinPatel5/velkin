import { createElement, Fragment } from "react";
import { defaultThemeCss, themeToCriticalCss } from "@velkin/ui/theme-provider";
import { VuThemeInitScript, htmlThemeProps, themeInitScript } from "./theme-init.js";

export { defaultThemeCss, themeToCriticalCss, htmlThemeProps, themeInitScript, VuThemeInitScript };

/** SSR-critical `--vu-*` tokens plus blocking mode script — pair with `<VuThemeProvider>`. */
export function VuThemeHead({ theme } = {}) {
  const css = theme ? themeToCriticalCss(theme) : defaultThemeCss;
  return createElement(
    Fragment,
    null,
    createElement("style", {
      id: "vu-theme-vars-root",
      dangerouslySetInnerHTML: { __html: css },
      suppressHydrationWarning: true,
    }),
    VuThemeInitScript(),
  );
}
