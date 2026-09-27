/** Nearest overflow scrollport ancestor, or `null` for the viewport / window. */
export function getNearestScrollParent(node: Element): HTMLElement | null {
  let el = node.parentElement;
  while (el && el !== document.documentElement) {
    const { overflowX, overflowY } = readOverflow(el);
    if (isScrollableOverflow(overflowY) || isScrollableOverflow(overflowX)) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

function isScrollableOverflow(value: string): boolean {
  return value === "auto" || value === "scroll" || value === "overlay";
}

/** Prefer computed style; fall back to inline when the environment doesn't resolve overflow (jsdom). */
function readOverflow(el: HTMLElement): { overflowX: string; overflowY: string } {
  const computed = getComputedStyle(el);
  let overflowY = computed.overflowY;
  let overflowX = computed.overflowX;
  if (!isScrollableOverflow(overflowY) && !isScrollableOverflow(overflowX)) {
    const inline = el.style.overflowY || el.style.overflowX || el.style.overflow;
    if (isScrollableOverflow(inline)) {
      overflowX = el.style.overflowX || inline;
      overflowY = el.style.overflowY || inline;
    }
  }
  return { overflowX, overflowY };
}
