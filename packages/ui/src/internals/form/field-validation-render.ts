import { html, nothing, type TemplateResult } from "lit";

/** Hint row — prop-or-slot: fallback inside `<slot name="hint">` (see `25-slots.mdc`). */
export function renderFieldHint(options: {
  hintId: string;
  hintText: string;
  hintClass?: string;
  hintTag?: "p" | "div";
  ariaLive?: "polite" | "assertive" | "off";
}): TemplateResult {
  const hintClass = options.hintClass ?? "field-hint";
  const ariaLive = options.ariaLive ?? nothing;
  const slotContent = html` <slot name="hint">${options.hintText}</slot> `;
  if (options.hintTag === "div") {
    return html`
      <div class=${hintClass} part="hint" id=${options.hintId} aria-live=${ariaLive}>
        ${slotContent}
      </div>
    `;
  }
  return html`
    <p class=${hintClass} part="hint" id=${options.hintId} aria-live=${ariaLive}>${slotContent}</p>
  `;
}

/** Error list under a field — default lines or `error` slot override. */
export function renderFieldErrors(options: {
  errorId: string;
  errors: string[];
  errorMessageClass?: string;
  errorLineClass?: string;
}): TemplateResult {
  const messageClass = options.errorMessageClass ?? "field-error-message";
  const lineClass = options.errorLineClass ?? "field-error-line";
  return html`
    <div class=${messageClass} part="error-message" id=${options.errorId} aria-live="polite">
      <slot name="error">
        ${options.errors.map((err) => html`<div class=${lineClass} part="error-line">${err}</div>`)}
      </slot>
    </div>
  `;
}
