import type {
  VuDropdownItemColor,
  VuDropdownItemKind,
} from "../dropdown-item/dropdown-item.types.js";

/** How the menu opens relative to the trigger. */
export type VuDropdownTrigger = "click" | "hover" | "submenu";

/** Preferred popover side before collision flip; `auto` picks the best side. */
export type VuDropdownPlacement = "bottom" | "top" | "left" | "right" | "auto";

/** Alignment along the trigger edge. */
export type VuDropdownAlign = "start" | "center" | "end";

/** Inline-size preset for the menu panel; any other string is a CSS length written to `--dropdown-width`. */
export type VuDropdownWidthPreset = "auto" | "trigger";

/** Neutral surface weight for the menu panel (Role C). */
export type VuDropdownTone = "subtle" | "normal" | "strong";

/** Panel padding scale. */
export type VuDropdownSize = "sm" | "md" | "lg";

/** Panel corner radius preset (Role C′ subset — `sm`|`md`|`lg` only; `none`/`full` stay on fields/actions). */
export type VuDropdownRadius = "sm" | "md" | "lg";

/** Panel surface recipe (Role C). */
export type VuDropdownVariant = "elevated" | "outline" | "soft";

/** Row intent forwarded from the host; re-exported from `vu-dropdown-item`. */
export type { VuDropdownItemColor } from "../dropdown-item/dropdown-item.types.js";

/** `vu-open-change` when `open` toggles (controlled / v-model:open). */
export type VuDropdownOpenChangeDetail = { open: boolean };

/** `vu-select` when a menu row is activated. */
export type VuDropdownSelectDetail = {
  value: string;
  label: string;
  item: HTMLElement;
  checked?: boolean;
  kind?: VuDropdownItemKind;
  href?: string;
};

/** Pointer phase for `vu-submenuhover` (nested flyout retention). */
export type VuDropdownSubmenuHoverPhase = "enter" | "leave";

/** `vu-submenuhover` detail from a nested flyout host. */
export type VuDropdownSubmenuHoverDetail = {
  phase: VuDropdownSubmenuHoverPhase;
};

/** Minimal surface wired from `<vu-dropdown slot="submenu">` on a menu row. */
export interface VuDropdownSubmenuHost extends HTMLElement {
  open: boolean;
  trigger: Extract<VuDropdownTrigger, "submenu">;
  size: VuDropdownSize;
  itemColor: VuDropdownItemColor;
  show(): void;
  hide(): void;
  bindSubmenuAnchor(anchor: HTMLElement): void;
}
