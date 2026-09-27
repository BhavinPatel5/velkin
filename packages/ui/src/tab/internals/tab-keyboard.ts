import { resolveIsRtl } from "../../internals/utils/dir.js";
import {
  findFirstEnabledTabIndex,
  findLastEnabledTabIndex,
  findNextEnabledTabIndex,
  tabSelectedIndex,
} from "./tab-items.js";
import type { VuTabNormalizedItem, VuTabOrientation } from "../tab.types.js";

/** Keyboard surface the tab key handler coordinates. */
export type TabKeyboardHost = {
  disabled: boolean;
  orientation: VuTabOrientation;
  selectedValue: string;
  items: VuTabNormalizedItem[];
  readonly renderRoot: HTMLElement | DocumentFragment;
  readonly shadowRoot: ShadowRoot | null;
  updateComplete: Promise<boolean>;
  setSelectedIndex(index: number, source: HTMLElement | null): void;
  segmentAt(index: number): HTMLElement | null;
};

/** True when the host or an ancestor establishes RTL layout. */
export function tabIsRtl(host: HTMLElement): boolean {
  const dirHost = host.closest("[dir]");
  if (dirHost?.getAttribute("dir") === "rtl") return true;
  if (dirHost?.getAttribute("dir") === "ltr") return false;
  return resolveIsRtl(host);
}

/** Resolves logical forward/back keys for the current layout axis. */
export function tabArrowKeys(
  host: HTMLElement,
  orientation: VuTabOrientation = "horizontal",
): {
  forward: string;
  backward: string;
} {
  if (orientation === "vertical") {
    return { forward: "ArrowDown", backward: "ArrowUp" };
  }
  const rtl = tabIsRtl(host);
  return {
    forward: rtl ? "ArrowLeft" : "ArrowRight",
    backward: rtl ? "ArrowRight" : "ArrowLeft",
  };
}

/** Radiogroup arrow / Home / End handling per APG segmented control patterns. */
export function onTabKeydown(host: TabKeyboardHost & HTMLElement, event: KeyboardEvent): void {
  if (host.disabled) return;
  const items = host.items;
  const count = items.length;
  if (!count) return;

  const current = tabSelectedIndex(items, host.selectedValue);
  let next = current;
  const { forward, backward } = tabArrowKeys(host, host.orientation);

  switch (event.key) {
    case forward:
      next = findNextEnabledTabIndex(items, current, 1);
      break;
    case backward:
      next = findNextEnabledTabIndex(items, current, -1);
      break;
    case "Home": {
      const first = findFirstEnabledTabIndex(items);
      if (first >= 0) next = first;
      break;
    }
    case "End": {
      const last = findLastEnabledTabIndex(items);
      if (last >= 0) next = last;
      break;
    }
    default:
      return;
  }

  event.preventDefault();
  if (next !== current) {
    const root = host.shadowRoot ?? host.renderRoot;
    const buttons =
      root && typeof root.querySelectorAll === "function"
        ? root.querySelectorAll<HTMLButtonElement>(".btn")
        : [];
    host.setSelectedIndex(next, buttons[next] ?? null);
  }

  void host.updateComplete.then(() => {
    const target = host.segmentAt(next);
    if (!target) return;
    if ("focusSegment" in target && typeof target.focusSegment === "function") {
      (target as { focusSegment(): void }).focusSegment();
      return;
    }
    if (target instanceof HTMLButtonElement) {
      target.focus();
      return;
    }
    target.querySelector<HTMLButtonElement>(".btn")?.focus();
  });
}
