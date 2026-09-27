import { css } from "lit";

/** Shared hint + error typography for form field components (counter, checkbox, input-like). */
export const fieldValidationStyles = css`
  :host {
    --fc-interaction-color: var(--vu-color-accent);
  }

  :host([validationactive]:is(:invalid, [invalid])) {
    --fc-interaction-color: var(--vu-color-danger);
    --vu-focus-ring: 0 0 0 var(--vu-border-width-emphasis) var(--vu-color-danger);
  }

  :host([validationactive]:is(:invalid, [invalid])) .input-label,
  :host([validationactive]:is(:invalid, [invalid])) .combobox-label,
  :host([validationactive]:is(:invalid, [invalid])) .counter-label,
  :host([validationactive]:is(:invalid, [invalid])) .date-field-label,
  :host([validationactive]:is(:invalid, [invalid])) .otp-label,
  :host([validationactive]:is(:invalid, [invalid])) .serial-label,
  :host([validationactive]:is(:invalid, [invalid])) .slider-label,
  :host([validationactive]:is(:invalid, [invalid])) .range-label,
  :host([validationactive]:is(:invalid, [invalid])) .checkbox-label-text,
  :host([validationactive]:is(:invalid, [invalid])) .radio-label-text,
  :host([validationactive]:is(:invalid, [invalid])) .cbg-label-text,
  :host([validationactive]:is(:invalid, [invalid])) .rbg-label-text {
    color: var(--vu-color-danger);
  }

  .field-hint {
    font-size: var(--vu-font-size-xs);
    line-height: var(--vu-line-height-normal);
    color: var(--vu-color-muted);
    margin: 0;
    font-family: var(--vu-font-sans);
  }

  .field-error-message {
    font-size: var(--vu-font-size-xs);
    line-height: var(--vu-line-height-normal);
    color: var(--vu-color-danger);
    margin: 0;
    font-family: var(--vu-font-sans);
  }

  .field-error-line + .field-error-line {
    margin-block-start: var(--vu-space-half);
  }

  :host([compact]) .field-hint,
  :host([compact]) .field-error-message {
    margin-block-start: 2px;
  }
`;
