import { css } from "lit";

/** Shared Role E variant tokens (`--fc-*`); map to a component prefix in `*.style.ts`. */
export const fieldChromeVariantStyles = css`
  :host {
    --fc-interaction-color: var(--vu-color-accent);
    --fc-bg: var(--vu-color-field);
    --fc-fg: var(--vu-color-field-foreground);
    /* Same width as outline so default/underline don't jump in size. */
    --fc-border: var(--vu-border-width) solid var(--vu-color-field-border);
    --fc-border-bottom: 0;
    --fc-shadow: var(--vu-shadow-field);
    --fc-radius: var(--vu-control-radius-md);
  }

  :host([variant="default"]) {
    --fc-bg: var(--vu-color-field);
    --fc-fg: var(--vu-color-field-foreground);
    /* shadcn Input — white field on white page separates via stroke, not fill. */
    --fc-border: var(--vu-border-width) solid var(--vu-color-field-border);
    --fc-border-bottom: 0;
    --fc-shadow: var(--vu-shadow-field);
  }

  :host([variant="outline"]) {
    --fc-bg: transparent;
    --fc-fg: var(--vu-color-field-foreground);
    --fc-border: var(--vu-border-width) solid var(--vu-color-border);
    --fc-border-bottom: 0;
    --fc-shadow: none;
  }

  :host([variant="underline"]) {
    --fc-bg: transparent;
    --fc-fg: var(--vu-color-foreground);
    --fc-border: var(--vu-border-width) solid transparent;
    --fc-border-bottom: var(--vu-border-width) solid var(--vu-color-border);
    --fc-shadow: none;
    --fc-radius: 0;
  }

  /* Tone — overrides field background for non-underline variants.
     The variant="underline" block above wins specificity when both attrs are
     set because it resets --fc-bg to transparent regardless. */
  :host([tone="subtle"]:not([variant="underline"]):not([variant="outline"])) {
    --fc-bg: var(--vu-color-surface-secondary);
    --fc-fg: var(--vu-color-surface-secondary-foreground);
  }

  :host([tone="strong"]:not([variant="underline"]):not([variant="outline"])) {
    --fc-bg: var(--vu-color-surface-tertiary);
    --fc-fg: var(--vu-color-surface-tertiary-foreground);
  }

  /* Role E shells: .container (input/combobox/counter), [part=container] (date-picker/text-editor). */
  :host([variant="underline"]) .container,
  :host([variant="underline"]) [part="container"] {
    border: var(--fc-border);
    border-radius: 0;
    border-bottom: var(--fc-border-bottom);
  }

  :host([validationactive]:is(:invalid, [invalid])) {
    --fc-interaction-color: var(--vu-color-danger);
    --vu-focus-ring: 0 0 0 2px var(--vu-color-background), 0 0 0 4px var(--vu-color-danger);
  }

  /* Resting invalid — stays visible after blur so users can scan the form. */
  :host([validationactive]:is(:invalid, [invalid])) .container,
  :host([validationactive]:is(:invalid, [invalid])) [part="container"],
  :host([validationactive]:is(:invalid, [invalid])) .otp-cell,
  :host([validationactive]:is(:invalid, [invalid])) .serial-cell,
  :host([validationactive]:is(:invalid, [invalid])) [part="segments"] {
    border-color: var(--fc-interaction-color);
  }

  /* Underline keeps only the baseline stroke — reset box sides that border-color painted. */
  :host([validationactive]:is(:invalid, [invalid])[variant="underline"]) .container,
  :host([validationactive]:is(:invalid, [invalid])[variant="underline"]) [part="container"],
  :host([validationactive]:is(:invalid, [invalid])[variant="underline"]) .otp-cell,
  :host([validationactive]:is(:invalid, [invalid])[variant="underline"]) .serial-cell,
  :host([validationactive]:is(:invalid, [invalid])[variant="underline"]) [part="segments"] {
    border-color: transparent;
    border-bottom-color: var(--fc-interaction-color);
    border-block-end-color: var(--fc-interaction-color);
  }

  /* Shared Role E shell focus — box-shadow ring (never outline: var(--vu-focus-ring)). */
  /* OTP/serial keep focus on the cell itself (component CSS); do not ring the group wrapper. */
  .container:focus-within:has(:focus-visible),
  [part="container"]:focus-within:has(:focus-visible) {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  :host([variant="underline"]) .container:focus-within:has(:focus-visible),
  :host([variant="underline"]) [part="container"]:focus-within:has(:focus-visible),
  :host([variant="underline"]) .container[open],
  :host([variant="underline"]) [part="container"][open] {
    border-color: transparent;
    border-bottom-color: var(--fc-interaction-color);
    border-block-end-color: var(--fc-interaction-color);
    box-shadow: none;
  }
`;
