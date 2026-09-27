/**
 * Resolves a radius input into a valid CSS radius value.
 * @param input - The radius input (`none`, `sm`, `md`, `lg`, `full`, or CSS length).
 * @returns The resolved CSS radius value.
 */
export function resolveRadius(input: string) {
  const map: Record<string, string> = {
    none: "0px",
    sm: "var(--vu-radius-sm)",
    md: "var(--vu-radius-md)",
    lg: "var(--vu-radius-lg)",
    full: "9999px",
  };
  return Object.prototype.hasOwnProperty.call(map, input) ? map[input] : input;
}

/** Resolves a custom-property length on `scope` to px (handles rem tokens; not raw parseFloat). */
export function cssVarToPx(scope: Element, name: string, fallback: number): number {
  if (typeof document === "undefined" || typeof getComputedStyle === "undefined") return fallback;
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:var(${name})`;
  const root = scope instanceof Element && scope.shadowRoot ? scope.shadowRoot : scope;
  root.append(probe);
  const px = probe.getBoundingClientRect().width;
  probe.remove();
  return px > 0 ? px : fallback;
}
