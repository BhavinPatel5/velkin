import { css } from "lit";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";
import { surfaceToneInteractionHost } from "../internals/styles/surface-tone-interaction.css.js";

export const switchStyles = css`
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

    --sw-strong: var(--vu-color-default);
    --sw-strong-fg: var(--vu-color-default-foreground);
    --sw-strong-hover: var(--vu-color-default-hover);
    --sw-soft: var(--vu-color-default-soft);
    --sw-soft-fg: var(--vu-color-default-soft-foreground);
    --sw-soft-hover: var(--vu-color-default-soft-hover);
    --sw-edge: var(--vu-color-border);

    /* Track is one step above the checkbox box so the pill + thumb read at the same size. */
    --switch-track-h: var(--vu-space-6);
    --switch-inset: var(--vu-space-half);
    --switch-gap: var(--vu-csm-action-gap);
    --switch-thumb: calc(
      var(--switch-track-h) - (var(--switch-inset) * 2) - (var(--vu-border-width-emphasis) * 2)
    );
    --switch-track-w: calc(
      (var(--switch-thumb) * 2) + (var(--switch-inset) * 2) + (var(--vu-border-width-emphasis) * 2)
    );
    --switch-travel: var(--switch-thumb);

    --sw-idle-track-bg: var(--host-surface-bg);
    --sw-idle-track-bg-hover: var(--surface-tone-hover);
  }

  :host([variant="soft"]) {
    --sw-idle-track-bg: var(--sw-soft);
    --sw-idle-track-bg-hover: var(--sw-soft-hover);
  }

  :host([color="primary"]) {
    --sw-strong: var(--vu-color-accent);
    --sw-strong-fg: var(--vu-color-accent-foreground);
    --sw-strong-hover: color-mix(
      in oklab,
      var(--vu-color-accent) 92%,
      var(--vu-color-foreground) 8%
    );
    --sw-soft: var(--vu-color-accent-soft);
    --sw-soft-fg: var(--vu-color-accent-soft-foreground);
    --sw-soft-hover: var(--vu-color-accent-soft-hover);
    --sw-edge: var(--vu-color-accent);
  }

  :host([color="success"]) {
    --sw-strong: var(--vu-color-success);
    --sw-strong-fg: var(--vu-color-success-foreground);
    --sw-strong-hover: color-mix(
      in oklab,
      var(--vu-color-success) 92%,
      var(--vu-color-foreground) 8%
    );
    --sw-soft: var(--vu-color-success-soft);
    --sw-soft-fg: var(--vu-color-success-soft-foreground);
    --sw-soft-hover: var(--vu-color-success-soft-hover);
    --sw-edge: var(--vu-color-success);
  }

  :host([color="warning"]) {
    --sw-strong: var(--vu-color-warning);
    --sw-strong-fg: var(--vu-color-warning-foreground);
    --sw-strong-hover: color-mix(
      in oklab,
      var(--vu-color-warning) 92%,
      var(--vu-color-foreground) 8%
    );
    --sw-soft: var(--vu-color-warning-soft);
    --sw-soft-fg: var(--vu-color-warning-soft-foreground);
    --sw-soft-hover: var(--vu-color-warning-soft-hover);
    --sw-edge: var(--vu-color-warning);
  }

  :host([color="danger"]) {
    --sw-strong: var(--vu-color-danger);
    --sw-strong-fg: var(--vu-color-danger-foreground);
    --sw-strong-hover: color-mix(
      in oklab,
      var(--vu-color-danger) 92%,
      var(--vu-color-foreground) 8%
    );
    --sw-soft: var(--vu-color-danger-soft);
    --sw-soft-fg: var(--vu-color-danger-soft-foreground);
    --sw-soft-hover: var(--vu-color-danger-soft-hover);
    --sw-edge: var(--vu-color-danger);
  }

  :host([size="sm"]) {
    --switch-track-h: var(--vu-space-5);
  }

  :host([size="lg"]) {
    --switch-track-h: var(--vu-space-7);
  }

  :host([readonly]) .swx {
    cursor: default;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
  }

  :host([compact]) {
    --switch-gap: var(--vu-space-1);
  }

  :host([compact]) .switch-hint,
  :host([compact]) .error-message {
    margin-block-start: 2px;
  }

  .switch-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .switch-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--switch-gap);
  }

  .switch-wrapper.no-text {
    gap: 0;
  }

  .switch-label-text {
    text-align: start;
    color: var(--vu-color-foreground);
    font-size: inherit;
    line-height: var(--vu-line-height-snug);
    min-inline-size: 0;
  }

  ::slotted(*) {
    font-size: inherit;
    line-height: var(--vu-line-height-snug);
  }

  .swx {
    display: inline-flex;
    align-items: center;
    gap: var(--switch-gap);
    margin: 0;
    padding: 0;
    min-block-size: var(--switch-track-h);
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

  .track {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
    inline-size: var(--switch-track-w);
    block-size: var(--switch-track-h);
    padding: var(--switch-inset);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    border: var(--vu-border-width-emphasis) solid transparent;
    background: transparent;
    overflow: hidden;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic),
      transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  .thumb {
    flex-shrink: 0;
    inline-size: var(--switch-thumb);
    block-size: var(--switch-thumb);
    box-sizing: border-box;
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: var(--vu-color-surface-elevated, #fff);
    border: var(--vu-border-width) solid
      color-mix(in oklab, var(--vu-color-border) 55%, transparent);
    box-shadow: var(--vu-shadow-overlay);
    transform: translateX(0);
    transition:
      transform var(--vu-duration-normal) var(--vu-ease-out-cubic),
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic);
    pointer-events: none;
  }

  input:checked + .swx .thumb,
  .swx.checked .thumb {
    transform: translateX(var(--switch-travel));
  }

  :host(:dir(rtl)) input:checked + .swx .thumb,
  :host(:dir(rtl)) .swx.checked .thumb {
    transform: translateX(calc(-1 * var(--switch-travel)));
  }

  @media (hover: hover) {
    :host(:not([disabled]):not([readonly])) .swx:hover .track {
      background: var(--sw-soft);
      border-color: var(--sw-edge);
    }

    :host(:not([disabled]):not([readonly])) input:checked + .swx:hover .track,
    :host(:not([disabled]):not([readonly])) .swx.checked:hover .track {
      background: var(--sw-strong-hover);
      border-color: var(--sw-strong-hover);
    }

    :host([variant="outline"]:not([disabled]):not([readonly])) .swx:hover .track {
      background: color-mix(in oklab, var(--vu-color-field) 85%, var(--vu-color-foreground) 6%);
    }

    :host([variant="outline"]:not([disabled]):not([readonly])) input:checked + .swx:hover .track,
    :host([variant="outline"]:not([disabled]):not([readonly])) .swx.checked:hover .track {
      background: color-mix(in oklab, var(--sw-strong) 26%, transparent);
      border-color: var(--sw-strong);
    }

    :host(:not([variant="outline"]):not([disabled]):not([readonly])) .swx:hover .track {
      background: var(--sw-idle-track-bg-hover);
      border-color: transparent;
    }

    :host(:not([variant="outline"]):not([disabled]):not([readonly]))
      input:checked
      + .swx:hover
      .track,
    :host(:not([variant="outline"]):not([disabled]):not([readonly])) .swx.checked:hover .track {
      background: var(--sw-strong-hover);
      border-color: var(--sw-strong-hover);
    }
  }

  input[type="checkbox"]:focus-visible + .swx .track {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  input[type="checkbox"]:focus:not(:focus-visible) + .swx .track {
    box-shadow: none;
  }

  :host([variant="outline"]) .track {
    background: color-mix(in oklab, var(--vu-color-field) 70%, transparent);
    border-color: var(--sw-edge);
  }

  :host([variant="outline"]) input:checked + .swx .track,
  :host([variant="outline"]) .swx.checked .track {
    background: color-mix(in oklab, var(--sw-strong) 18%, transparent);
    border-color: var(--sw-strong);
  }

  :host(:not([variant="outline"])) .track {
    background: var(--sw-idle-track-bg);
    border-color: transparent;
  }

  :host(:not([variant="outline"])) input:checked + .swx .track,
  :host(:not([variant="outline"])) .swx.checked .track {
    background: var(--sw-strong);
    border-color: var(--sw-strong);
  }

  :host(:not([variant="outline"])) input:checked + .swx .thumb,
  :host(:not([variant="outline"])) .swx.checked .thumb {
    background: var(--sw-strong-fg);
    border-color: color-mix(in oklab, var(--sw-strong-fg) 82%, var(--sw-strong) 18%);
    box-shadow: none;
  }

  :host([variant="outline"]) input:checked + .swx .thumb,
  :host([variant="outline"]) .swx.checked .thumb {
    background: var(--sw-strong);
    border-color: var(--sw-strong);
    box-shadow: none;
  }

  .track--invalid {
    border-color: var(--vu-color-danger);
  }

  @media (forced-colors: active) {
    .track {
      border-color: CanvasText;
    }

    input[type="checkbox"]:focus-visible + .swx .track {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }
  }

  @media (prefers-contrast: more) {
    .track {
      border-width: var(--vu-border-width-emphasis);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  :host(:not([disabled]):not([readonly])) .swx:active .track {
    transform: scale(0.97);
  }

  @media (prefers-reduced-motion: reduce) {
    .swx,
    .track,
    .thumb {
      transition-duration: var(--vu-duration-instant);
    }
    :host(:not([disabled]):not([readonly])) .swx:active .track {
      transform: none;
    }
  }
`;
