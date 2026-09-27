import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuThemeSwitcher as VuThemeSwitcherElement,
  VuThemeSwitcherChangeDetail,
} from "@velkin/ui/theme-switcher";

export const VuThemeSwitcher = createComponent({
  displayName: "ThemeSwitcher",
  react: React,
  tagName: "vu-theme-switcher",
  elementClass: VuThemeSwitcherElement,
  events: {
    onVuTheme: "vu-theme" as EventName<CustomEvent<VuThemeSwitcherChangeDetail>>,
  },
});
export type * from "@velkin/ui/theme-switcher";
