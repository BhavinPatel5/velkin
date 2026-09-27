/** Slide discovery and ARIA relay helpers for `<vu-carousel>` + `<vu-carousel-item>`. */

import type { VuCarouselItem } from "../../carousel-item/carousel-item.js";
import type { VuCarouselItemOrientation } from "../../carousel-item/carousel-item.types.js";

export const CAROUSEL_ITEM_TAG = "vu-carousel-item";

export function isCarouselItem(el: Element): el is VuCarouselItem {
  return el.tagName.toLowerCase() === CAROUSEL_ITEM_TAG;
}

/** Collects slotted `<vu-carousel-item>` children (ignores text nodes and other tags). */
export function getCarouselItems(slot: HTMLSlotElement | null): VuCarouselItem[] {
  if (!slot) return [];
  return (slot.assignedElements({ flatten: true }) as Element[]).filter(isCarouselItem);
}

/** Relays slide ARIA + visibility onto each item via Lit properties (not setAttribute). */
export function syncCarouselItems(
  items: VuCarouselItem[],
  opts: {
    slideRole: string;
    positionLabel: (index: number, total: number) => string;
    start: number;
    end: number;
    orientation: VuCarouselItemOrientation;
  },
): void {
  const total = items.length;
  items.forEach((item, i) => {
    item.slideRole = opts.slideRole;
    item.positionLabel = opts.positionLabel(i, total);
    item.inView = i >= opts.start && i < opts.end;
    item.orientation = opts.orientation;
  });
}

export const CAROUSEL_DRAG_THRESHOLD = 50;

export function carouselDragShouldNavigate(delta: number): boolean {
  return Math.abs(delta) >= CAROUSEL_DRAG_THRESHOLD;
}

export function carouselDragDirection(delta: number): "prev" | "next" | null {
  if (!carouselDragShouldNavigate(delta)) return null;
  return delta > 0 ? "prev" : "next";
}

export function isCarouselDragControlTarget(path: EventTarget[]): boolean {
  return path.some((node) => {
    if (!(node instanceof Element)) return false;
    const tag = node.tagName?.toLowerCase();
    if (
      tag === "button" ||
      tag === "a" ||
      tag === "input" ||
      tag === "textarea" ||
      tag === "select"
    ) {
      return true;
    }
    return (node as HTMLElement).isContentEditable === true;
  });
}
