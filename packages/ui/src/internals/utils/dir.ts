/** Resolves RTL from computed style or an explicit override. */
export function resolveIsRtl(el: Element | null, explicit?: boolean): boolean {
  if (explicit !== undefined) return explicit;
  if (!(el instanceof Element) || typeof getComputedStyle === "undefined") return false;
  return getComputedStyle(el).direction === "rtl";
}
