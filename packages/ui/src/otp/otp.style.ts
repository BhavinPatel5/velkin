import { css } from "lit";
import { fieldChromeVariantStyles } from "../internals/form/field-chrome.style.js";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";
import { fieldToneSoftHost } from "../internals/styles/field-tone-soft.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const otpStyles = css`
  ${fieldValidationStyles}
  ${fieldChromeVariantStyles}
  ${fieldToneSoftHost}
  ${controlSizeMetricsTokens}

  :host {
    display: inline-block;
    box-sizing: border-box;
    position: relative;
    font-family: var(--vu-font-sans);
    font-size: var(--vu-csm-field-font-size);
    font-weight: var(--vu-font-weight-normal);
    line-height: var(--vu-line-height-snug);
    letter-spacing: var(--vu-letter-spacing-normal);
    -webkit-tap-highlight-color: transparent;

    --otp-soft: var(--fc-soft);
    --otp-soft-hover: var(--fc-soft-hover);
    --otp-cell-size: var(--vu-csm-field-min-block-size);
    --otp-cell-font: var(--vu-csm-field-font-size);
    --otp-gap: var(--vu-space-2);
    --otp-field-gap: var(--vu-csm-field-gap);

    --otp-bg: var(--fc-bg);
    --otp-fg: var(--fc-fg);
    --otp-border: var(--fc-border);
    --otp-shadow: var(--fc-shadow);
    --otp-radius: var(--fc-radius);
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
  }

  :host([readonly]) .otp-label {
    cursor: default;
  }

  :host([block]) {
    display: block;
    inline-size: 100%;
  }

  :host([compact]) {
    --otp-field-gap: var(--vu-space-1);
  }

  :host([size="sm"]) {
    --otp-gap: var(--vu-space-1-5);
  }

  :host([size="lg"]) {
    --otp-gap: var(--vu-space-2-5);
  }

  :host([radius="none"]) {
    --otp-radius: 0;
    --fc-radius: 0;
  }

  :host([radius="sm"]) {
    --otp-radius: var(--vu-control-radius-sm);
  }
  :host([radius="md"]) {
    --otp-radius: var(--vu-control-radius-md);
  }
  :host([radius="lg"]) {
    --otp-radius: var(--vu-control-radius-lg);
  }
  :host([radius="full"]) {
    --otp-radius: var(--vu-radius-full);
  }

  :host([variant="underline"]) {
    --otp-radius: 0;
    --fc-radius: 0;
  }

  .otp-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--otp-field-gap);
  }

  .otp-label {
    display: block;
    color: var(--vu-color-foreground);
    font-weight: var(--vu-font-weight-medium);
    font-size: inherit;
    line-height: var(--vu-line-height-snug);
    text-align: start;
    cursor: default;
  }

  .otp-label[hidden] {
    display: none;
  }

  :host:not(:has([slot="label"])) .otp-label:not(:has([part="text"])) {
    display: none;
  }

  ::slotted(*) {
    font-size: inherit;
    line-height: var(--vu-line-height-snug);
  }

  .otp-cells {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    gap: var(--otp-gap);
    inline-size: fit-content;
    max-inline-size: 100%;
  }

  :host([block]) .otp-cells {
    justify-content: space-between;
    inline-size: 100%;
  }

  :dir(rtl) .otp-cells {
    flex-direction: row-reverse;
  }

  .otp-cells.shake {
    animation: otp-shake var(--vu-duration-normal) var(--vu-ease-out-cubic);
    animation-iteration-count: 1;
  }

  @keyframes otp-shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(calc(-1 * var(--vu-space-0-75))); }
    50% { transform: translateX(var(--vu-space-0-75)); }
    75% { transform: translateX(calc(-1 * var(--vu-space-0-75))); }
    100% { transform: translateX(0); }
  }

  .otp-cell {
    box-sizing: border-box;
    inline-size: var(--otp-cell-size);
    block-size: var(--otp-cell-size);
    padding: 0;
    margin: 0;
    text-align: center;
    font-family: var(--vu-font-sans);
    font-size: var(--otp-cell-font);
    font-weight: var(--vu-font-weight-medium);
    line-height: var(--vu-line-height-none);
    color: var(--otp-fg);
    background: var(--otp-bg);
    border: var(--otp-border);
    border-radius: var(--otp-radius);
    corner-shape: var(--vu-corner-shape, round);
    box-shadow: var(--otp-shadow);
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic);
    caret-color: var(--fc-interaction-color);
  }

  :host([variant="underline"]) .otp-cell {
    background: transparent;
    border: var(--otp-border);
    border-block-end: var(--vu-border-width) solid var(--vu-color-border);
    border-radius: 0;
    box-shadow: none;
  }

  :host([variant="underline"]) .otp-cell:focus-visible {
    border-block-end-color: var(--fc-interaction-color);
    box-shadow: none;
  }

  @media (hover: hover) {
    :host(:not([disabled]):not([readonly])) .otp-cell:hover {
      background: var(--otp-soft);
    }

    :host([variant="underline"]:not([disabled]):not([readonly])) .otp-cell:hover {
      background: transparent;
      border-block-end-color: var(--fc-interaction-color);
    }
  }

  .otp-cell:focus {
    outline: none;
  }

  .otp-cell:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  :host([variant="underline"]) .otp-cell:focus-visible {
    box-shadow: none;
  }

  .otp-cell:disabled {
    cursor: not-allowed;
  }

  .otp-cell[readonly] {
    cursor: default;
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) .otp-cell {
      border-width: var(--vu-border-width-emphasis);
    }

    :host([variant="underline"]) .otp-cell {
      border-block-end-width: var(--vu-border-width-emphasis);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    .otp-cell:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .otp-cells.shake {
      animation: none;
    }

    .otp-cell {
      transition-duration: var(--vu-duration-instant);
    }
  }
`;
