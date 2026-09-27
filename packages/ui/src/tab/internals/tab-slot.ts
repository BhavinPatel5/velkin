import type { VuTabItem } from "../../tab-item/tab-item.js";
import type { VuTabNormalizedItem } from "../tab.types.js";

const SLOT_MEMBER_SELECTOR = "vu-tab-item";

/** True when light DOM contains `<vu-tab-item>` default-slot children. */
export function hasTabSlotChildren(host: Element): boolean {
  for (const child of host.children) {
    if (child.tagName.toLowerCase() === SLOT_MEMBER_SELECTOR) return true;
  }
  return false;
}

/** Assigned or light-DOM slot members before first `slotchange`. */
export function resolveTabSlotMembers(host: Element, assigned: VuTabItem[]): VuTabItem[] {
  if (assigned.length > 0) return assigned;
  if (typeof host.querySelectorAll === "function") {
    return Array.from(host.querySelectorAll<VuTabItem>(SLOT_MEMBER_SELECTOR));
  }
  const children = host.children;
  if (!children || typeof children[Symbol.iterator] !== "function") return [];
  return Array.from(children).filter(
    (child): child is VuTabItem => child.tagName.toLowerCase() === SLOT_MEMBER_SELECTOR,
  );
}

/** True when slotted `<vu-tab-item>` children should drive the control. */
export function tabUsesSlotItems(
  host: Element,
  assigned: VuTabItem[],
  statesCount = 0,
): boolean {
  if (resolveTabSlotMembers(host, assigned).length > 0) return true;
  /* Empty `states` stays in slot mode so SSR matches the client before light DOM is visible. */
  return statesCount === 0;
}

/** Reads normalized segment data from a slotted `<vu-tab-item>`. */
export function tabItemFromElement(el: VuTabItem): VuTabNormalizedItem {
  return {
    value: el.value,
    label: el.label,
    icon: el.icon,
    disabled: el.disabled,
    color: el.color || undefined,
  };
}

/** Maps assigned slot members to the internal segment list. */
export function tabItemsFromSlot(members: VuTabItem[]): VuTabNormalizedItem[] {
  return members.filter((el) => el.value).map((el) => tabItemFromElement(el));
}

/** Syncs selection, disabled, and label collapse onto slotted segment children. */
export function syncTabSlotMembers(
  members: VuTabItem[],
  options: {
    selectedIndex: number;
    hostDisabled: boolean;
    labelCollapsed: boolean;
  },
): void {
  const { selectedIndex, hostDisabled, labelCollapsed } = options;
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const selected = i === selectedIndex;
    member.selected = selected;
    member.segmentDisabled = hostDisabled;
    member.labelCollapsed = labelCollapsed && !selected;
  }
}

export { SLOT_MEMBER_SELECTOR };
