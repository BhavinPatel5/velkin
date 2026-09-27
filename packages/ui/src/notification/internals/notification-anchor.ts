import type { VuNotificationPosition } from "../notification.types.js";
import { resolveNotificationPosition } from "./notification-placement.js";

const DEFAULT_INSET = "var(--nt-viewport-offset, var(--vu-space-2-5))";

/** Positions the invisible popover anchor from a screen position. */
export function syncNotificationAnchor(
  anchor: HTMLElement,
  position: VuNotificationPosition,
): void {
  const { edge, align } = resolveNotificationPosition(position);
  const style = anchor.style;
  style.display = "block";
  style.inlineSize = "var(--vu-border-width)";
  style.blockSize = "var(--vu-border-width)";
  style.opacity = "0";
  style.pointerEvents = "none";
  style.position = "fixed";

  style.insetBlockStart = "unset";
  style.insetBlockEnd = "unset";
  style.insetInlineStart = "unset";
  style.insetInlineEnd = "unset";
  style.transform = "unset";

  if (edge === "top") style.insetBlockStart = DEFAULT_INSET;
  else style.insetBlockEnd = DEFAULT_INSET;

  if (align === "start") style.insetInlineStart = DEFAULT_INSET;
  else if (align === "end") style.insetInlineEnd = DEFAULT_INSET;
  else {
    style.insetInlineStart = "50%";
    style.transform = "translateX(-50%)";
  }
}
