import { css } from "lit";
import { fieldChromeVariantStyles } from "../internals/form/field-chrome.style.js";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";
import { fieldToneSoftHost } from "../internals/styles/field-tone-soft.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const serialStyles = css`
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

    --serial-soft: var(--fc-soft);
    --serial-soft-hover: var(--fc-soft-hover);
    --serial-cell-size: var(--vu-csm-field-min-block-size);
    --serial-cell-font: var(--vu-csm-field-font-size);
    --serial-gap: var(--vu-space-2);
    --serial-group-gap: var(--vu-space-2);
    --serial-field-gap: var(--vu-csm-field-gap);

    --serial-bg: var(--fc-bg);
    --serial-fg: var(--fc-fg);
    --serial-border: var(--fc-border);
    --serial-shadow: var(--fc-shadow);
    --serial-radius: var(--fc-radius);
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
  }

  :host([readonly]) .serial-label {
    cursor: default;
  }

  :host([block]) {
    display: block;
    inline-size: 100%;
  }

  :host([compact]) {
    --serial-field-gap: var(--vu-space-1);
  }

  :host([size="sm"]) {
    --serial-gap: var(--vu-space-1-5);
    --serial-group-gap: var(--vu-space-1-5);
  }

  :host([size="lg"]) {
    --serial-gap: var(--vu-space-2-5);
    --serial-group-gap: var(--vu-space-2-5);
  }

  :host([radius="none"]) {
    --serial-radius: 0;
    --fc-radius: 0;
  }

  :host([radius="sm"]) {
    --serial-radius: var(--vu-control-radius-sm);
  }
  :host([radius="md"]) {
    --serial-radius: var(--vu-control-radius-md);
  }
  :host([radius="lg"]) {
    --serial-radius: var(--vu-control-radius-lg);
  }
  :host([radius="full"]) {
    --serial-radius: var(--vu-radius-full);
  }

  :host([variant="underline"]) {
    --serial-radius: 0;
    --fc-radius: 0;
  }

  .serial-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--serial-field-gap);
  }

  .serial-label {
    display: block;
    color: var(--vu-color-foreground);
    font-weight: var(--vu-font-weight-medium);
    font-size: inherit;
    line-height: var(--vu-line-height-snug);
    text-align: start;
    cursor: default;
  }

  .serial-label[hidden] {
    display: none;
  }

  :host:not(:has([slot="label"])) .serial-label:not(:has([part="text"])) {
    display: none;
  }

  ::slotted(*) {
    font-size: inherit;
    line-height: var(--vu-line-height-snug);
  }

  .serial-cells {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--serial-group-gap);
    inline-size: fit-content;
    max-inline-size: 100%;
  }

  :host([block]) .serial-cells {
    justify-content: space-between;
    inline-size: 100%;
  }

  :dir(rtl) .serial-cells {
    flex-direction: row-reverse;
  }

  .serial-cells.shake {
    animation: serial-shake var(--vu-duration-normal) var(--vu-ease-out-cubic);
    animation-iteration-count: 1;
  }

  @keyframes serial-shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(calc(-1 * var(--vu-space-0-75))); }
    50% { transform: translateX(var(--vu-space-0-75)); }
    75% { transform: translateX(calc(-1 * var(--vu-space-0-75))); }
    100% { transform: translateX(0); }
  }

  .serial-group {
    display: inline-flex;
    align-items: center;
    gap: var(--serial-gap);
  }

  .serial-separator {
    font-size: var(--serial-cell-font);
    font-weight: var(--vu-font-weight-medium);
    line-height: var(--vu-line-height-none);
    color: var(--vu-color-muted);
    user-select: none;
    padding-inline: var(--vu-space-half);
  }

  .serial-cell {
    box-sizing: border-box;
    inline-size: var(--serial-cell-size);
    block-size: var(--serial-cell-size);
    padding: 0;
    margin: 0;
    text-align: center;
    font-family: var(--vu-font-sans);
    font-size: var(--serial-cell-font);
    font-weight: var(--vu-font-weight-medium);
    line-height: var(--vu-line-height-none);
    color: var(--serial-fg);
    background: var(--serial-bg);
    border: var(--serial-border);
    border-radius: var(--serial-radius);
    corner-shape: var(--vu-corner-shape, round);
    box-shadow: var(--serial-shadow);
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic);
    caret-color: var(--fc-interaction-color);
  }

  :host([variant="underline"]) .serial-cell {
    background: transparent;
    border: var(--serial-border);
    border-block-end: var(--vu-border-width) solid var(--vu-color-border);
    border-radius: 0;
    box-shadow: none;
  }

  :host([variant="underline"]) .serial-cell:focus-visible {
    border-block-end-color: var(--fc-interaction-color);
    box-shadow: none;
  }

  @media (hover: hover) {
    :host(:not([disabled]):not([readonly])) .serial-cell:hover {
      background: var(--serial-soft);
    }

    :host([variant="underline"]:not([disabled]):not([readonly])) .serial-cell:hover {
      background: transparent;
      border-block-end-color: var(--fc-interaction-color);
    }
  }

  .serial-cell:focus {
    outline: none;
  }

  .serial-cell:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  :host([variant="underline"]) .serial-cell:focus-visible {
    box-shadow: none;
  }

  .serial-cell:disabled {
    cursor: not-allowed;
  }

  .serial-cell[readonly] {
    cursor: default;
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) .serial-cell {
      border-width: var(--vu-border-width-emphasis);
    }

    :host([variant="underline"]) .serial-cell {
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
    .serial-cell:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .serial-cells.shake {
      animation: none;
    }

    .serial-cell {
      transition-duration: var(--vu-duration-instant);
    }
  }
`;
