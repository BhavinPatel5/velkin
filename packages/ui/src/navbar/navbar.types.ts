import type { TemplateResult } from "lit";

/** Sentinel id for the desktop overflow (⋯ / hamburger) menu button. */
export const VU_NAVBAR_OVERFLOW_ID = "__overflow__";

export type VuNavbarIcon =
  | string
  | TemplateResult
  | HTMLElement
  | { icon: string; inline?: boolean; flip?: string; rotate?: number };

export type VuNavbarActionContext = {
  item: VuNavbarItem;
  path: string | null;
  host: HTMLElement;
  event?: Event;
};

export type VuNavbarAction = (ctx: VuNavbarActionContext) => unknown;

/** How `activeRoute` matches an item `route`. */
export type VuNavbarRouteMatch = "exact" | "prefix";

/** Preferred popover side before collision flip; `auto` picks the best side. */
export type VuNavbarPlacement = "bottom" | "top" | "left" | "right" | "auto";

/** Alignment along the trigger edge. */
export type VuNavbarAlign = "start" | "center" | "end";

/** Bar surface paint recipe (structure only — pair with `tone` for neutral weight). */
export type VuNavbarVariant = "flat" | "outline" | "elevated" | "transparent" | "inset";

/** Neutral surface background weight on the bar. */
export type { VuSurfaceTone as VuNavbarTone } from "../internals/utils/surface-tone.js";

/** Bar height, link padding, and type scale. */
export type VuNavbarSize = "sm" | "md" | "lg";

/** Active top-level link affordance (`underline`/`pill`/`dot`/`none`). `pill` is selection chrome — not `radius="full"`. */
export type VuNavbarIndicator = "underline" | "pill" | "dot" | "none";

/** Desktop submenu panel layout for a top-level item. */
export type VuNavbarPanelVariant = "flyout" | "mega";

export type VuNavbarItem = {
  id?: string;
  label?: string;
  sublabel?: string;
  iconL?: VuNavbarIcon;
  iconR?: VuNavbarIcon;
  disabled?: boolean;
  route?: string;
  /** How `activeRoute` matches `route`; default `exact`. */
  routeMatch?: VuNavbarRouteMatch;
  /** When set, renders as a link instead of a button (desktop + mobile). */
  href?: string;
  target?: string;
  rel?: string;
  /** Shows external-link affordance and defaults `target` to `_blank`. */
  external?: boolean;
  /** Trailing shortcut hint (e.g. `⌘K`). */
  shortcut?: string;
  /** Trailing badge meta (e.g. `New`). */
  badge?: string;
  /** Top-level submenu layout; `mega` renders a multi-column panel. */
  panel?: VuNavbarPanelVariant;
  /** Column count when `panel` is `mega`; default `3`. */
  columns?: number;
  submenu?: VuNavbarItem[];
  divider?: boolean;
  action?: VuNavbarAction;
};

/** Dispatched when navigation follows an item `route`. */
export type VuNavbarNavigateDetail = { route: string };

export type VuNavbarItemActivateDetail = { item: VuNavbarItem; path: string | null };

/** How desktop submenu panels open (`auto` uses hover on fine pointers, click otherwise). */
export type VuNavbarMenuTrigger = "hover" | "click" | "auto";

/** Localized label bundle read by navbar render (built in host getters). */
export type VuNavbarLabels = {
  main: string;
  menubar: string;
  menu: string;
  navigation: string;
  close: string;
  nestedSubmenu: string;
  submenuFor(id: string): string;
};
