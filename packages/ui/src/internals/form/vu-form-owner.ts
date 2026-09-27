/** Host surface for `<vu-form>` without importing the component (avoids cycles). */
type VuFormHost = HTMLElement & { formElement?: HTMLFormElement | null };

/** Native `<form>` rendered in `<vu-form>`'s shadow tree. */
export function closestVuFormElement(el: Element): HTMLFormElement | null {
  const host = el.closest("vu-form") as VuFormHost | null;
  if (!host) return null;
  if (host.formElement instanceof HTMLFormElement) return host.formElement;
  const inShadow = host.shadowRoot?.querySelector("form");
  return inShadow instanceof HTMLFormElement ? inShadow : null;
}

/** Resolves a `form="id"` target, including a shadow-hosted `<vu-form>` form. */
export function formById(el: Element, id: string): HTMLFormElement | null {
  const trimmed = id.trim();
  if (!trimmed) return null;

  const root = el.getRootNode() as Document | ShadowRoot;
  const found = root.getElementById?.(trimmed);
  if (found instanceof HTMLFormElement) return found;

  const vuHost =
    found?.localName === "vu-form"
      ? (found as VuFormHost)
      : (el.closest("vu-form") as VuFormHost | null);

  const inShadow = vuHost?.shadowRoot?.getElementById(trimmed);
  if (inShadow instanceof HTMLFormElement) return inShadow;
  if (vuHost?.formElement?.id === trimmed) return vuHost.formElement ?? null;
  return null;
}
