import { canUseDocument, canUseRaf } from "../../internals/utils/env.js";
import type { VuNavbarItem } from "../navbar.types.js";
import { navbarShallowEqualItems } from "./navbar.utils.js";

export type NavbarOverflowMeasureHost = {
  readonly isMobile: boolean;
  readonly items: VuNavbarItem[];
  readonly overflowThreshold: number;
  readonly visibleItems: VuNavbarItem[];
  readonly overflowItems: VuNavbarItem[];
  readonly renderRoot: HTMLElement | DocumentFragment;
  readonly shadowRoot: ShadowRoot | null;
  readonly barEl: HTMLElement | undefined;
  _isMeasuring: boolean;
  _measurementRequested: boolean;
  setVisibleItems(items: VuNavbarItem[]): void;
  setOverflowItems(items: VuNavbarItem[]): void;
};

function applyOverflow(
  host: NavbarOverflowMeasureHost,
  nextVisible: VuNavbarItem[],
  nextOverflow: VuNavbarItem[],
): void {
  if (!navbarShallowEqualItems(host.visibleItems, nextVisible)) {
    host.setVisibleItems(nextVisible);
  }
  if (!navbarShallowEqualItems(host.overflowItems, nextOverflow)) {
    host.setOverflowItems(nextOverflow);
  }
}

function scheduleMeasureIfNeeded(host: NavbarOverflowMeasureHost): void {
  if (host._measurementRequested) {
    host._measurementRequested = false;
    setTimeout(() => measureNavbarOverflow(host), 0);
  }
}

/** Measure desktop bar width and split items into visible vs overflow buckets. */
export function measureNavbarOverflow(host: NavbarOverflowMeasureHost): void {
  if (host._isMeasuring) {
    host._measurementRequested = true;
    return;
  }
  if (host.isMobile) return;
  if (!host.barEl) return;
  if (!canUseDocument()) return;
  if (!Array.isArray(host.items)) {
    host.setOverflowItems([]);
    return;
  }

  const root = host.shadowRoot ?? host.renderRoot;
  if (!root || typeof root.querySelector !== "function") return;

  host._isMeasuring = true;
  const run = (): void => {
    try {
      const availableRaw = host.barEl!.clientWidth;
      if (!availableRaw) {
        host._isMeasuring = false;
        scheduleMeasureIfNeeded(host);
        return;
      }

      const measureSlot = (name: string) => {
        const slot = root.querySelector(
          `slot[name="${name}"]`,
        ) as HTMLSlotElement | null;
        if (!slot) return 0;
        const els = slot.assignedElements({ flatten: true });
        if (!els.length) return 0;
        const widthWithMargins = (el: Element) => {
          const rect = (el as HTMLElement).getBoundingClientRect();
          const cs = getComputedStyle(el as HTMLElement);
          const ml = parseFloat(cs.marginLeft) || 0;
          const mr = parseFloat(cs.marginRight) || 0;
          return rect.width + ml + mr;
        };
        return els.reduce((acc, el) => acc + widthWithMargins(el), 0);
      };

      const csBar = getComputedStyle(host.barEl!);
      const padL = parseFloat(csBar.paddingLeft) || 0;
      const padR = parseFloat(csBar.paddingRight) || 0;
      const borderL = parseFloat(csBar.borderLeftWidth) || 0;
      const borderR = parseFloat(csBar.borderRightWidth) || 0;
      const barFlexGap = parseFloat(csBar.columnGap || csBar.gap || "0") || 0;

      const usable = Math.max(0, availableRaw - padL - padR - borderL - borderR);

      const preW = measureSlot("prepend");
      const postW = measureSlot("append");
      const barSideGaps = (preW > 0 ? barFlexGap : 0) + (postW > 0 ? barFlexGap : 0);
      const spaceForItems = Math.max(0, usable - preW - postW - barSideGaps);

      const barItemsEl = root.querySelector(".bar-items") as HTMLElement | null;

      const temp = document.createElement("div");
      temp.style.cssText =
        "position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;inset:auto;";
      (barItemsEl ?? host.barEl!).appendChild(temp);

      const mkButton = (mi: VuNavbarItem) => {
        const b = document.createElement("button");
        b.className = "btn";
        b.style.whiteSpace = "nowrap";
        b.style.display = "inline-flex";
        b.style.alignItems = "center";
        if (mi.iconL) {
          const i = document.createElement("vu-icon");
          b.appendChild(i);
        }
        const span = document.createElement("span");
        span.textContent = mi.label ?? "";
        b.appendChild(span);
        if (mi.iconR || mi.submenu) {
          const i = document.createElement("vu-icon");
          b.appendChild(i);
        }
        return b;
      };

      const overflowBtn = mkButton({ label: "⋯" });
      temp.appendChild(overflowBtn);
      const ovW = overflowBtn.getBoundingClientRect().width;
      temp.removeChild(overflowBtn);

      const csBarItems = barItemsEl ? getComputedStyle(barItemsEl) : null;
      const itemGap = csBarItems
        ? parseFloat(csBarItems.columnGap || csBarItems.gap || "0") || 0
        : 0;

      const widths = host.items.map((mi) => {
        const b = mkButton(mi);
        temp.appendChild(b);
        const w = b.getBoundingClientRect().width;
        temp.removeChild(b);
        return w;
      });

      const nextVisible: VuNavbarItem[] = [];
      const nextOverflow: VuNavbarItem[] = [];
      let used = 0;

      for (let i = 0; i < host.items.length; i++) {
        const w = widths[i];
        const gapBeforeThisItem = nextVisible.length > 0 ? itemGap : 0;
        const hasRemaining = i < host.items.length - 1;
        const overflowExtra = hasRemaining ? ovW + (nextVisible.length > 0 ? itemGap : 0) : 0;
        const mustFit = used + gapBeforeThisItem + w + overflowExtra;

        if (mustFit <= spaceForItems) {
          used += gapBeforeThisItem + w;
          nextVisible.push(host.items[i]);
        } else {
          for (let j = i; j < host.items.length; j++) {
            nextOverflow.push(host.items[j]);
          }
          break;
        }
      }

      if (host.overflowThreshold > 0) {
        const visibleCount = host.items.length - nextOverflow.length;
        if (visibleCount < host.overflowThreshold) {
          host.setVisibleItems([]);
          host.setOverflowItems([...host.items]);
          (barItemsEl ?? host.barEl!).removeChild(temp);
          host._isMeasuring = false;
          scheduleMeasureIfNeeded(host);
          return;
        }
      }

      applyOverflow(host, nextVisible, nextOverflow);
      (barItemsEl ?? host.barEl!).removeChild(temp);
    } catch (e) {
      console.error("Measurement error:", e);
    } finally {
      host._isMeasuring = false;
      scheduleMeasureIfNeeded(host);
    }
  };

  if (canUseRaf()) {
    requestAnimationFrame(run);
  } else {
    run();
  }
}
