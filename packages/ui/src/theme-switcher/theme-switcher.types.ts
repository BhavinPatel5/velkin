import type { ThemePreference } from "../theme-provider/internals/theme-core.js";
import { VU_THEME_EVENT } from "../theme-provider/internals/theme-core.js";
import type { VuButtonColor, VuButtonSize, VuButtonVariant } from "../button/button.types.js";

/** Visual mode — segmented `<vu-tab>` or single cycling button. */
export type VuThemeSwitcherType = "switch" | "button";

/** `vu-theme` detail when the user changes preference via the switcher. */
export type VuThemeSwitcherChangeDetail = {
  preference: ThemePreference;
  mode: "light" | "dark";
};

/** Host-dispatched change event name (`vu-theme`). */
export const VU_THEME_SWITCHER_CHANGE_EVENT = VU_THEME_EVENT;

export type { VuButtonColor as VuThemeSwitcherColor };
export type { VuButtonSize as VuThemeSwitcherSize };
export type { VuButtonVariant as VuThemeSwitcherVariant };
export type { ThemePreference };

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuThemeSwitcherRadius = "none" | "sm" | "md" | "lg" | "full";
