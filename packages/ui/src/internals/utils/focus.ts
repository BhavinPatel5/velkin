/** Deepest `activeElement`, walking open shadow roots. */
export function getDeepActiveElement(
  root: Document | ShadowRoot = document,
): Element | null {
  let active: Element | null = root.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

/** True when `node` is `container` or a descendant (light + shadow via composed path). */
export function isElementWithin(container: Element, node: Node | null): boolean {
  if (!node) return false;
  if (container === node) return true;
  if (node instanceof Element && container.contains(node)) return true;
  if (!(node instanceof Element)) return false;
  const path = typeof node.getRootNode === "function" ? node.getRootNode() : null;
  if (path instanceof ShadowRoot && path.host) {
    return isElementWithin(container, path.host);
  }
  return false;
}

/**
 * Moves focus out of `container` before the host paints `aria-hidden` / `inert`.
 * Prefer `returnTo` when connected; otherwise blur the focused descendant.
 */
export function releaseFocusWithin(
  container: Element | null | undefined,
  returnTo?: HTMLElement | null,
): boolean {
  if (!container) return false;
  const root = container.getRootNode();
  const active = getDeepActiveElement(
    root instanceof ShadowRoot || root instanceof Document ? root : document,
  );
  if (!(active instanceof HTMLElement) || !isElementWithin(container, active)) {
    return false;
  }
  if (returnTo?.isConnected) {
    returnTo.focus({ preventScroll: true });
    return true;
  }
  active.blur();
  return true;
}
