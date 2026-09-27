import type { VuRadio } from "../../radio/radio.js";

/** Tracks which forwarded props on a group member were set by the coordinator. */
export type RadioGroupAttrOwnership = WeakMap<Element, Set<string>>;

export function radioGroupOwns(owned: RadioGroupAttrOwnership, el: Element, prop: string): boolean {
  return owned.get(el)?.has(prop) ?? false;
}

export function radioGroupSetOwnership(
  owned: RadioGroupAttrOwnership,
  el: Element,
  prop: string,
  isOwned: boolean,
): void {
  let set = owned.get(el);
  if (!set) {
    if (!isOwned) return;
    set = new Set();
    owned.set(el, set);
  }
  if (isOwned) set.add(prop);
  else set.delete(prop);
}

export function radioGroupClaimAttribute(
  owned: RadioGroupAttrOwnership,
  el: VuRadio,
  prop: "variant" | "color" | "tone" | "size",
  value: string,
): void {
  const isOwned = radioGroupOwns(owned, el, prop);
  if (isOwned || !el.hasAttribute(prop)) {
    if (prop === "variant") el.variant = value as VuRadio["variant"];
    else if (prop === "color") el.color = value as VuRadio["color"];
    else if (prop === "tone") el.tone = value as VuRadio["tone"];
    else el.size = value as VuRadio["size"];
    radioGroupSetOwnership(owned, el, prop, true);
  }
}

export function radioGroupClaimBooleanAttribute(
  owned: RadioGroupAttrOwnership,
  el: VuRadio,
  prop: "disabled",
  value: boolean,
): void {
  if (value) {
    const isOwned = radioGroupOwns(owned, el, prop);
    if (isOwned || !el.hasAttribute(prop)) {
      el[prop] = true;
      radioGroupSetOwnership(owned, el, prop, true);
    }
  } else {
    radioGroupReleaseAttribute(owned, el, prop);
  }
}

export function radioGroupReleaseAttribute(
  owned: RadioGroupAttrOwnership,
  el: VuRadio,
  prop: string,
): void {
  if (!radioGroupOwns(owned, el, prop)) return;
  if (prop === "disabled") el.disabled = false;
  radioGroupSetOwnership(owned, el, prop, false);
}
