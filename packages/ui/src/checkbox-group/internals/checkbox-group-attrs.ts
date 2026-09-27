import type { VuCheckbox } from "../../checkbox/checkbox.js";

/** Tracks which forwarded props on a group member were set by the coordinator. */
export type CheckboxGroupAttrOwnership = WeakMap<Element, Set<string>>;

export function checkboxGroupOwns(owned: CheckboxGroupAttrOwnership, el: Element, prop: string): boolean {
  return owned.get(el)?.has(prop) ?? false;
}

export function checkboxGroupSetOwnership(
  owned: CheckboxGroupAttrOwnership,
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

export function checkboxGroupClaimAttribute(
  owned: CheckboxGroupAttrOwnership,
  el: VuCheckbox,
  prop: "variant" | "color" | "tone" | "size" | "radius",
  value: string,
): void {
  const isOwned = checkboxGroupOwns(owned, el, prop);
  if (isOwned || !el.hasAttribute(prop)) {
    if (prop === "variant") el.variant = value as VuCheckbox["variant"];
    else if (prop === "color") el.color = value as VuCheckbox["color"];
    else if (prop === "tone") el.tone = value as VuCheckbox["tone"];
    else if (prop === "size") el.size = value as VuCheckbox["size"];
    else el.radius = value as VuCheckbox["radius"];
    checkboxGroupSetOwnership(owned, el, prop, true);
  }
}

export function checkboxGroupClaimBooleanAttribute(
  owned: CheckboxGroupAttrOwnership,
  el: VuCheckbox,
  prop: "disabled",
  value: boolean,
): void {
  if (value) {
    const isOwned = checkboxGroupOwns(owned, el, prop);
    if (isOwned || !el.hasAttribute(prop)) {
      el[prop] = true;
      checkboxGroupSetOwnership(owned, el, prop, true);
    }
  } else {
    checkboxGroupReleaseAttribute(owned, el, prop);
  }
}

export function checkboxGroupReleaseAttribute(
  owned: CheckboxGroupAttrOwnership,
  el: VuCheckbox,
  prop: string,
): void {
  if (!checkboxGroupOwns(owned, el, prop)) return;
  if (prop === "disabled") el.disabled = false;
  else if (prop === "variant" || prop === "color" || prop === "tone" || prop === "size" || prop === "radius") {
    el.removeAttribute(prop);
  }
  checkboxGroupSetOwnership(owned, el, prop, false);
}
