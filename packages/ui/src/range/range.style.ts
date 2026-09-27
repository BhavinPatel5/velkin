import { css } from "lit";
import { fieldChromeVariantStyles } from "../internals/form/field-chrome.style.js";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const rangeStyles = css`
  ${fieldValidationStyles}
  ${fieldChromeVariantStyles}
  ${controlSizeMetricsTokens}

  :host {
    display: inline-block;
    box-sizing: border-box;
    inline-size: 100%;
    font-family: var(--vu-font-sans);
    font-size: var(--vu-csm-field-font-size);
    font-weight: var(--vu-font-weight-normal);
    line-height: var(--vu-line-height-snug);
    letter-spacing: var(--vu-letter-spacing-normal);
    -webkit-tap-highlight-color: transparent;

    --range-from-pct: 0%;
    --range-to-pct: 100%;
    --range-highlight-size: 0%;
    --range-track-size: var(--vu-space-3);
    --range-thumb-height: var(--range-track-size);
    --range-thumb-width: calc(var(--range-thumb-height) * 2);
    --range-field-gap: var(--vu-csm-field-gap);
    --range-py: var(--vu-csm-field-py);
    --range-px: var(--vu-csm-field-px);

    --range-bg: var(--fc-bg);
    --range-fg: var(--fc-fg);
    --range-border: var(--fc-border);
    --range-shadow: var(--fc-shadow);
    --range-radius: var(--fc-radius);

    --range-track-bg: var(--vu-color-surface-tertiary);
    --range-fill-bg: var(--vu-color-accent);
    --range-thumb-bg: #ffffff;
    --range-thumb-shadow: var(--vu-shadow-overlay);
  }

  :host([variant="underline"]) {
    --range-radius: 0;
    --fc-radius: 0;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
  }

  :host([readonly]) .range-label {
    cursor: default;
  }

  :host([block]) {
    display: block;
    inline-size: 100%;
  }

  :host([compact]) {
    --range-field-gap: var(--vu-space-1);
  }

  :host([tone="subtle"]) {
    --range-track-bg: var(--vu-color-surface-secondary);
  }

  :host([tone="strong"]) {
    --range-track-bg: color-mix(
      in oklab,
      var(--vu-color-foreground) 22%,
      var(--vu-color-background)
    );
  }

  :host([size="sm"]) {
    --range-track-size: var(--vu-space-2);
  }

  :host([size="lg"]) {
    --range-track-size: var(--vu-space-3-5);
  }

  :host([radius="none"]) {
    --range-radius: 0;
    --fc-radius: 0;
    }

  :host([radius="sm"]) {
    --range-radius: var(--vu-control-radius-sm);
      --fc-radius: var(--vu-control-radius-sm);
  }
  :host([radius="md"]) {
    --range-radius: var(--vu-control-radius-md);
      --fc-radius: var(--vu-control-radius-md);
  }
  :host([radius="lg"]) {
    --range-radius: var(--vu-control-radius-lg);
      --fc-radius: var(--vu-control-radius-lg);
  }
  :host([radius="full"]) {
    --range-radius: var(--vu-radius-full);
      --fc-radius: var(--vu-radius-full);
  }


  .range-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--range-field-gap);
    inline-size: 100%;
  }

  .range-label {
    display: block;
    color: var(--vu-color-foreground);
    font-weight: var(--vu-font-weight-medium);
    font-size: inherit;
    line-height: var(--vu-line-height-snug);
    text-align: start;
    cursor: default;
  }

  .range-label[hidden] {
    display: none;
  }

  :host:not(:has([slot="label"])) .range-label:not(:has([part="text"])) {
    display: none;
  }

  ::slotted(*) {
    font-size: inherit;
    line-height: var(--vu-line-height-snug);
  }

  .range-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--vu-space-2);
    inline-size: 100%;
  }
  :host:not(:has([slot="label"])) .range-header {
    display: none;
  }
  :host([showvalue]) .range-header {
    display: flex;
  }

  .range-value {
    color: var(--vu-color-foreground);
    font-size: inherit;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .range-affix {
    color: var(--vu-color-muted);
    font-size: inherit;
  }

  .range-track {
    position: relative;
    box-sizing: border-box;
    inline-size: 100%;
    min-block-size: var(--range-track-size);
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  /* Unselected rail */
  .range-track::before {
    content: "";
    position: absolute;
    inset-inline: 0;
    inset-block-start: 50%;
    z-index: 0;
    block-size: var(--range-track-size);
    transform: translateY(-50%);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: var(--range-track-bg);
    pointer-events: none;
  }

  .range-highlight {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: var(--range-from-pct);
    z-index: 1;
    inline-size: var(--range-highlight-size);
    block-size: var(--range-track-size);
    transform: translateY(-50%);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: var(--range-fill-bg);
    overflow: visible;
    pointer-events: none;
    transition:
      inset-inline-start var(--vu-duration-fast) var(--vu-ease-out-cubic),
      inline-size var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  /* Visible thumbs sit on highlight edges; native pseudo-thumbs are separate drag targets. */
  .range-thumb-visual {
    position: absolute;
    inset-block-start: 50%;
    z-index: 1;
    box-sizing: border-box;
    width: var(--range-thumb-width);
    height: var(--range-thumb-height);
    min-width: var(--range-thumb-width);
    min-height: var(--range-thumb-height);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: var(--range-thumb-bg);
    box-shadow: var(--range-thumb-shadow);
    transform: translateY(-50%);
    pointer-events: none;
    transition: box-shadow var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  .range-thumb-visual--from {
    inset-inline-start: 0;
    inset-inline-end: auto;
  }

  .range-thumb-visual--to {
    inset-inline-start: auto;
    inset-inline-end: 0;
  }

  .range-thumb-input {
    position: absolute;
    inset: 0;
    z-index: 3;
    inline-size: 100%;
    block-size: 100%;
    margin: 0;
    padding: 0;
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    pointer-events: none;
    cursor: default;
  }

  .range-thumb-input--to {
    z-index: 4;
  }

  .range-thumb-input::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    appearance: none;
    height: var(--range-track-size);
    background: transparent;
    border: 0;
  }

  .range-thumb-input::-moz-range-track {
    height: var(--range-track-size);
    background: transparent;
    border: 0;
  }

  /* Transparent native thumbs — drag targets only; visuals are .range-thumb-visual elements. */
  .range-thumb-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    pointer-events: auto;
    width: var(--range-thumb-width);
    height: var(--range-thumb-height);
    margin-top: calc((var(--range-track-size) - var(--range-thumb-height)) / 2);
    border: 0;
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: transparent;
    box-shadow: none;
    cursor: grab;
  }

  .range-thumb-input::-moz-range-thumb {
    pointer-events: auto;
    width: var(--range-thumb-width);
    height: var(--range-thumb-height);
    border: 0;
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: transparent;
    box-shadow: none;
    cursor: grab;
  }

  .range-thumb-input:focus {
    outline: none;
  }

  .range-thumb-input:active::-webkit-slider-thumb {
    cursor: grabbing;
  }

  /* Default + underline: thumb ring only. Outline uses the field shell ring (like vu-input). */
  :host(:not([variant="outline"])) .range-track:has(.range-thumb-input--from:focus-visible) .range-thumb-visual--from {
    box-shadow:
      var(--range-thumb-shadow),
      0 0 0 3px color-mix(in oklab, var(--fc-interaction-color) 35%, transparent);
  }

  :host(:not([variant="outline"])) .range-track:has(.range-thumb-input--to:focus-visible) .range-thumb-visual--to {
    box-shadow:
      var(--range-thumb-shadow),
      0 0 0 3px color-mix(in oklab, var(--fc-interaction-color) 35%, transparent);
  }

  :host([validationactive]:is(:invalid, [invalid])) .range-highlight {
    background: var(--fc-interaction-color);
  }

  :host([variant="outline"]) .range-track {
    border: 0;
    background: transparent;
  }

  /* Outline: one field shell (::before) — no inner rail pseudo; highlight + thumbs sit on the shell. */
  :host([variant="outline"]) .range-track::before {
    inset: 0;
    inset-block-start: 0;
    block-size: auto;
    height: 100%;
    transform: none;
    border-radius: var(--range-radius);
    corner-shape: round;
    background: var(--range-bg);
    border: var(--range-border);
    box-shadow: var(--range-shadow);
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([variant="outline"]) .range-track:focus-within:has(:focus-visible)::before {
    outline: none;
    box-shadow: var(--range-shadow), var(--vu-focus-ring);
  }

  :host([validationactive]:is(:invalid, [invalid])[variant="outline"]) .range-track::before {
    border-color: var(--fc-interaction-color);
  }

  :host([variant="underline"]) {
    --range-underline-rail: var(--vu-border-width);
    --range-underline-highlight: var(--vu-border-width-emphasis);
    --range-thumb-height: var(--vu-space-5);
    --range-thumb-width: var(--vu-space-2);
  }

  :host([variant="underline"]) .range-track {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    min-block-size: calc(var(--range-thumb-height) + var(--range-underline-rail));
  }

  :host([variant="underline"]) .range-track::before {
    inset-block-start: auto;
    inset-block-end: 0;
    block-size: var(--range-underline-rail);
    transform: none;
    border-radius: 0;
    background: var(--vu-color-border);
  }

  :host([variant="underline"]) .range-highlight {
    inset-block-start: auto;
    inset-block-end: 0;
    block-size: var(--range-underline-highlight);
    transform: none;
    border-radius: 0;
  }

  :host([variant="underline"]) .range-thumb-visual {
    inset-block-start: auto;
    inset-block-end: 0;
    transform: none;
    border-radius: var(--vu-radius-full) var(--vu-radius-full) 0 0;
    corner-shape: round;
  }

  /* Native corridor matches the visual thumb stack — rail stays 1px via ::before. */
  :host([variant="underline"]) .range-thumb-input::-webkit-slider-runnable-track {
    height: var(--range-thumb-height);
  }

  :host([variant="underline"]) .range-thumb-input::-moz-range-track {
    height: var(--range-thumb-height);
  }

  :host([variant="underline"]) .range-thumb-input::-webkit-slider-thumb {
    margin-top: calc(var(--range-underline-rail) / 2);
    border-radius: var(--vu-radius-full) var(--vu-radius-full) 0 0;
    corner-shape: round;
  }

  :host([variant="underline"]) .range-thumb-input::-moz-range-thumb {
    margin-top: calc(var(--range-underline-rail) / 2);
    border-radius: var(--vu-radius-full) var(--vu-radius-full) 0 0;
    corner-shape: round;
  }

  :host([variant="underline"][validationactive]:is(:invalid, [invalid])) .range-track::before {
    background: color-mix(in oklab, var(--fc-interaction-color) 45%, var(--vu-color-border));
  }

  .range-thumb-input:disabled {
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .range-highlight,
    .range-thumb-visual {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) .range-track::before {
      border-width: var(--vu-border-width-emphasis);
    }

    :host([variant="underline"]) .range-track::before {
      block-size: var(--vu-border-width-emphasis);
    }

    :host([variant="underline"]) .range-highlight {
      block-size: calc(var(--vu-border-width-emphasis) * 2);
    }

    .range-thumb-visual {
      box-shadow: var(--range-thumb-shadow), 0 0 0 1px CanvasText;
    }
  }

  @media (forced-colors: active) {
    :host(:not([variant="outline"])) .range-track::before {
      background: Canvas;
      border: var(--vu-border-width) solid CanvasText;
    }

    :host([variant="outline"]) .range-track::before {
      background: Canvas;
      border: var(--vu-border-width) solid CanvasText;
    }

    .range-highlight {
      background: Highlight;
    }

    .range-thumb-visual {
      background: Canvas;
      border: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }
  }
`;
