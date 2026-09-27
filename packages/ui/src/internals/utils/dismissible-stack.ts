/** Entry in the global overlay dismiss stack (dialog, drawer, popover, …). */
export type DismissibleEntry = {
  host: HTMLElement;
  /** Called when this entry is topmost and Escape requests dismiss. */
  onDismiss: () => void;
  /** When false, Escape is ignored for this entry (e.g. persistent dialog). */
  canDismiss?: () => boolean;
};

const stack: DismissibleEntry[] = [];
let listening = false;

function onDocumentKeyDown(event: KeyboardEvent): void {
  if (event.key !== "Escape" || stack.length === 0) return;
  const top = stack[stack.length - 1];
  if (top.canDismiss && !top.canDismiss()) return;
  event.preventDefault();
  event.stopPropagation();
  top.onDismiss();
}

function ensureListener(): void {
  if (listening || typeof document === "undefined") return;
  document.addEventListener("keydown", onDocumentKeyDown, { capture: true });
  listening = true;
}

function removeListenerIfEmpty(): void {
  if (stack.length > 0 || !listening || typeof document === "undefined") return;
  document.removeEventListener("keydown", onDocumentKeyDown, { capture: true });
  listening = false;
}

/** Push an overlay onto the dismiss stack; registers the document Escape listener once. */
export function registerDismissible(entry: DismissibleEntry): void {
  const idx = stack.findIndex((e) => e.host === entry.host);
  if (idx >= 0) stack.splice(idx, 1);
  stack.push(entry);
  ensureListener();
}

/** Remove an overlay from the dismiss stack. */
export function unregisterDismissible(host: HTMLElement): void {
  const idx = stack.findIndex((e) => e.host === host);
  if (idx >= 0) stack.splice(idx, 1);
  removeListenerIfEmpty();
}

/** True when `host` is the topmost registered dismissible overlay. */
export function isTopDismissible(host: HTMLElement): boolean {
  if (stack.length === 0) return false;
  return stack[stack.length - 1].host === host;
}

/** @internal Test-only stack reset. */
export function resetDismissibleStackForTests(): void {
  stack.length = 0;
  removeListenerIfEmpty();
}
