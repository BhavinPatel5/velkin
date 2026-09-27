import { VuDropdownItem } from "../../dropdown-item/dropdown-item.js";
import type {
  VuDropdownItemColor,
  VuDropdownItemSize,
} from "../../dropdown-item/dropdown-item.types.js";
import type {
  VuDropdownItemColor as VuDropdownHostItemColor,
  VuDropdownSize,
} from "../dropdown.types.js";

/** Host surface for menu density / row intent relay onto slotted items and nested flyouts. */
export type DropdownItemRelayHost = {
  size: VuDropdownSize;
  itemColor: VuDropdownHostItemColor;
  readonly _items: VuDropdownItem[] | undefined;
  querySelectorAll(selectors: string): NodeListOf<Element>;
  isSameMenuFlyout(flyout: Element): boolean;
};

const ownedItemAttrs = new WeakMap<Element, Set<string>>();

function ownsItem(el: Element, attr: string): boolean {
  return ownedItemAttrs.get(el)?.has(attr) ?? false;
}

function setItemOwnership(el: Element, attr: string, owned: boolean): void {
  let set = ownedItemAttrs.get(el);
  if (!set) {
    if (!owned) return;
    set = new Set();
    ownedItemAttrs.set(el, set);
  }
  if (owned) set.add(attr);
  else set.delete(attr);
}

/** Relays via Lit `@property` (not `setAttribute`) so items update through their own reactive cycle. */
function claimItemSize(el: VuDropdownItem, value: VuDropdownItemSize): void {
  const owned = ownsItem(el, "size");
  if (owned || !el.hasAttribute("size")) {
    el.size = value;
    setItemOwnership(el, "size", true);
  }
}

function claimItemColor(el: VuDropdownItem, value: VuDropdownItemColor): void {
  const owned = ownsItem(el, "color");
  if (owned || !el.hasAttribute("color")) {
    el.color = value;
    setItemOwnership(el, "color", true);
  }
}

/** Forwards host `size` and `itemColor` to slotted items and nested flyouts without their own. */
export function syncDropdownItems(host: DropdownItemRelayHost): void {
  for (const el of host._items ?? []) {
    if (!(el instanceof VuDropdownItem)) continue;
    claimItemSize(el, host.size);
    if (host.itemColor !== "default") {
      claimItemColor(el, host.itemColor);
    }
  }
  syncDropdownSubmenuFlyouts(host);
}

/** Relays host menu density + row intent onto nested `trigger="submenu"` flyouts. */
export function syncDropdownSubmenuFlyouts(host: DropdownItemRelayHost): void {
  for (const flyout of host.querySelectorAll("vu-dropdown")) {
    if (host.isSameMenuFlyout(flyout)) continue;
    const el = flyout as HTMLElement & {
      trigger?: string;
      size?: VuDropdownSize;
      itemColor?: VuDropdownItemColor;
      hasAttribute(name: string): boolean;
    };
    if (el.trigger !== "submenu") continue;
    if (!el.hasAttribute("size")) el.size = host.size;
    if (!el.hasAttribute("itemcolor") && host.itemColor !== "default") {
      el.itemColor = host.itemColor;
    }
  }
}
