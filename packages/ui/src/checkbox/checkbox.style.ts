import { css } from "lit";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";
import { surfaceToneInteractionHost } from "../internals/styles/surface-tone-interaction.css.js";

export const checkboxStyles = css`
  ${fieldValidationStyles}
  ${controlSizeMetricsTokens}
  ${surfaceToneInteractionHost}
  :host {
    display: block;
    box-sizing: border-box;
    position: relative;
    font-family: var(--vu-font-sans);
    font-size: var(--vu-csm-action-font-size);
    font-weight: var(--vu-font-weight-normal);
    line-height: var(--vu-line-height-snug);
    letter-spacing: var(--vu-letter-spacing-normal);
    -webkit-tap-highlight-color: transparent;

    /* Intent channels — repinned per [color='*'] (same tokens as vu-button). */
    --cb-strong: var(--vu-color-default);
    --cb-strong-fg: var(--vu-color-default-foreground);
    --cb-strong-hover: var(--vu-color-default-hover);
    --cb-soft: var(--vu-color-default-soft);
    --cb-soft-fg: var(--vu-color-default-soft-foreground);
    --cb-soft-hover: var(--vu-color-default-soft-hover);
    --cb-edge: var(--vu-color-border);

    /* Box tracks size with label type — was space-4 (16px) and looked undersized vs text. */
    --checkbox-box: var(--vu-space-5);
    --checkbox-gap: var(--vu-csm-action-gap);
    /* Small-box corners: --vu-control-radius-* is sized for buttons and looks circular here. */
    --checkbox-radius: var(--vu-radius-sm);

    --cb-idle-box-bg: var(--host-surface-bg);
    --cb-idle-box-bg-hover: var(--surface-tone-hover);
  }

  :host([variant="soft"]) {
    --cb-idle-box-bg: var(--cb-soft);
    --cb-idle-box-bg-hover: var(--cb-soft-hover);
  }

  :host([color="primary"]) {
    --cb-strong: var(--vu-color-accent);
    --cb-strong-fg: var(--vu-color-accent-foreground);
    --cb-strong-hover: color-mix(in oklab, var(--vu-color-accent) 92%, var(--vu-color-foreground) 8%);
    --cb-soft: var(--vu-color-accent-soft);
    --cb-soft-fg: var(--vu-color-accent-soft-foreground);
    --cb-soft-hover: var(--vu-color-accent-soft-hover);
    --cb-edge: var(--vu-color-accent);
  }

  :host([color="success"]) {
    --cb-strong: var(--vu-color-success);
    --cb-strong-fg: var(--vu-color-success-foreground);
    --cb-strong-hover: color-mix(in oklab, var(--vu-color-success) 92%, var(--vu-color-foreground) 8%);
    --cb-soft: var(--vu-color-success-soft);
    --cb-soft-fg: var(--vu-color-success-soft-foreground);
    --cb-soft-hover: var(--vu-color-success-soft-hover);
    --cb-edge: var(--vu-color-success);
  }

  :host([color="warning"]) {
    --cb-strong: var(--vu-color-warning);
    --cb-strong-fg: var(--vu-color-warning-foreground);
    --cb-strong-hover: color-mix(in oklab, var(--vu-color-warning) 92%, var(--vu-color-foreground) 8%);
    --cb-soft: var(--vu-color-warning-soft);
    --cb-soft-fg: var(--vu-color-warning-soft-foreground);
    --cb-soft-hover: var(--vu-color-warning-soft-hover);
    --cb-edge: var(--vu-color-warning);
  }

  :host([color="danger"]) {
    --cb-strong: var(--vu-color-danger);
    --cb-strong-fg: var(--vu-color-danger-foreground);
    --cb-strong-hover: color-mix(in oklab, var(--vu-color-danger) 92%, var(--vu-color-foreground) 8%);
    --cb-soft: var(--vu-color-danger-soft);
    --cb-soft-fg: var(--vu-color-danger-soft-foreground);
    --cb-soft-hover: var(--vu-color-danger-soft-hover);
    --cb-edge: var(--vu-color-danger);
  }

  :host([size="sm"]) {
    --checkbox-box: var(--vu-space-4);
  }

  :host([size="lg"]) {
    --checkbox-box: var(--vu-space-6);
  }

  :host([radius="none"]) {
    --checkbox-radius: 0;
  }

  :host([radius="sm"]) {
    --checkbox-radius: var(--vu-radius-xs);
  }

  :host([radius="md"]) {
    --checkbox-radius: var(--vu-radius-sm);
  }

  :host([radius="lg"]) {
    /* Cap below half the box so lg stays a rounded square, not a circle. */
    --checkbox-radius: min(var(--vu-radius-md), calc(var(--checkbox-box) * 0.35));
  }

  :host([radius="full"]) {
    --checkbox-radius: var(--vu-radius-full);
  }

  :host([radius="full"]) .cbx .box {
    corner-shape: round;
  }

  :host([readonly]) .cbx {
    cursor: default;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
  }

  :host([compact]) {
    --checkbox-gap: var(--vu-space-1);
  }

  :host([compact]) .checkbox-hint,
  :host([compact]) .error-message {
    margin-block-start: 2px;
  }

  .checkbox-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .checkbox-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--checkbox-gap);
  }

  .checkbox-wrapper.no-text {
    gap: 0;
  }

  .checkbox-label-text {
    text-align: start;
    color: var(--vu-color-foreground);
    font-size: inherit;
    line-height: inherit;
    min-inline-size: 0;
  }

  ::slotted(*) {
    font-size: inherit;
    line-height: inherit;
  }

  .cbx {
    display: inline-flex;
    align-items: center;
    gap: var(--checkbox-gap);
    margin: 0;
    padding: 0;
    min-block-size: var(--checkbox-box);
    cursor: pointer;
    user-select: none;
    transition:
      color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      opacity var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    inline-size: var(--vu-border-width);
    block-size: var(--vu-border-width);
    margin: 0;
    padding: 0;
    border: 0;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    overflow: hidden;
    white-space: nowrap;
  }

  .cbx .box {
    position: relative;
    flex-shrink: 0;
    inline-size: var(--checkbox-box);
    block-size: var(--checkbox-box);
    box-sizing: border-box;
    border-radius: var(--checkbox-radius);
    corner-shape: var(--vu-corner-shape, round);
    border: var(--vu-border-width-emphasis) solid var(--cb-edge);
    background: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  .cbx .box svg.checkmark {
    position: absolute;
    inset: 0;
    margin: auto;
    inline-size: calc(var(--checkbox-box) * 0.58);
    block-size: calc(var(--checkbox-box) * 0.48);
    fill: none;
    stroke: var(--cb-strong-fg);
    stroke-width: 2.25;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0;
    transform: scale(0.92);
    transition:
      opacity var(--vu-duration-fast) var(--vu-ease-out-cubic),
      transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  .indeterminate-line {
    position: absolute;
    inline-size: calc(var(--checkbox-box) * 0.45);
    block-size: var(--vu-border-width-emphasis);
    background-color: var(--cb-strong-fg);
    border-radius: var(--vu-border-width);
    corner-shape: var(--vu-corner-shape, round);
    opacity: 0;
    transform: scaleX(0);
    transition:
      opacity var(--vu-duration-fast) var(--vu-ease-out-cubic),
      transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  @media (hover: hover) {
    :host(:not([disabled]):not([readonly])) .cbx:hover .box {
      background: var(--cb-soft);
      border-color: var(--cb-edge);
    }

    :host(:not([disabled]):not([readonly])) input:checked + .cbx:hover .box,
    :host(:not([disabled]):not([readonly])) .cbx.checked:hover .box {
      background: var(--cb-strong-hover);
      border-color: var(--cb-strong-hover);
    }

    :host([variant="outline"]:not([disabled]):not([readonly])) input:checked + .cbx:hover .box,
    :host([variant="outline"]:not([disabled]):not([readonly])) .cbx.checked:hover .box {
      background: var(--cb-soft);
      border-color: var(--cb-strong);
    }

    :host(:not([variant="outline"]):not([disabled]):not([readonly])) .cbx:hover .box {
      background: var(--cb-soft-hover);
    }

    :host(:not([variant="outline"]):not([disabled]):not([readonly])) input:checked + .cbx:hover .box,
    :host(:not([variant="outline"]):not([disabled]):not([readonly])) .cbx.checked:hover .box {
      background: var(--cb-strong-hover);
      border-color: var(--cb-strong-hover);
    }
  }

  input[type="checkbox"]:focus-visible + .cbx .box {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  input[type="checkbox"]:focus:not(:focus-visible) + .cbx .box {
    box-shadow: none;
  }

  input[type="checkbox"]:checked + .cbx .box,
  .cbx.checked .box {
    background: var(--cb-strong);
    border-color: var(--cb-strong);
  }

  input[type="checkbox"]:checked + .cbx .box svg.checkmark,
  .cbx.checked .box svg.checkmark {
    opacity: 1;
    transform: scale(1);
  }

  input[type="checkbox"]:not(:checked) + .cbx .box svg.checkmark,
  .cbx:not(.checked) .box svg.checkmark {
    opacity: 0;
    transform: scale(0.92);
  }

  :host([indeterminate]) .cbx .box {
    background: var(--cb-strong);
    border-color: var(--cb-strong);
  }

  :host([indeterminate]) .cbx .box svg.checkmark {
    opacity: 0;
    transform: scale(0.92);
  }

  :host([indeterminate]) .indeterminate-line {
    opacity: 1;
    transform: scaleX(1);
  }

  :host([variant="outline"]) .cbx .box {
    background: transparent;
  }

  :host([variant="outline"]) input[type="checkbox"]:checked + .cbx .box,
  :host([variant="outline"]) .cbx.checked .box {
    background: transparent;
    border-color: var(--cb-strong);
  }

  :host([variant="outline"]) input[type="checkbox"]:checked + .cbx .box svg.checkmark,
  :host([variant="outline"]) .cbx.checked .box svg.checkmark {
    stroke: var(--cb-soft-fg);
  }

  :host([variant="outline"][indeterminate]) .cbx .box {
    background: transparent;
    border-color: var(--cb-strong);
  }

  :host([variant="outline"][indeterminate]) .indeterminate-line {
    background-color: var(--cb-soft-fg);
  }

  :host(:not([variant="outline"])) .cbx .box {
    background: var(--cb-idle-box-bg);
    border-color: transparent;
  }

  :host(:not([variant="outline"])) input[type="checkbox"]:checked + .cbx .box,
  :host(:not([variant="outline"])) .cbx.checked .box {
    background: var(--cb-strong);
    border-color: var(--cb-strong);
  }

  :host(:not([variant="outline"])[indeterminate]) .cbx .box {
    background: var(--cb-strong);
    border-color: var(--cb-strong);
  }

  :host([validationactive]:is(:invalid, [invalid])) .cbx .box {
    border-color: var(--fc-interaction-color);
  }

  .checkbox-hint {
    white-space: normal;
    pointer-events: none;
    margin-inline-start: calc(var(--checkbox-box) + var(--checkbox-gap));
    margin-block-start: var(--vu-space-half);
    inline-size: 100%;
    max-inline-size: 100%;
    text-align: start;
  }

  :dir(rtl) .checkbox-hint {
    margin-inline-end: calc(var(--checkbox-box) + var(--checkbox-gap));
    margin-inline-start: 0;
  }

  .error-message {
    white-space: normal;
    pointer-events: none;
    margin-inline-start: calc(var(--checkbox-box) + var(--checkbox-gap));
    margin-block-start: var(--vu-space-half);
    inline-size: 100%;
    max-inline-size: 100%;
    text-align: start;
  }

  :dir(rtl) .error-message {
    margin-inline-end: calc(var(--checkbox-box) + var(--checkbox-gap));
    margin-inline-start: 0;
  }

  :host([validationactive]:is(:invalid, [invalid])) .error-message {
    display: block;
  }

  @media (prefers-reduced-motion: reduce) {
    .cbx,
    .cbx .box,
    .cbx .box svg.checkmark,
    .indeterminate-line {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    .cbx .box {
      border-width: calc(var(--vu-border-width-emphasis) * 2);
    }
    input[type="checkbox"]:focus-visible + .cbx .box {
      box-shadow: none;
      outline: var(--vu-border-width-emphasis) solid currentColor;
      outline-offset: var(--vu-space-half);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    .cbx .box {
      border: var(--vu-border-width-emphasis) solid CanvasText;
      forced-color-adjust: none;
    }

    input[type="checkbox"]:focus-visible + .cbx .box {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }

    input[type="checkbox"]:checked + .cbx .box,
    .cbx.checked .box,
    :host([indeterminate]) .cbx .box {
      background: Highlight;
      border-color: CanvasText;
    }

    .cbx .box svg.checkmark {
      stroke: HighlightText;
    }

    :host([indeterminate]) .indeterminate-line {
      background-color: HighlightText;
    }

    :host([variant="outline"]) input[type="checkbox"]:checked + .cbx .box,
    :host([variant="outline"]) .cbx.checked .box,
    :host([variant="outline"][indeterminate]) .cbx .box {
      background: Field;
      border-color: CanvasText;
    }

    :host([variant="outline"]) input[type="checkbox"]:checked + .cbx .box svg.checkmark,
    :host([variant="outline"]) .cbx.checked .box svg.checkmark {
      stroke: CanvasText;
    }

    :host([variant="outline"][indeterminate]) .indeterminate-line {
      background-color: CanvasText;
    }
  }
`;
