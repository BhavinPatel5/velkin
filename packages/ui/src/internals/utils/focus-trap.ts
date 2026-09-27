const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Dismiss chrome — never the default initial focus (APG: skip cancel/close). */
const DISMISS_SELECTOR = '[part="close-button"], .close-button';

export type FocusTrapOptions = {
  /** Element to focus when the trap activates; defaults to first non-dismiss focusable (or `root`). */
  initialFocus?: HTMLElement | null;
  /** Restored when the trap deactivates (in addition to any caller restore). */
  returnFocus?: HTMLElement | null;
};

export type FocusTrapHandle = {
  deactivate: () => void;
};

function isShown(el: HTMLElement): boolean {
  if (el.closest("[hidden], [inert]")) return false;
  if (el.closest('[aria-hidden="true"]')) return false;
  return true;
}

function isFocusable(el: HTMLElement): boolean {
  return el.matches(FOCUSABLE_SELECTOR) && isShown(el);
}

/** Focusable nodes in composed tree order (shadow + slotted), skipping hidden subtrees. */
export function collectFocusableIn(root: ParentNode): HTMLElement[] {
  const out: HTMLElement[] = [];

  const visit = (node: Node): void => {
    if (node instanceof HTMLSlotElement) {
      for (const assigned of node.assignedNodes({ flatten: true })) visit(assigned);
      return;
    }
    if (node instanceof ShadowRoot) {
      for (const child of node.children) visit(child);
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.hidden || node.getAttribute("aria-hidden") === "true") return;
    if (isFocusable(node)) out.push(node);
    if (node.shadowRoot) {
      visit(node.shadowRoot);
      return;
    }
    for (const child of node.children) visit(child);
  };

  if (root instanceof Element && root.shadowRoot) {
    visit(root.shadowRoot);
    return out;
  }
  const kids =
    root instanceof Element || root instanceof DocumentFragment || root instanceof ShadowRoot
      ? root.children
      : [];
  for (const child of kids) visit(child);
  return out;
}

/** First composed focusable, or `null`. */
export function queryFocusableIn(root: ParentNode): HTMLElement | null {
  return collectFocusableIn(root)[0] ?? null;
}

/** Initial overlay focus: `[autofocus]`, else first non-dismiss control, else `null`. */
export function queryOverlayInitialFocus(root: ParentNode): HTMLElement | null {
  const items = collectFocusableIn(root);
  const autofocus = items.find((el) => el.hasAttribute("autofocus"));
  if (autofocus) return autofocus;
  return items.find((el) => !el.matches(DISMISS_SELECTOR)) ?? null;
}

/** Traps Tab / Shift+Tab within `root` until `deactivate()` is called. */
export function activateFocusTrap(
  root: HTMLElement,
  options: FocusTrapOptions = {},
): FocusTrapHandle {
  const focusables = () => collectFocusableIn(root);

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Tab") return;
    const items = focusables();
    if (items.length === 0) {
      event.preventDefault();
      root.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement as HTMLElement | null;
    const inside = !!active && items.includes(active);

    if (event.shiftKey) {
      if (active === first || !inside) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last || !inside) {
      event.preventDefault();
      first.focus();
    }
  };

  root.addEventListener("keydown", onKeyDown);

  const initial = options.initialFocus ?? queryOverlayInitialFocus(root) ?? root;
  initial.focus();

  return {
    deactivate: () => {
      root.removeEventListener("keydown", onKeyDown);
      const target = options.returnFocus;
      if (target?.isConnected) target.focus();
    },
  };
}
