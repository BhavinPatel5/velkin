import type { PopoverPlacement } from "../internals/controllers/popover-controller.js";

/** Icon placement relative to the row label. */
export type VuNavPanelItemIconPosition = "start" | "end";

/** Item role: selectable row, static header/divider, or menu checkbox/radio (menubar mobile). */
export type VuNavPanelItemKind = "item" | "header" | "checkbox" | "radio" | "divider";

/** Row rendered inside `<vu-nav-panel>`. */
export type VuNavPanelItem = {
  label: string;
  /** `header`/`divider` are static; `checkbox`/`radio` show a check control; omit or `item` for a nav row. */
  kind?: VuNavPanelItemKind;
  /** Selection key; defaults to a stable key from `label` and position when omitted. */
  value?: string;
  /** Checked state for `kind="checkbox"` / `kind="radio"`. */
  checked?: boolean;
  /** Secondary line under the label. */
  description?: string;
  /** Optional trailing meta (count, status, shortcut hint, …). */
  badge?: string;
  icon?: string;
  iconPosition?: VuNavPanelItemIconPosition;
  /** Group heading key; rows sharing a category collapse together. */
  category?: string;
  /** Skips activation while keeping the row visible. */
  disabled?: boolean;
  /** When set, renders the row as a link. */
  href?: string;
  /** Anchor target (`_blank`, `_self`, …). */
  target?: string;
  /** Anchor `rel` (auto `noopener noreferrer` for `_blank`). */
  rel?: string;
};

/** Row density preset. */
export type VuNavPanelSize = "sm" | "md" | "lg";

/** Active-row accent when selected. */
export type VuNavPanelColor = "default" | "primary" | "success" | "warning" | "danger";

/** How icon-rail rows expose labels to sighted users. */
export type VuNavPanelCollapsedHints = "tooltip" | "native" | "none";

/** Floating hint side for icon-rail rows when `collapsedHints="tooltip"`. */
export type VuNavPanelHintPlacement = PopoverPlacement;

/** `vu-change` when the selected row changes. */
export type VuNavPanelChangeDetail = {
  value?: string;
  item?: VuNavPanelItem;
};

/** `vu-collapse-change` when icon-rail `collapsed` flips. */
export type VuNavPanelCollapseChangeDetail = {
  collapsed: boolean;
};
