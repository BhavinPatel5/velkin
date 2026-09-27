import { css } from "lit";
import { fieldChromeVariantStyles } from "../internals/form/field-chrome.style.js";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";
import { fieldToneSoftHost } from "../internals/styles/field-tone-soft.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const counterStyles = css`
  ${fieldValidationStyles}
  ${fieldChromeVariantStyles}
  ${fieldToneSoftHost}
  ${controlSizeMetricsTokens}

  :host {
    display: inline-block;
    box-sizing: border-box;
    font-family: var(--vu-font-sans);
    line-height: var(--vu-line-height-none);
    -webkit-tap-highlight-color: transparent;

    --ctr-soft: var(--fc-soft);
    --ctr-soft-fg: var(--fc-soft-fg);
    --ctr-soft-hover: var(--fc-soft-hover);

    --ctr-btn-py: var(--vu-csm-field-py);
    --ctr-btn-px: var(--vu-csm-field-btn-px);
    --ctr-min-block-size: var(--vu-csm-field-min-block-size);
    --ctr-font-size: var(--vu-csm-field-font-size);
    --ctr-icon-size: var(--vu-csm-field-icon-size);
    --ctr-input-width: 3rem;

    --ctr-bg: var(--fc-bg);
    --ctr-fg: var(--fc-fg);
    --ctr-border: var(--fc-border);
    --ctr-shadow: var(--fc-shadow);
    --ctr-radius: var(--fc-radius);
    --ctr-btn-icon: var(--vu-color-foreground);
    --ctr-btn-hover-bg: var(--surface-tone-hover);
    --ctr-btn-active-bg: var(--ctr-soft);
    --ctr-field-gap: var(--vu-csm-field-gap);
  }

  :host([disabled]) {
    opacity: var(--vu-opacity-disabled-control);
    pointer-events: none;
  }

  :host([block]) {
    display: block;
    inline-size: 100%;
  }

  :host([compact]) {
    --ctr-field-gap: var(--vu-space-1);
  }

  :host([size="sm"]) {
    --ctr-input-width: 2.5rem;
  }

  :host([size="lg"]) {
    --ctr-input-width: 3.5rem;
  }

  :host([radius="none"]) {
    --ctr-radius: 0;
    --fc-radius: 0;
  }

  :host([radius="sm"]) {
    --ctr-radius: var(--vu-control-radius-sm);
  }
  :host([radius="md"]) {
    --ctr-radius: var(--vu-control-radius-md);
  }
  :host([radius="lg"]) {
    --ctr-radius: var(--vu-control-radius-lg);
  }
  :host([radius="full"]) {
    --ctr-radius: var(--vu-radius-full);
  }

  :host([variant="underline"]) {
    --ctr-radius: 0;
    --fc-radius: 0;
  }

  .counter-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--ctr-field-gap);
    font-size: var(--ctr-font-size);
    line-height: var(--vu-line-height-snug);
  }

  .counter-label {
    display: block;
    color: var(--vu-color-foreground);
    font-weight: var(--vu-font-weight-medium);
    font-size: inherit;
    cursor: default;
  }

  .counter-label[aria-hidden="true"] {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .counter-control-row {
    display: inline-flex;
    align-items: stretch;
    inline-size: fit-content;
    max-inline-size: 100%;
  }

  :host([block]) .counter-control-row {
    display: flex;
    inline-size: 100%;
  }

  :host([block]) .container {
    flex: 1 1 auto;
    inline-size: 100%;
  }

  :host([block]) input {
    flex: 1 1 auto;
    max-inline-size: none;
  }

  .counter-affix {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    padding-block: var(--ctr-btn-py);
    padding-inline: var(--ctr-btn-px);
    color: var(--vu-color-muted);
    font-size: var(--ctr-font-size);
    font-weight: var(--vu-font-weight-normal);
    user-select: none;
  }

  .counter-affix[hidden] {
    display: none;
  }

  :host:not(:has([slot="start"])) [part="start"] {
    display: none;
  }

  :host:not(:has([slot="end"])) [part="end"] {
    display: none;
  }

  :host([radius="full"]) .container {
    corner-shape: round;
  }

  .container {
    display: inline-flex;
    align-items: stretch;
    inline-size: fit-content;
    min-block-size: var(--ctr-min-block-size);
    border-radius: var(--ctr-radius);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--ctr-bg);
    color: var(--ctr-fg);
    border: var(--ctr-border);
    box-shadow: var(--ctr-shadow);
    overflow: hidden;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  /* Outer shell ring clips under overflow:hidden — focus the interactive child instead. */
  .container:focus-within:has(:focus-visible) {
    box-shadow: var(--ctr-shadow);
  }

  vu-icon {
    display: inline-block;
    inline-size: 1em;
    block-size: 1em;
    font-size: var(--ctr-icon-size);
    color: currentColor;
  }

  button {
    flex: 0 0 auto;
    margin: 0;
    padding-block: var(--ctr-btn-py);
    padding-inline: var(--ctr-btn-px);
    min-inline-size: var(--ctr-min-block-size);
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--ctr-btn-icon);
    font: inherit;
    font-size: var(--ctr-font-size);
    line-height: var(--vu-line-height-none);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  @media (hover: hover) {
    button:not(:disabled):hover {
      background: var(--ctr-btn-hover-bg);
    }
  }

  button:not(:disabled):active {
    background: var(--ctr-btn-active-bg);
  }

  button:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
    z-index: 1;
  }

  button:disabled {
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
    pointer-events: none;
    color: var(--vu-color-muted);
  }

  input {
    flex: 1 1 auto;
    inline-size: var(--ctr-input-width);
    min-inline-size: var(--ctr-input-width);
    max-inline-size: var(--ctr-input-width);
    margin: 0;
    padding-block: var(--ctr-btn-py);
    padding-inline: var(--vu-space-1);
    border: 0;
    outline: none;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: var(--ctr-font-size);
    font-weight: var(--vu-font-weight-medium);
    font-variant-numeric: tabular-nums;
    text-align: center;
    line-height: var(--vu-line-height-none);
  }

  input:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
    z-index: 1;
  }

  input[type="number"] {
    appearance: textfield;
    -moz-appearance: textfield;
  }

  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[readonly] {
    cursor: default;
  }

  input:disabled {
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    button,
    [part="container"] {
      transition-duration: var(--vu-duration-instant);
    }
    button:not(:disabled):active {
      transform: none;
    }
  }

  @media (prefers-contrast: more) {
    .container {
      border-width: var(--vu-border-width-emphasis);
    }
    button:focus-visible,
    input:focus-visible {
      --vu-focus-ring: 0 0 0 2px var(--vu-color-background), 0 0 0 5px var(--vu-color-focus);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    [part="container"] {
      border: var(--vu-border-width-emphasis) solid CanvasText;
    }
    button:focus-visible,
    input:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }
  }
`;
