export type FlipTransitionOptions = {
  durationMs?: number;
  easing?: string;
};

/** Records viewport rects keyed by element identity before a DOM update. */
export function captureFlipRects(
  root: Element | DocumentFragment,
  selector: string,
  getKey: (el: Element) => string | null,
): Map<string, DOMRect> {
  const map = new Map<string, DOMRect>();
  root.querySelectorAll(selector).forEach((el) => {
    const key = getKey(el);
    if (key) map.set(key, el.getBoundingClientRect());
  });
  return map;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Animates elements from a prior layout snapshot to their new positions (FLIP). */
export function applyFlipTransition(
  root: Element | DocumentFragment,
  selector: string,
  getKey: (el: Element) => string | null,
  before: Map<string, DOMRect>,
  options: FlipTransitionOptions = {},
): void {
  if (typeof window === "undefined" || before.size === 0 || prefersReducedMotion()) {
    return;
  }

  const duration = options.durationMs ?? 250;
  const easing = options.easing ?? "ease";

  root.querySelectorAll(selector).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;

    const key = getKey(el);
    if (!key) return;

    const prev = before.get(key);
    if (!prev) return;

    const next = el.getBoundingClientRect();
    const dx = prev.left - next.left;
    const dy = prev.top - next.top;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

    el.style.transition = "none";
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    void el.offsetHeight;

    el.style.transition = `transform ${duration}ms ${easing}`;
    el.style.transform = "";

    const cleanup = (): void => {
      el.style.transition = "";
      el.style.transform = "";
      el.removeEventListener("transitionend", cleanup);
    };
    el.addEventListener("transitionend", cleanup);
  });
}
