/** Public type aliases for `<vu-card>`. Re-exported from the component file. */

/** Visual archetype — seven neutral-surface recipes. Use `vu-alert` for semantic status color. */
export type VuCardVariant =
  "elevated" | "outline" | "soft" | "filled" | "ghost" | "glass" | "gradient";

/** Neutral surface weight — separates intensity within the same `variant` (no intent `color`). */
export type { VuSurfaceTone as VuCardTone } from "../internals/utils/surface-tone.js";

/** Padding scale — drives '--card-pad' (single inset on the content shell) and '--card-gap' (space between header, body, footer). Avoids stacking full padding on every section. */
export type VuCardSize = "sm" | "md" | "lg";

/** Corner radius preset. */
export type VuCardRadius = "sm" | "md" | "lg";

/** Layout axis. `vertical` (default) stacks media on top, content below. `horizontal` puts media on the start edge with content next to it — the canonical thumbnail-list-card pattern. */
export type VuCardOrientation = "vertical" | "horizontal";

/** Section divider strategy. Default is `none` — whitespace and typography carry the layout, so dividers are opt-in. `footer` draws only the body↔footer (or header↔footer) hairline. `header` draws header↔body and media↔content. `all` draws every adjacent-section hairline via `vu-divider`. */
export type VuCardDivider = "none" | "header" | "footer" | "all";

/** Detail payload for the `vu-activate` event fired when an `interactive` card is clicked or keyboard-activated. */
export type VuCardActivateDetail = {
  /** The original UI event (`MouseEvent` for clicks, `KeyboardEvent` for Enter / Space). Useful for `event.shiftKey`, modifier keys, etc. */
  source: Event;
};
