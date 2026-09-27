import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuThemeProvider as VuThemeProviderElement,
  VuThemeProviderChangeDetail,
} from "@velkin/ui/theme-provider";

export const VuThemeProvider = createComponent({
  displayName: "ThemeProvider",
  react: React,
  tagName: "vu-theme-provider",
  elementClass: VuThemeProviderElement,
  events: {
    onVuTheme: "vu-theme" as EventName<CustomEvent<VuThemeProviderChangeDetail>>,
  },
});
export type * from "@velkin/ui/theme-provider";
