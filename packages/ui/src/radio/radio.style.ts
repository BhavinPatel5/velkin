import { css } from "lit";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";
import { surfaceToneInteractionHost } from "../internals/styles/surface-tone-interaction.css.js";

export const radioStyles = css`
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

    --rd-strong: var(--vu-color-default);
    --rd-strong-fg: var(--vu-color-default-foreground);
    --rd-strong-hover: var(--vu-color-default-hover);
    --rd-soft: var(--vu-color-default-soft);
    --rd-soft-fg: var(--vu-color-default-soft-foreground);
    --rd-soft-hover: var(--vu-color-default-soft-hover);
    --rd-edge: var(--vu-color-border);

    --radio-ring: var(--vu-space-5);
    --radio-gap: var(--vu-csm-action-gap);
    --radio-dot: var(--vu-space-2-5);

    --rd-idle-ring-bg: var(--host-surface-bg);
    --rd-idle-ring-bg-hover: var(--surface-tone-hover);
  }

  :host([variant="soft"]) {
    --rd-idle-ring-bg: var(--rd-soft);
    --rd-idle-ring-bg-hover: var(--rd-soft-hover);
  }

  :host([color="primary"]) {
    --rd-strong: var(--vu-color-accent);
    --rd-strong-fg: var(--vu-color-accent-foreground);
    --rd-strong-hover: color-mix(in oklab, var(--vu-color-accent) 92%, var(--vu-color-foreground) 8%);
    --rd-soft: var(--vu-color-accent-soft);
    --rd-soft-fg: var(--vu-color-accent-soft-foreground);
    --rd-soft-hover: var(--vu-color-accent-soft-hover);
    --rd-edge: var(--vu-color-accent);
  }

  :host([color="success"]) {
    --rd-strong: var(--vu-color-success);
    --rd-strong-fg: var(--vu-color-success-foreground);
    --rd-strong-hover: color-mix(in oklab, var(--vu-color-success) 92%, var(--vu-color-foreground) 8%);
    --rd-soft: var(--vu-color-success-soft);
    --rd-soft-fg: var(--vu-color-success-soft-foreground);
    --rd-soft-hover: var(--vu-color-success-soft-hover);
    --rd-edge: var(--vu-color-success);
  }

  :host([color="warning"]) {
    --rd-strong: var(--vu-color-warning);
    --rd-strong-fg: var(--vu-color-warning-foreground);
    --rd-strong-hover: color-mix(in oklab, var(--vu-color-warning) 92%, var(--vu-color-foreground) 8%);
    --rd-soft: var(--vu-color-warning-soft);
    --rd-soft-fg: var(--vu-color-warning-soft-foreground);
    --rd-soft-hover: var(--vu-color-warning-soft-hover);
    --rd-edge: var(--vu-color-warning);
  }

  :host([color="danger"]) {
    --rd-strong: var(--vu-color-danger);
    --rd-strong-fg: var(--vu-color-danger-foreground);
    --rd-strong-hover: color-mix(in oklab, var(--vu-color-danger) 92%, var(--vu-color-foreground) 8%);
    --rd-soft: var(--vu-color-danger-soft);
    --rd-soft-fg: var(--vu-color-danger-soft-foreground);
    --rd-soft-hover: var(--vu-color-danger-soft-hover);
    --rd-edge: var(--vu-color-danger);
  }

  :host([size="sm"]) {
    --radio-ring: var(--vu-space-4);
    --radio-dot: var(--vu-space-2);
  }

  :host([size="lg"]) {
    --radio-ring: var(--vu-space-6);
    --radio-dot: var(--vu-space-3);
  }

  :host([readonly]) .rdx {
    cursor: default;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
  }

  :host([compact]) {
    --radio-gap: var(--vu-space-1);
  }

  :host([compact]) .radio-hint,
  :host([compact]) .error-message {
    margin-block-start: 2px;
  }

  .radio-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .radio-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--radio-gap);
  }

  .radio-wrapper.no-text {
    gap: 0;
  }

  .radio-label-text {
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

  .rdx {
    display: inline-flex;
    align-items: center;
    gap: var(--radio-gap);
    margin: 0;
    padding: 0;
    min-block-size: var(--radio-ring);
    cursor: pointer;
    user-select: none;
    transition:
      color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      opacity var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  input[type="radio"] {
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

  .rdx .ring {
    position: relative;
    flex-shrink: 0;
    inline-size: var(--radio-ring);
    block-size: var(--radio-ring);
    box-sizing: border-box;
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    border: var(--vu-border-width-emphasis) solid var(--rd-edge);
    background: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  .rdx .ring::after {
    content: "";
    inline-size: var(--radio-dot);
    block-size: var(--radio-dot);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: var(--rd-strong-fg);
    transform: scale(0);
    transition:
      transform var(--vu-duration-fast) var(--vu-ease-out-cubic),
      background-color var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  @media (hover: hover) {
    :host(:not([disabled]):not([readonly])) .rdx:hover .ring {
      background: var(--rd-soft);
      border-color: var(--rd-edge);
    }

    :host(:not([disabled]):not([readonly])) input:checked + .rdx:hover .ring,
    :host(:not([disabled]):not([readonly])) .rdx.checked:hover .ring {
      background: var(--rd-strong-hover);
      border-color: var(--rd-strong-hover);
    }

    :host([variant="outline"]:not([disabled]):not([readonly])) input:checked + .rdx:hover .ring,
    :host([variant="outline"]:not([disabled]):not([readonly])) .rdx.checked:hover .ring {
      background: var(--rd-soft);
      border-color: var(--rd-strong);
    }
  }

  input[type="radio"]:focus-visible + .rdx .ring {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  input[type="radio"]:focus:not(:focus-visible) + .rdx .ring {
    box-shadow: none;
  }

  input[type="radio"]:checked + .rdx .ring,
  .rdx.checked .ring {
    background: var(--rd-strong);
    border-color: var(--rd-strong);
  }

  input[type="radio"]:checked + .rdx .ring::after,
  .rdx.checked .ring::after {
    transform: scale(1);
  }

  :host([variant="outline"]) .rdx .ring {
    background: transparent;
  }

  :host([variant="outline"]) input[type="radio"]:checked + .rdx .ring,
  :host([variant="outline"]) .rdx.checked .ring {
    background: transparent;
    border-color: var(--rd-strong);
  }

  :host([variant="outline"]) input[type="radio"]:checked + .rdx .ring::after,
  :host([variant="outline"]) .rdx.checked .ring::after {
    background: var(--rd-soft-fg);
  }

  :host(:not([variant="outline"])) .rdx .ring {
    background: var(--rd-idle-ring-bg);
    border-color: transparent;
  }

  :host(:not([variant="outline"])) input[type="radio"]:checked + .rdx .ring,
  :host(:not([variant="outline"])) .rdx.checked .ring {
    background: var(--rd-strong);
    border-color: var(--rd-strong);
  }

  :host([validationactive]:is(:invalid, [invalid])) .rdx .ring {
    border-color: var(--fc-interaction-color);
  }

  .radio-hint {
    white-space: normal;
    pointer-events: none;
    margin-inline-start: calc(var(--radio-ring) + var(--radio-gap));
    margin-block-start: var(--vu-space-half);
    inline-size: 100%;
    max-inline-size: 100%;
    text-align: start;
  }

  :dir(rtl) .radio-hint {
    margin-inline-end: calc(var(--radio-ring) + var(--radio-gap));
    margin-inline-start: 0;
  }

  .error-message {
    white-space: normal;
    pointer-events: none;
    margin-inline-start: calc(var(--radio-ring) + var(--radio-gap));
    margin-block-start: var(--vu-space-half);
    inline-size: 100%;
    max-inline-size: 100%;
    text-align: start;
  }

  :dir(rtl) .error-message {
    margin-inline-end: calc(var(--radio-ring) + var(--radio-gap));
    margin-inline-start: 0;
  }

  :host([validationactive]:is(:invalid, [invalid])) .error-message {
    display: block;
  }

  @media (prefers-reduced-motion: reduce) {
    .rdx,
    .rdx .ring,
    .rdx .ring::after {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    .rdx .ring {
      border-width: calc(var(--vu-border-width-emphasis) * 2);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    .rdx .ring {
      border: var(--vu-border-width-emphasis) solid CanvasText;
      forced-color-adjust: none;
    }

    input[type="radio"]:focus-visible + .rdx .ring {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }

    input[type="radio"]:checked + .rdx .ring,
    .rdx.checked .ring {
      background: Highlight;
      border-color: CanvasText;
    }

    .rdx .ring::after {
      background: HighlightText;
    }

    :host([variant="outline"]) input[type="radio"]:checked + .rdx .ring,
    :host([variant="outline"]) .rdx.checked .ring {
      background: Field;
      border-color: CanvasText;
    }

    :host([variant="outline"]) .rdx .ring::after {
      background: CanvasText;
    }
  }
`;
