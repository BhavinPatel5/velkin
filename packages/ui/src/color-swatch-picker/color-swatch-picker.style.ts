import { css } from "lit";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";

export const colorSwatchPickerStyles = css`
  ${fieldValidationStyles}

  :host {
    display: inline-block;
    box-sizing: border-box;
    color: var(--vu-color-foreground);
    font-family: var(--vu-font-sans);

    --color-swatch-picker-columns: 0;
    --color-swatch-picker-gap: var(--vu-space-1-5, 0.375rem);
    --color-swatch-picker-width: auto;
  }

  .color-swatch-picker-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-inline-size: 0;
  }

  .error-message {
    margin-block-start: var(--vu-space-half);
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
  }

  :host([layout="grid"]) [part="base"] {
    display: grid;
    gap: var(--color-swatch-picker-gap);
    grid-template-columns: var(--color-swatch-picker-template);
    inline-size: var(--color-swatch-picker-width);
    max-inline-size: 100%;
  }

  :host([layout="stack"]) [part="base"] {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--color-swatch-picker-gap);
    inline-size: var(--color-swatch-picker-width);
    max-inline-size: 100%;
  }

  ::slotted(vu-color-swatch:focus-visible) {
    outline: none;
  }

  @media (prefers-reduced-motion: reduce) {
    :host([layout="grid"]) [part="base"],
    :host([layout="stack"]) [part="base"] {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    :host([layout="grid"]) [part="base"],
    :host([layout="stack"]) [part="base"] {
      outline: var(--vu-border-width-emphasis) solid transparent;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    :host([disabled]) {
      opacity: 1;
      color: GrayText;
    }
  }
`;
