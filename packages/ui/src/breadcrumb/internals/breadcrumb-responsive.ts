import type { VuBreadcrumbItem } from "../../breadcrumb-item/breadcrumb-item.js";
import { canUseRaf, canUseResizeObserver } from "../../internals/utils/env.js";

/** Responsive width-measurement state owned by `<vu-breadcrumb>`. */
export type BreadcrumbResponsiveHost = {
  responsive: boolean;
  _measuring: boolean;
  _responsiveCollapse: boolean;
  _widthsCached: boolean;
  _itemWidths: WeakMap<VuBreadcrumbItem, number>;
  _rafToken: number;
  _resizeObserver: ResizeObserver | null;
  _list: HTMLElement | null;
  style: CSSStyleDeclaration;
  clientWidth: number;
  getBoundingClientRect(): DOMRect;
  requestUpdate(): void | Promise<unknown>;
};

/** Binds a ResizeObserver to the host when `responsive` is true. */
export function breadcrumbEnsureResizeObserver(
  host: BreadcrumbResponsiveHost,
  onResize: () => void,
): void {
  if (!host.responsive || !canUseResizeObserver()) return;
  if (!host._resizeObserver) {
    host._resizeObserver = new ResizeObserver(onResize);
  }
  host._resizeObserver.observe(host as unknown as Element);
}

/** Disconnects and clears the ResizeObserver. */
export function breadcrumbDisposeResizeObserver(host: BreadcrumbResponsiveHost): void {
  host._resizeObserver?.disconnect();
  host._resizeObserver = null;
}

/** Schedules a one-frame uncollapsed render so item widths can be measured honestly. */
export function breadcrumbRequestMeasure(host: BreadcrumbResponsiveHost): void {
  if (host._measuring) return;
  host._measuring = true;
}

/** Snapshot each slotted item's natural width (must run while uncollapsed). */
export function breadcrumbCaptureWidths(
  host: BreadcrumbResponsiveHost,
  items: VuBreadcrumbItem[],
): void {
  if (items.length === 0) {
    host._widthsCached = false;
    return;
  }
  items.forEach((item) => {
    const w = item.getBoundingClientRect().width;
    if (w > 0) host._itemWidths.set(item, w);
  });
  host._widthsCached = items.every((it) => host._itemWidths.has(it));
}

/** Coalesce successive ResizeObserver / measure callbacks into a single rAF tick. */
export function breadcrumbScheduleResponsiveRecompute(
  host: BreadcrumbResponsiveHost,
  items: VuBreadcrumbItem[],
): void {
  if (!host.responsive || !canUseRaf()) return;
  if (host._rafToken) return;
  host._rafToken = requestAnimationFrame(() => {
    host._rafToken = 0;
    if (!host._widthsCached) {
      breadcrumbRequestMeasure(host);
      host.requestUpdate();
      return;
    }
    breadcrumbRecomputeResponsive(host, items);
  });
}

/** Sets `_responsiveCollapse` when the full trail exceeds the container width. */
export function breadcrumbRecomputeResponsive(
  host: BreadcrumbResponsiveHost,
  items: VuBreadcrumbItem[],
): void {
  if (!host.responsive) return;
  const list = host._list;
  if (!list || items.length === 0 || !host._widthsCached) {
    host._responsiveCollapse = false;
    return;
  }
  const styledWidth = Number.parseFloat(host.style.width);
  const containerWidth =
    Number.isFinite(styledWidth) && styledWidth > 0
      ? styledWidth
      : list.clientWidth || host.clientWidth || host.getBoundingClientRect().width;
  if (containerWidth <= 0) return;
  let totalWidth = 0;
  for (const it of items) {
    totalWidth += host._itemWidths.get(it) || 0;
  }
  const next = totalWidth > containerWidth + 1;
  if (next !== host._responsiveCollapse) {
    host._responsiveCollapse = next;
  }
}
