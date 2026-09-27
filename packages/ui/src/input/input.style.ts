import { css } from "lit";
import { fieldChromeVariantStyles } from "../internals/form/field-chrome.style.js";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";
import { fieldToneSoftHost } from "../internals/styles/field-tone-soft.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

/** Role E field chrome aligned with `vu-counter` / `vu-combobox`. */
export const inputStyles = css`
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

    --inp-soft: var(--fc-soft);
    --inp-soft-fg: var(--fc-soft-fg);
    --inp-soft-hover: var(--fc-soft-hover);

    --inp-py: var(--vu-csm-field-py);
    --inp-px: var(--vu-csm-field-px);
    --inp-min-block-size: var(--vu-csm-field-min-block-size);
    --inp-font-size: var(--vu-csm-field-font-size);
    --inp-icon-size: var(--vu-csm-field-icon-size);
    --inp-field-gap: var(--vu-csm-field-gap);
    --inp-rows: 6;

    --inp-bg: var(--fc-bg);
    --inp-fg: var(--fc-fg);
    --inp-border: var(--fc-border);
    --inp-shadow: var(--fc-shadow);
    --inp-radius: var(--fc-radius);
    --inp-muted: var(--vu-color-muted);
    --inp-accent: var(--vu-color-accent);
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
    --inp-field-gap: var(--vu-space-1);
    --inp-min-block-size: var(--vu-control-height-sm);
  }

  :host([radius="none"]) {
    --inp-radius: 0;
    --fc-radius: 0;
  }

  :host([radius="sm"]) {
    --inp-radius: var(--vu-control-radius-sm);
  }
  :host([radius="md"]) {
    --inp-radius: var(--vu-control-radius-md);
  }
  :host([radius="lg"]) {
    --inp-radius: var(--vu-control-radius-lg);
  }
  :host([radius="full"]) {
    --inp-radius: var(--vu-radius-full);
  }


  

  :host([variant="underline"]) {
    --inp-radius: 0;
    --fc-radius: 0;
  }

  .input-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--inp-field-gap);
    font-size: var(--inp-font-size);
    line-height: var(--vu-line-height-snug);
    inline-size: 100%;
  }

  .input-label {
    display: block;
    color: var(--vu-color-foreground);
    font-weight: var(--vu-font-weight-medium);
    font-size: inherit;
    cursor: default;
  }

  .input-label[aria-hidden="true"] {
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

  .input-control-row {
    display: inline-flex;
    align-items: stretch;
    inline-size: fit-content;
    max-inline-size: 100%;
  }

  :host([block]) .input-control-row {
    display: flex;
    inline-size: 100%;
  }

  :host([block]) .container {
    flex: 1 1 auto;
    inline-size: 100%;
  }

  .input-affix {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    color: var(--inp-muted);
    font-size: var(--inp-font-size);
    user-select: none;
  }

  .input-affix[hidden] {
    display: none;
  }

  :host:not(:has([slot="start"])) [part="start"] {
    display: none;
  }

  :host:not(:has([slot="end"])) [part="end"] {
    display: none;
  }

  .input-affix[interactive] {
    cursor: pointer;
    color: var(--inp-fg);
  }

  @media (hover: hover) {
    .input-affix[interactive]:hover {
      color: var(--inp-accent);
    }
  }

  .container {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--vu-space-1-25);
    box-sizing: border-box;
    min-block-size: var(--inp-min-block-size);
    padding-inline: var(--inp-px);
    padding-block: var(--inp-py);
    border: var(--inp-border);
    border-radius: var(--inp-radius);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--inp-bg);
    color: var(--inp-fg);
    box-shadow: var(--inp-shadow);
    inline-size: 100%;
    cursor: text;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([variant="underline"]) .container {
    border: var(--inp-border);
    border-radius: 0;
    border-bottom: var(--fc-border-bottom);
    box-shadow: none;
    background: transparent;
  }

  :host([loading]) .container {
    cursor: wait;
  }

  :host([type="textarea"]) .container {
    align-items: stretch;
    min-block-size: calc(var(--inp-rows) * 1.45rem + var(--inp-py) * 2);
  }

  input,
  textarea {
    flex: 1 1 auto;
    min-inline-size: 0;
    margin: 0;
    padding: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: inherit;
    font: inherit;
    /* Snug matches combobox field chrome so same-size Role E controls share one height. */
    line-height: var(--vu-line-height-snug);
  }

  textarea {
    line-height: var(--vu-line-height-normal);
    resize: vertical;
    min-block-size: calc(var(--inp-rows) * 1.45rem);
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--inp-muted);
  }

  textarea[resize="none"] {
    resize: none;
  }

  textarea[resize="both"] {
    resize: both;
  }

  input[type="number"] {
    appearance: textfield;
    -moz-appearance: textfield;
  }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /*
   * Native affordance resets — component owns clear, password toggle, steppers,
   * file label, and trailing actions. See input.ts _opensNativePicker.
   */

  /* search + text-like: legacy Edge clear vs clearable prop. */
  input::-ms-clear {
    display: none;
    inline-size: 0;
    block-size: 0;
  }

  input[type="search"] {
    appearance: none;
    -webkit-appearance: none;
  }

  input[type="search"]::-webkit-search-decoration,
  input[type="search"]::-webkit-search-cancel-button,
  input[type="search"]::-webkit-search-results-button,
  input[type="search"]::-webkit-search-results-decoration {
    -webkit-appearance: none;
    appearance: none;
    display: none;
  }

  /* password: legacy Edge reveal vs showPasswordToggle prop. */
  input[type="password"]::-ms-reveal {
    display: none;
  }

  /* date/time: picker icon vs trailing actions, end slot, clearable. */
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator,
  input[type="datetime-local"]::-webkit-calendar-picker-indicator,
  input[type="month"]::-webkit-calendar-picker-indicator,
  input[type="week"]::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
  }

  /* color: native swatch vs field chrome (rare type=color usage). */
  input[type="color"] {
    appearance: none;
    -webkit-appearance: none;
    padding: 0;
    block-size: var(--inp-min-block-size);
    min-inline-size: 3rem;
    cursor: pointer;
  }

  input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  input[type="color"]::-webkit-color-swatch {
    border: 0;
    border-radius: var(--inp-radius);
    corner-shape: var(--vu-corner-shape, round);
  }

  input[type="color"]::-moz-color-swatch {
    border: 0;
    border-radius: var(--inp-radius);
    corner-shape: var(--vu-corner-shape, round);
  }

  /* file: hide native button chrome; overlay input + file-label own UX. */
  input[type="file"]::-webkit-file-upload-button {
    -webkit-appearance: none;
    appearance: none;
    visibility: hidden;
  }

  input[type="file"]::file-selector-button {
    display: none;
  }

  input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .file-label {
    flex: 1 1 auto;
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--inp-accent);
    font-size: var(--inp-font-size);
  }

  .file-label:empty::before {
    content: "Choose file";
    color: var(--inp-muted);
  }

  .file-info {
    display: flex;
    justify-content: flex-end;
    gap: var(--vu-space-1);
    font-size: var(--vu-font-size-xs);
    color: var(--inp-muted);
  }

  .input-actions {
    display: inline-flex;
    align-items: center;
    gap: var(--vu-space-1);
    flex: 0 0 auto;
  }

  .input-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--inp-muted);
    cursor: pointer;
    inline-size: var(--inp-icon-size);
    block-size: var(--inp-icon-size);
  }

  @media (hover: hover) {
    .input-action:hover {
      color: var(--inp-accent);
    }

    .input-action[part="clear-button"]:hover {
      color: var(--vu-color-danger);
    }
  }

  .number-stepper {
    display: inline-flex;
    align-items: center;
    gap: var(--vu-space-1);
  }

  .number-stepper button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--vu-space-1);
    border: var(--vu-border-primary);
    border-radius: var(--vu-radius-sm);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--vu-color-surface);
    color: var(--vu-color-foreground);
    cursor: pointer;
  }

  @media (hover: hover) {
    .number-stepper button:hover {
      color: var(--inp-accent);
    }
  }

  .loading-indicator {
    inline-size: var(--vu-space-4);
    block-size: var(--vu-space-4);
    border: var(--vu-space-half) solid var(--surface-tone-hover);
    border-block-start-color: var(--inp-accent);
    border-radius: 50%;
    animation: inp-spin var(--vu-duration-spin) linear infinite;
  }

  @keyframes inp-spin {
    to {
      transform: rotate(360deg);
    }
  }

  vu-icon {
    inline-size: var(--inp-icon-size);
    block-size: var(--inp-icon-size);
  }

  @media (prefers-reduced-motion: reduce) {
    .container,
    .input-action,
    .number-stepper button,
    .loading-indicator {
      animation: none !important;
      transition-duration: var(--vu-duration-instant) !important;
    }
  }

  @media (prefers-contrast: more) {
    .container {
      border-width: var(--vu-border-width-emphasis);
    }

    .container:focus-within:has(:focus-visible) {
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
    .container {
      border: var(--vu-border-width-emphasis) solid CanvasText;
    }

    .container:focus-within:has(:focus-visible) {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }
  }
`;
