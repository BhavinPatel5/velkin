import { css } from "lit";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import {
  glassOverlayHost,
  glassReducedTransparency,
} from "../internals/styles/glass-surface.css.js";

export const colorPickerStyles = css`
  ${fieldValidationStyles}
  ${overlaySurfaceGuard}
  ${glassOverlayHost}
  ${glassReducedTransparency}

  :host {
    display: inline-block;
    box-sizing: border-box;
    color: var(--vu-color-foreground);
    font-family: var(--vu-font-sans);

    --color-picker-width: 18rem;

    --color-picker-area-size: var(--color-picker-width);
    --color-picker-trigger-size: 2rem;
    --color-picker-trigger-radius: var(--vu-radius-sm, 0.375rem);

    --color-picker-popover-padding: var(--vu-space-3, 0.75rem);

    --color-picker-row-height: 2rem;
  }

  .color-picker-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-inline-size: 0;
  }

  .error-message {
    margin-block-start: var(--vu-space-half);
  }

  :host([trigger="swatch"]) {
    inline-size: auto;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
  }

  [part="base"]:focus,
  [part="base"]:focus-visible,
  [part="sliders"]:focus,
  [part="sliders"]:focus-visible,
  [part="row"]:focus,
  [part="row"]:focus-visible,
  [part="swatches"]:focus,
  [part="swatches"]:focus-visible {
    outline: none;
  }

  vu-color-area:focus,
  vu-color-area:focus-visible,
  vu-color-slider:focus,
  vu-color-slider:focus-visible {
    outline: none;
  }

  [part="base"] {
    display: grid;
    gap: var(--vu-space-3, 0.75rem);

    inline-size: min(
      var(--color-picker-width),
      var(--color-picker-area-size, var(--color-picker-width))
    );
    min-inline-size: 0;
    max-inline-size: 100%;
    padding: 0;
  }

  :host(:not([show-area])) [part="base"] {
    inline-size: var(--color-picker-width);
  }

  :host([sliderorientation="vertical"]) [part="sliders"] {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: center;
    gap: var(--vu-space-3, 0.75rem);
    min-block-size: min(12rem, var(--color-picker-area-size, var(--color-picker-width)));
  }

  :host([sliderorientation="vertical"]) [part="sliders"] vu-color-slider {
    --color-slider-length: min(12rem, var(--color-picker-area-size, var(--color-picker-width)));
    block-size: var(--color-slider-length);
    inline-size: auto;
  }

  [part="trigger"] {
    appearance: none;
    -webkit-appearance: none;
    inline-size: var(--color-picker-trigger-size);
    block-size: var(--color-picker-trigger-size);
    padding: 0;
    border: var(--vu-border-width) solid var(--vu-color-border);
    border-radius: var(--color-picker-trigger-radius);
    corner-shape: var(--vu-corner-shape, round);
    cursor: pointer;
    color: inherit;
    font: inherit;

    background:
      linear-gradient(
        var(--color-picker-preview-color, transparent),
        var(--color-picker-preview-color, transparent)
      ),
      linear-gradient(
        45deg,
        color-mix(in oklab, currentColor 14%, transparent) 25%,
        transparent 25%,
        transparent 75%,
        color-mix(in oklab, currentColor 14%, transparent) 75%
      ),
      linear-gradient(
        45deg,
        color-mix(in oklab, currentColor 14%, transparent) 25%,
        transparent 25%,
        transparent 75%,
        color-mix(in oklab, currentColor 14%, transparent) 75%
      );
    background-size:
      100% 100%,
      8px 8px,
      8px 8px;
    background-position:
      0 0,
      0 0,
      4px 4px;
    transition:
      transform var(--vu-duration-fast) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }
  @media (hover: hover) {
    [part="trigger"]:hover:not([disabled]) {
      transform: translateY(-1px);
      box-shadow: 0 2px 6px color-mix(in oklab, currentColor 18%, transparent);
    }
  }
  [part="trigger"]:focus-visible {
    outline: var(--vu-border-width-emphasis, 2px) solid
      var(--vu-color-focus, var(--vu-color-accent));
    outline-offset: var(--vu-space-1, 0.25rem);
  }
  [part="trigger"][disabled] {
    cursor: not-allowed;
    opacity: var(--vu-opacity-disabled-control);
  }

  @media (prefers-reduced-motion: reduce) {
    [part="trigger"],
    [part="popover"] {
      transition-duration: var(--vu-duration-instant);
    }
    [part="trigger"]:hover:not([disabled]) {
      transform: none;
    }
  }

  @media (prefers-contrast: more) {
    [part="trigger"],
    [part="preview"],
    [part="input"],
    [part="format"] {
      border-width: var(--vu-border-width-emphasis);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    [part="popover"] {
      background: var(--vu-color-overlay);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  [part="popover"] {
    margin: 0;
    padding: var(--color-picker-popover-padding);
    border: 0;
    border-radius: min(32px, var(--vu-radius-3xl));
    corner-shape: var(--vu-corner-shape, round);
    background: color-mix(
      in oklab,
      var(--vu-color-overlay) var(--vu-overlay-fill, 100%),
      transparent
    );
    color: var(--vu-color-overlay-foreground);
    box-shadow: var(--vu-shadow-overlay);
    backdrop-filter: var(--vu-overlay-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-overlay-backdrop-filter);
    overflow: visible;
    inline-size: max-content;
    position: fixed;
    left: var(--color-picker-pop-left, 0);
    top: var(--color-picker-pop-top, 0);
  }
  [part="popover"]:focus,
  [part="popover"]:focus-within {
    outline: none;
  }

  [part="popover"] [part="base"] {
    inline-size: min(
      var(--color-picker-width),
      var(--color-picker-area-size, var(--color-picker-width))
    );
  }

  @media (forced-colors: active) {
    [part="trigger"],
    [part="popover"] {
      forced-color-adjust: none;
      border-color: CanvasText;
    }
    [part="trigger"]:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
    }
    [part="popover"] {
      background: Canvas;
      box-shadow: none;
    }
  }

  [part="sliders"] {
    display: grid;
    gap: var(--vu-space-2, 0.5rem);
  }

  [part="row"] {
    display: flex;
    align-items: stretch;
    gap: var(--vu-space-2, 0.5rem);
    block-size: var(--color-picker-row-height);
  }

  [part="preview"],
  [part="input"],
  [part="format-dropdown"],
  [part="format"] {
    box-sizing: border-box;
    block-size: 100%;
    margin: 0;
    border-radius: var(--vu-radius-sm, 0.375rem);
    corner-shape: var(--vu-corner-shape, round);
    font: inherit;
    line-height: 1;
  }

  [part="preview"] {
    inline-size: var(--color-picker-row-height);
    flex: 0 0 auto;
    background:
      linear-gradient(
        var(--color-picker-preview-color, transparent),
        var(--color-picker-preview-color, transparent)
      ),
      linear-gradient(
        45deg,
        color-mix(in oklab, currentColor 14%, transparent) 25%,
        transparent 25%,
        transparent 75%,
        color-mix(in oklab, currentColor 14%, transparent) 75%
      ),
      linear-gradient(
        45deg,
        color-mix(in oklab, currentColor 14%, transparent) 25%,
        transparent 25%,
        transparent 75%,
        color-mix(in oklab, currentColor 14%, transparent) 75%
      );
    background-size:
      100% 100%,
      8px 8px,
      8px 8px;
    background-position:
      0 0,
      0 0,
      4px 4px;
    box-shadow: inset 0 0 0 1px color-mix(in oklab, currentColor 14%, transparent);
  }

  [part="input"] {
    flex: 1 1 auto;
    min-inline-size: 0;
    inline-size: 100%;
    padding: 0 var(--vu-space-2, 0.5rem);
    border: var(--vu-border-width) solid var(--vu-color-border);
    background: var(--vu-color-surface);
    color: inherit;
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    text-transform: lowercase;
  }
  [part="input"]:focus-visible {
    outline: var(--vu-border-width-emphasis, 2px) solid
      var(--vu-color-focus, var(--vu-color-accent));
    outline-offset: var(--vu-space-half, 2px);
  }
  [part="input"][aria-invalid="true"] {
    border-color: var(--vu-color-danger, currentColor);
  }

  [part="format-dropdown"] {
    flex: 0 0 auto;
    display: block; /* So its height 100% works on child */
  }

  [part="format-dropdown"]::part(trigger) {
    block-size: 100%;
  }

  [part="format"] {
    appearance: none;
    -webkit-appearance: none;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    padding: 0 var(--vu-space-5, 1.25rem) 0 var(--vu-space-2, 0.5rem);
    border: var(--vu-border-width) solid var(--vu-color-border);
    background: var(--vu-color-surface);
    color: inherit;
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;

    background-image:
      linear-gradient(45deg, transparent 50%, currentColor 50%, currentColor 56%, transparent 56%),
      linear-gradient(-45deg, transparent 50%, currentColor 50%, currentColor 56%, transparent 56%);
    background-position:
      calc(100% - 0.7rem) 55%,
      calc(100% - 0.4rem) 55%;
    background-size:
      0.3rem 0.3rem,
      0.3rem 0.3rem;
    background-repeat: no-repeat;
  }
  [part="format"]:focus-visible {
    outline: var(--vu-border-width-emphasis, 2px) solid
      var(--vu-color-focus, var(--vu-color-accent));
    outline-offset: var(--vu-space-half, 2px);
  }

  [part="swatches"] {
    display: flex;
    flex-wrap: wrap;
    gap: var(--vu-space-1-5, 0.375rem);
    margin-block-start: var(--vu-space-1, 0.25rem);
  }

  vu-color-area {
    --color-area-size: min(
      var(--color-picker-area-size, var(--color-picker-width)),
      var(--color-picker-width)
    );
    justify-self: center;
  }

  vu-color-slider {
    --color-slider-length: 100%;
    inline-size: 100%;
  }

  @media (forced-colors: active) {
    [part="preview"],
    [part="input"],
    [part="format"] {
      forced-color-adjust: none;
      border-color: CanvasText;
    }
    [part="preview"] {
      box-shadow: inset 0 0 0 1px CanvasText;
    }
    [part="input"]:focus-visible,
    [part="format"]:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
    }
  }
`;
