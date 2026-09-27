/**
 * Shared `<slot>` utilities for `vu-*` components.
 *
 * ## Quick pick
 *
 * | Need | Helper / markup |
 * |------|------------------|
 * | `label` / `hint` string **or** slotted HTML | `<slot name="hint">${this.hint}</slot>` + `slotOrPropVisible(host, "hint", this.hint)` |
 * | Optional `prefix` / `start` (no string prop) | `<slot name="prefix"></slot>` + `hasLightChildrenInSlot(host, "prefix")` |
 * | Override built-in icon | `<slot name="icon">${defaultTpl}</slot>` — no presence getter |
 * | Children added/removed later | `@slotchange` + `hasAssignedContent` or `bindSlotPresence` |
 *
 */

export interface HasAssignedContentOptions {
  /** When true, counts fallback as assigned — unsafe for prop-driven fallbacks (re-render loops). */
  flatten?: boolean;
  /** Treat whitespace-only text nodes as empty (default true). */
  ignoreWhitespaceText?: boolean;
  /** Follow through relay slots that have no assigned nodes. */
  relayAware?: boolean;
}

/** True when the rendered slot has user-assigned nodes (fallback excluded unless `flatten`). */
export function hasAssignedContent(
  slot: HTMLSlotElement | null | undefined,
  options: HasAssignedContentOptions = {},
): boolean {
  if (!slot) return false;
  const { flatten = false, ignoreWhitespaceText = true, relayAware = false } = options;
  const nodes = slot.assignedNodes({ flatten });
  return nodes.some((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (relayAware && element instanceof HTMLSlotElement) {
        return hasAssignedContent(element, options);
      }
      return true;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      if (!ignoreWhitespaceText) return true;
      return (node.textContent ?? "").trim().length > 0;
    }
    return false;
  });
}

/** Element children — tolerates `@lit-labs/ssr` DOM shims where `children` may be missing. */
export function lightChildElements(host: Element): Element[] {
  const list = host.children;
  if (list) return Array.from(list);
  return Array.from(host.childNodes ?? []).filter(
    (node): node is Element => node.nodeType === Node.ELEMENT_NODE,
  );
}

/** All child nodes — tolerates SSR DOM shims where `childNodes` may be missing. */
export function lightChildNodes(host: Element): ChildNode[] {
  return Array.from(host.childNodes ?? []);
}

/**
 * True when light DOM assigns to `slot="name"` (or default slot when `name` is `""`).
 * Use in render getters for prop-or-slot and slot-only chrome — not `@slotchange`.
 */
export function hasLightChildrenInSlot(host: Element, name = ""): boolean {
  for (const child of lightChildElements(host)) {
    const childSlot = child.getAttribute("slot") ?? "";
    if (childSlot === name) return true;
  }
  if (name === "") {
    for (const node of lightChildNodes(host)) {
      if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim().length > 0) {
        return true;
      }
    }
  }
  return false;
}

/** True when a string prop or named slot has content (label, hint, legend). */
export function slotOrPropVisible(host: Element, slotName: string, propText = ""): boolean {
  return !!propText.trim() || hasLightChildrenInSlot(host, slotName);
}

/**
 * Light-DOM presence that looks through relay `<slot>` children.
 * Use when a parent shell forwards its own slots into a child host, so an unfilled
 * relay does not read as content (`vu-ai-chat` → `vu-chat` regions).
 */
export function hasSlottedOrRelayedContent(host: Element, name = ""): boolean {
  for (const child of lightChildElements(host)) {
    if ((child.getAttribute("slot") ?? "") !== name) continue;
    if (child.localName !== "slot") return true;
    const relay = child as HTMLSlotElement;
    if (typeof relay.assignedNodes !== "function") continue;
    if (hasAssignedContent(relay, { relayAware: true })) return true;
  }
  if (name === "") {
    for (const node of lightChildNodes(host)) {
      if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim().length > 0) {
        return true;
      }
    }
  }
  return false;
}

/** Both halves of slot-presence wiring for dynamic membership slots. */
export interface SlotPresenceBinding {
  sync(slot: HTMLSlotElement | null | undefined): void;
  onSlotChange(event: Event): void;
}

/**
 * `@slotchange` + optional `@state` for slots whose assigned nodes change at runtime.
 * For static chrome, use `hasLightChildrenInSlot` / `slotOrPropVisible` getters instead.
 */
export function bindSlotPresence(
  setHas: (hasContent: boolean) => void,
  options?: HasAssignedContentOptions,
): SlotPresenceBinding {
  const sync: SlotPresenceBinding["sync"] = (slot) => {
    setHas(hasAssignedContent(slot, options));
  };
  return {
    sync,
    onSlotChange(event: Event) {
      sync(event.currentTarget as HTMLSlotElement | null);
    },
  };
}
