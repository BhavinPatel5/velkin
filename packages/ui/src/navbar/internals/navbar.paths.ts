import type { VuNavbarItem } from "../navbar.types.js";
import { navbarPath } from "./navbar.utils.js";

/** Host surface for desktop submenu path coordination. */
export type NavbarPathHost = {
  readonly isMegaPanel: boolean;
  activePath: string[];
  nestedMenuOpen: boolean;
  readonly _ready: boolean;
  _nestedAnchorEl: HTMLElement | null;
  refreshNestedPopoverTargets(): void;
};

/** Opens a nested flyout from a menu row when not in mega layout. */
export function openNavbarNested(
  host: NavbarPathHost,
  item: VuNavbarItem,
  el: HTMLElement,
  parentPath: string | null,
): void {
  if (host.isMegaPanel) return;
  const p = navbarPath(parentPath, item);
  host._nestedAnchorEl = el;
  collapseNavbarTo(host, parentPath);
  host.activePath = [
    ...(parentPath ? ensureNavbarPath(host, parentPath) : host.activePath.slice(0, 1)),
    p,
  ];
  host.nestedMenuOpen = true;
  if (host._ready) host.refreshNestedPopoverTargets();
}

/** Collapses activePath to a parent segment and closes nested when needed. */
export function collapseNavbarTo(host: NavbarPathHost, parentPath: string | null): void {
  if (!host.activePath.length) return;
  if (!parentPath) {
    host.activePath = [host.activePath[0]];
    host.nestedMenuOpen = false;
    return;
  }
  const idx = host.activePath.indexOf(parentPath);
  if (idx >= 0) host.activePath = host.activePath.slice(0, idx + 1);
  if (host.activePath.length <= 1) host.nestedMenuOpen = false;
}

/** Returns the path prefix through `parent`, preserving the open top segment. */
export function ensureNavbarPath(host: NavbarPathHost, parent: string): string[] {
  const top = host.activePath[0] ? [host.activePath[0]] : [];
  if (!parent) return top;
  const idx = host.activePath.indexOf(parent);
  if (idx >= 0) return host.activePath.slice(0, idx + 1);
  return [...top, parent];
}
