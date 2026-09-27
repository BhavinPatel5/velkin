import type { CSSProperties, ReactElement } from "react";

/** Blocking inline script — mirrors `vu-theme-provider` root attrs before first paint. */
export const themeInitScript: string;

/** Default SSR `<html>` attrs (script still overrides from localStorage / system). */
export const htmlThemeProps: {
  "data-theme": string;
  "data-theme-light": string;
  "data-glass": string;
  style: { colorScheme: CSSProperties["colorScheme"] };
};

/** Put in `<head>` — blocking so first paint matches `VuThemeProvider`. Prefer `VuThemeHead` from `@velkin/react/theme-head` (tokens + script). */
export function VuThemeInitScript(): ReactElement;
