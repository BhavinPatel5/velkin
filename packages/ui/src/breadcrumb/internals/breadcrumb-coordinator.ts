import type { VuBreadcrumbItem } from "../../breadcrumb-item/breadcrumb-item.js";
import type { VuBreadcrumbSize } from "../breadcrumb.types.js";

/** Mirrors group props onto every slotted item and positions them via CSS `order`. */
export function breadcrumbForwardAttributes(
  items: VuBreadcrumbItem[],
  opts: {
    size: VuBreadcrumbSize;
    collapsed: boolean;
    leading: number;
    trailing: number;
  },
): void {
  const total = items.length;
  const { size, collapsed, leading, trailing } = opts;
  const trailingStart = total - trailing;

  items.forEach((item, i) => {
    item.setAttribute("role", "listitem");
    item.size = size;

    const isLeading = i < leading;
    const isTrailing = i >= trailingStart;
    const isHidden = collapsed && !isLeading && !isTrailing;

    item.hidden = isHidden;

    if (collapsed) {
      if (isLeading) {
        item.style.setProperty("order", String(i + 1));
      } else if (isTrailing) {
        item.style.setProperty("order", String(leading + 2 + (i - trailingStart)));
      } else {
        item.style.removeProperty("order");
      }
    } else {
      item.style.removeProperty("order");
    }

    const isFirstVisible = collapsed ? isLeading && i === 0 : i === 0;
    item.first = isFirstVisible;
  });
}

/** Pushes the separator glyph as a CSS var; children read it via `content: var(--breadcrumb-separator)`. */
export function breadcrumbForwardSeparator(host: HTMLElement, separator: string): void {
  host.style.setProperty("--breadcrumb-separator", JSON.stringify(separator));
}
