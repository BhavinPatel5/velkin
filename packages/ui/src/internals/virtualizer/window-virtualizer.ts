import { Virtualizer } from "./virtualizer.js";
import type { VirtualizerOptions } from "./virtualizer.types.js";
import { observeWindowOffset, observeWindowRect, windowScroll } from "./virtualizer-utils.js";

/** Creates a window-scrolling virtualizer. */
export function createWindowVirtualizer(
  options: Omit<
    VirtualizerOptions,
    "getScrollElement" | "useWindowScroll" | "observeElementOffset" | "observeElementRect"
  >,
): Virtualizer {
  return new Virtualizer({
    ...options,
    useWindowScroll: true,
    getScrollElement: () => (typeof document !== "undefined" ? document.documentElement : null),
    observeElementOffset: observeWindowOffset,
    observeElementRect: observeWindowRect,
    scrollToFn: windowScroll,
  });
}
