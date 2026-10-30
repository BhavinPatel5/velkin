/** Keeps composite keyboard handlers from intercepting nested native or custom controls. */
export function originatesInInteractiveControl(event: Event, boundary: Element): boolean {
  for (const target of event.composedPath()) {
    if (target === boundary) break;
    if (!(target instanceof Element)) continue;
    if (target.matches('input, textarea, select, button, a[href], [contenteditable]:not([contenteditable="false"]), [role="button"], [role="combobox"], [role="slider"], [tabindex]')) return true;
    if (target.localName.includes("-") && target.closest("[data-row-id]")) return true;
  }
  return false;
}
