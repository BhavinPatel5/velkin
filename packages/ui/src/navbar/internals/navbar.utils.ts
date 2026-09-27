import {
  VU_NAVBAR_OVERFLOW_ID,
  type VuNavbarAction,
  type VuNavbarActionContext,
  type VuNavbarItem,
  type VuNavbarRouteMatch,
} from "../navbar.types.js";
import type { VuNavPanelItem } from "../../nav-panel/nav-panel.types.js";

/** Stable id for a nav item (explicit `id` or slugged label). */
export function navbarItemId(item: VuNavbarItem): string {
  return item.id ?? navbarSlug(item.label ?? "");
}

/** Visible bar items plus optional overflow bucket item. */
export function navbarRootItems(
  visibleItems: VuNavbarItem[],
  overflowItems: VuNavbarItem[],
): VuNavbarItem[] {
  const list = [...visibleItems];
  if (overflowItems.length) {
    list.push({
      id: VU_NAVBAR_OVERFLOW_ID,
      submenu: overflowItems,
    });
  }
  return list;
}

/** Resolves the item at a slash-free path segment chain. */
export function navbarItemAtPath(roots: VuNavbarItem[], path: string[]): VuNavbarItem | undefined {
  let list = roots;
  let found: VuNavbarItem | undefined;
  for (const segment of path) {
    found = list.find((it) => navbarItemId(it) === segment);
    if (!found) return undefined;
    list = found.submenu ?? [];
  }
  return found;
}

/** Lowercase slug from a label for stable path segments when `id` is omitted. */
export function navbarSlug(label: string): string {
  return String(label || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_]/g, "")
    .replace(/-+/g, "-");
}

/** Build a path segment chain for nested items. */
export function navbarPath(parent: string | null, item: VuNavbarItem): string {
  const id = navbarItemId(item);
  return parent ? `${parent}/${id}` : id;
}

/** Normalize a route string for active-route comparison. */
export function navbarNormRoute(route?: string | null): string | null {
  if (!route) return null;
  let r = route.trim();
  if (r.length > 1 && r.endsWith("/")) r = r.slice(0, -1);
  return r;
}

/** Whether `activeRoute` matches an item route using its `routeMatch` mode. */
export function navbarItemRouteActive(activeRoute: string | null, item: VuNavbarItem): boolean {
  return navbarRouteActive(activeRoute, item.route, item.routeMatch ?? "exact");
}

/** Whether `route` matches `activeRoute` using the given match mode. */
export function navbarRouteActive(
  activeRoute: string | null,
  route?: string | null,
  match: VuNavbarRouteMatch = "exact",
): boolean {
  const a = navbarNormRoute(activeRoute);
  const b = navbarNormRoute(route);
  if (!a || !b) return false;
  if (match === "prefix") return a === b || a.startsWith(`${b}/`);
  return a === b;
}

/** String icon name from `iconL` when it is a plain string or `{ icon }` object. */
export function navbarIconName(icon: VuNavbarItem["iconL"]): string | undefined {
  if (!icon) return undefined;
  if (typeof icon === "string") return icon;
  if (typeof icon === "object" && "icon" in icon && typeof icon.icon === "string") {
    return icon.icon;
  }
  return undefined;
}

/** Anchor `rel` with safe defaults for external links. */
export function navbarItemRel(item: VuNavbarItem): string | undefined {
  if (item.rel) return item.rel;
  const target = item.external ? "_blank" : item.target;
  if (target === "_blank") return "noopener noreferrer";
  return undefined;
}

/** Flatten navbar items into nav-panel rows (nested items become categorized leaves). */
export function navbarItemsToNavPanel(
  items: VuNavbarItem[],
  parentPath: string | null = null,
  category?: string,
): VuNavPanelItem[] {
  const rows: VuNavPanelItem[] = [];
  for (const item of items) {
    if (item.divider) continue;
    const path = navbarPath(parentPath, item);
    const icon = navbarIconName(item.iconL);
    const href = item.href ?? item.route;
    const target = item.external ? "_blank" : item.target;
    const badge = item.badge ?? item.shortcut;
    if (item.submenu?.length) {
      if (href || item.route || item.action) {
        rows.push({
          label: item.label ?? path,
          value: path,
          description: item.sublabel,
          badge,
          icon,
          category,
          disabled: item.disabled,
          href,
          target,
          rel: navbarItemRel(item),
        });
      }
      rows.push(...navbarItemsToNavPanel(item.submenu, path, item.label ?? category));
      continue;
    }
    rows.push({
      label: item.label ?? path,
      value: path,
      description: item.sublabel,
      badge,
      icon,
      category,
      disabled: item.disabled,
      href,
      target,
      rel: navbarItemRel(item),
    });
  }
  return rows;
}

/** Find the nav-panel value that best matches `activeRoute`. */
export function navbarNavPanelValue(
  activeRoute: string | null,
  rows: VuNavPanelItem[],
  items: VuNavbarItem[],
): string {
  const walk = (list: VuNavbarItem[], parent: string | null): string => {
    for (const item of list) {
      if (item.divider) continue;
      const path = navbarPath(parent, item);
      if (navbarItemRouteActive(activeRoute, item)) return path;
      if (item.submenu?.length) {
        const nested = walk(item.submenu, path);
        if (nested) return nested;
      }
    }
    return "";
  };
  return walk(items, null) || rows[0]?.value || "";
}

/** Shallow array identity check for overflow measurement updates. */
export function navbarShallowEqualItems(a: VuNavbarItem[], b: VuNavbarItem[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Run a function nav action with error logging. */
export function runNavbarAction(action: VuNavbarAction, ctx: VuNavbarActionContext): void {
  try {
    action(ctx);
  } catch (err) {
    console.error("Nav action error:", err);
  }
}
