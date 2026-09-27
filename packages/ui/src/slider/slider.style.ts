import { css } from "lit";
import { fieldChromeVariantStyles } from "../internals/form/field-chrome.style.js";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const sliderStyles = css`
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

    --slider-fill-pct: 50%;
    --slider-track-size: var(--vu-space-3);
    --slider-thumb-height: var(--slider-track-size);
    --slider-thumb-width: calc(var(--slider-thumb-height) * 2);
    --slider-field-gap: var(--vu-csm-field-gap);

    --slider-bg: var(--fc-bg);
    --slider-fg: var(--fc-fg);
    --slider-border: var(--fc-border);
    --slider-shadow: var(--fc-shadow);
    --slider-radius: var(--fc-radius);

    --slider-track-bg: var(--vu-color-surface-tertiary);
    --slider-fill-bg: var(--vu-color-accent);
    --slider-thumb-bg: #ffffff;
    --slider-thumb-shadow: var(--vu-shadow-overlay);
  }

  :host([variant="underline"]) {
    --slider-radius: 0;
    --fc-radius: 0;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
  }

  :host([readonly]) .slider-label {
    cursor: default;
  }

  :host([block]) {
    display: block;
    inline-size: 100%;
  }

  :host([compact]) {
    --slider-field-gap: var(--vu-space-1);
  }

  :host([tone="subtle"]) {
    --slider-track-bg: var(--vu-color-surface-secondary);
  }

  :host([tone="strong"]) {
    --slider-track-bg: color-mix(
      in oklab,
      var(--vu-color-foreground) 22%,
      var(--vu-color-background)
    );
  }

  :host([size="sm"]) {
    --slider-track-size: var(--vu-space-2);
  }

  :host([size="lg"]) {
    --slider-track-size: var(--vu-space-3-5);
  }

  :host([radius="none"]) {
    --slider-radius: 0;
    --fc-radius: 0;
    }

  :host([radius="sm"]) {
    --slider-radius: var(--vu-control-radius-sm);
      --fc-radius: var(--vu-control-radius-sm);
  }
  :host([radius="md"]) {
    --slider-radius: var(--vu-control-radius-md);
      --fc-radius: var(--vu-control-radius-md);
  }
  :host([radius="lg"]) {
    --slider-radius: var(--vu-control-radius-lg);
      --fc-radius: var(--vu-control-radius-lg);
  }
  :host([radius="full"]) {
    --slider-radius: var(--vu-radius-full);
      --fc-radius: var(--vu-radius-full);
  }


  .slider-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--slider-field-gap);
    inline-size: 100%;
  }

  .slider-label {
    display: block;
    color: var(--vu-color-foreground);
    font-weight: var(--vu-font-weight-medium);
    font-size: inherit;
    line-height: var(--vu-line-height-snug);
    text-align: start;
    cursor: default;
  }

  .slider-label[hidden] {
    display: none;
  }

  :host:not(:has([slot="label"])) .slider-label:not(:has([part="text"])) {
    display: none;
  }

  ::slotted(*) {
    font-size: inherit;
    line-height: var(--vu-line-height-snug);
  }

  .slider-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--vu-space-2);
    inline-size: 100%;
  }
  :host:not(:has([slot="label"])) .slider-header {
    display: none;
  }
  :host([showvalue]) .slider-header {
    display: flex;
  }

  .slider-value {
    color: var(--vu-color-foreground);
    font-size: inherit;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .slider-affix {
    color: var(--vu-color-muted);
    font-size: inherit;
  }

  .slider-track {
    position: relative;
    box-sizing: border-box;
    inline-size: 100%;
    min-block-size: var(--slider-thumb-height);
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  /* Unselected rail */
  .slider-track::before {
    content: "";
    position: absolute;
    inset-inline: 0;
    inset-block-start: 50%;
    z-index: 0;
    block-size: var(--slider-track-size);
    transform: translateY(-50%);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: var(--slider-track-bg);
    pointer-events: none;
  }

  .slider-highlight {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 0;
    z-index: 1;
    inline-size: var(--slider-fill-pct);
    block-size: var(--slider-track-size);
    transform: translateY(-50%);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: var(--slider-fill-bg);
    overflow: visible;
    pointer-events: none;
    transition: inline-size var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  .slider-thumb-visual {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: auto;
    inset-inline-end: 0;
    z-index: 1;
    box-sizing: border-box;
    width: var(--slider-thumb-width);
    height: var(--slider-thumb-height);
    min-width: var(--slider-thumb-width);
    min-height: var(--slider-thumb-height);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: var(--slider-thumb-bg);
    box-shadow: var(--slider-thumb-shadow);
    transform: translateY(-50%);
    pointer-events: none;
    transition: box-shadow var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  .slider-thumb-input {
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

  .slider-thumb-input::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    appearance: none;
    height: var(--slider-track-size);
    background: transparent;
    border: 0;
  }

  .slider-thumb-input::-moz-range-track {
    height: var(--slider-track-size);
    background: transparent;
    border: 0;
  }

  .slider-thumb-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    pointer-events: auto;
    width: var(--slider-thumb-width);
    height: var(--slider-thumb-height);
    margin-top: calc((var(--slider-track-size) - var(--slider-thumb-height)) / 2);
    border: 0;
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: transparent;
    box-shadow: none;
    cursor: grab;
  }

  .slider-thumb-input::-moz-range-thumb {
    pointer-events: auto;
    width: var(--slider-thumb-width);
    height: var(--slider-thumb-height);
    border: 0;
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: transparent;
    box-shadow: none;
    cursor: grab;
  }

  .slider-thumb-input:focus {
    outline: none;
  }

  .slider-thumb-input:active::-webkit-slider-thumb {
    cursor: grabbing;
  }

  :host(:not([variant="outline"])) .slider-track:has(.slider-thumb-input:focus-visible) .slider-thumb-visual {
    box-shadow:
      var(--slider-thumb-shadow),
      0 0 0 3px color-mix(in oklab, var(--fc-interaction-color) 35%, transparent);
  }

  :host([validationactive]:is(:invalid, [invalid])) .slider-highlight {
    background: var(--fc-interaction-color);
  }

  :host([variant="outline"]) .slider-track {
    min-block-size: var(--slider-track-size);
    border: 0;
    background: transparent;
  }

  :host([variant="outline"]) .slider-track::before {
    inset: 0;
    inset-block-start: 0;
    block-size: auto;
    height: 100%;
    transform: none;
    border-radius: var(--slider-radius);
    corner-shape: round;
    background: var(--slider-bg);
    border: var(--slider-border);
    box-shadow: var(--slider-shadow);
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([variant="outline"]) .slider-track:focus-within:has(:focus-visible)::before {
    outline: none;
    box-shadow: var(--slider-shadow), var(--vu-focus-ring);
  }

  :host([validationactive]:is(:invalid, [invalid])[variant="outline"]) .slider-track::before {
    border-color: var(--fc-interaction-color);
  }

  :host([variant="underline"]) {
    --slider-underline-rail: var(--vu-border-width);
    --slider-underline-highlight: var(--vu-border-width-emphasis);
    --slider-thumb-height: var(--vu-space-5);
    --slider-thumb-width: var(--vu-space-2);
  }

  :host([variant="underline"]) .slider-track {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    min-block-size: calc(var(--slider-thumb-height) + var(--slider-underline-rail));
  }

  :host([variant="underline"]) .slider-track::before {
    inset-block-start: auto;
    inset-block-end: 0;
    block-size: var(--slider-underline-rail);
    transform: none;
    border-radius: 0;
    background: var(--vu-color-border);
  }

  :host([variant="underline"]) .slider-highlight {
    inset-block-start: auto;
    inset-block-end: 0;
    block-size: var(--slider-underline-highlight);
    transform: none;
    border-radius: 0;
  }

  :host([variant="underline"]) .slider-thumb-visual {
    inset-block-start: auto;
    inset-block-end: 0;
    transform: none;
    border-radius: var(--vu-radius-full) var(--vu-radius-full) 0 0;
    corner-shape: round;
  }

  /* Native corridor matches the visual thumb stack — rail stays 1px via ::before. */
  :host([variant="underline"]) .slider-thumb-input::-webkit-slider-runnable-track {
    height: var(--slider-thumb-height);
  }

  :host([variant="underline"]) .slider-thumb-input::-moz-range-track {
    height: var(--slider-thumb-height);
  }

  :host([variant="underline"]) .slider-thumb-input::-webkit-slider-thumb {
    margin-top: calc(var(--slider-underline-rail) / 2);
    border-radius: var(--vu-radius-full) var(--vu-radius-full) 0 0;
    corner-shape: round;
  }

  :host([variant="underline"]) .slider-thumb-input::-moz-range-thumb {
    margin-top: calc(var(--slider-underline-rail) / 2);
    border-radius: var(--vu-radius-full) var(--vu-radius-full) 0 0;
    corner-shape: round;
  }

  :host([variant="underline"][validationactive]:is(:invalid, [invalid])) .slider-track::before {
    background: color-mix(in oklab, var(--fc-interaction-color) 45%, var(--vu-color-border));
  }

  .slider-thumb-input:disabled {
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .slider-highlight,
    .slider-thumb-visual {
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
    :host([variant="outline"]) .slider-track::before {
      border-width: var(--vu-border-width-emphasis);
    }

    :host([variant="underline"]) .slider-track::before {
      block-size: var(--vu-border-width-emphasis);
    }

    :host([variant="underline"]) .slider-highlight {
      block-size: calc(var(--vu-border-width-emphasis) * 2);
    }

    .slider-thumb-visual {
      box-shadow: var(--slider-thumb-shadow), 0 0 0 1px CanvasText;
    }
  }

  @media (forced-colors: active) {
    :host(:not([variant="outline"])) .slider-track::before {
      background: Canvas;
      border: var(--vu-border-width) solid CanvasText;
    }

    :host([variant="outline"]) .slider-track::before {
      background: Canvas;
      border: var(--vu-border-width) solid CanvasText;
    }

    .slider-highlight {
      background: Highlight;
    }

    .slider-thumb-visual {
      background: Canvas;
      border: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }
  }
`;
