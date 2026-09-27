import { css, unsafeCSS } from "lit";

/**
 * Fail-open collapse for optional named-slot chrome.
 * Place after the target's `display:` rule. Do not group with `[hidden]`.
 * Use `:host:not(:has())` — `:has()` inside `:host()` is dropped by the CSS parser.
 * Slot names must be static author strings — never user input.
 */
export function collapseWhenSlotMissing(slotName: string, target: string) {
  return css`
    :host:not(:has([slot="${unsafeCSS(slotName)}"])) ${unsafeCSS(target)} {
      display: none;
    }
  `;
}
