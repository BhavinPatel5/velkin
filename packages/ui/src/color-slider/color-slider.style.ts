import { css } from "lit";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";

export const colorSliderStyles = css`
  ${fieldValidationStyles}

  :host {
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    box-sizing: border-box;
    inline-size: var(--color-slider-length, 16rem);
    color: var(--vu-color-foreground);
    font-family: var(--vu-font-sans);
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
    position: relative;

    --color-slider-position: 0;
    --color-slider-base: hsl(0 100% 50%);
    --color-slider-track-solid: hsl(0 100% 50%);

    --color-slider-radius: var(--vu-radius-full, 999px);

    --color-slider-thumb-size: max(
      var(--vu-space-6),
      calc(var(--color-slider-thickness, 0.875rem) + 0.5rem)
    );
  }

  .color-slider-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-inline-size: 0;
    inline-size: 100%;
    block-size: 100%;
    flex: 1 1 auto;
  }

  .error-message {
    margin-block-start: var(--vu-space-half);
  }

  :host([orientation="vertical"]) {
    inline-size: var(--color-slider-thickness, 0.875rem);
    block-size: var(--color-slider-length, 16rem);
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
  }

  :host([readonly]) [part="track"] {
    cursor: default;
  }

  [part="track"] {
    position: relative;
    inline-size: 100%;
    block-size: 100%;
    min-block-size: var(--color-slider-thickness, 0.875rem);
    border-radius: var(--color-slider-radius);
    corner-shape: var(--vu-corner-shape, round);
    box-shadow: inset 0 0 0 1px color-mix(in oklab, currentColor 12%, transparent);
    cursor: pointer;
    overflow: visible;
    flex: 1 1 auto;
  }

  :host([orientation="vertical"]) [part="track"] {
    inline-size: 100%;
    block-size: 100%;
    min-inline-size: var(--color-slider-thickness, 0.875rem);
    min-block-size: 0;
  }

  :host(:not([channel="alpha"])) [part="track"] {
    background: var(--color-slider-track-solid);
  }

  :host([channel="alpha"]) [part="track"] {
    background-color: var(--vu-color-surface, white);
    background-image:
      linear-gradient(
        var(--color-slider-alpha-direction, to right),
        transparent,
        var(--color-slider-base)
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
    background-size: 100% 100%, 10px 10px, 10px 10px;
    background-position: 0 0, 0 0, 5px 5px;
  }
  :host([channel="alpha"][orientation="horizontal"]) {
    --color-slider-alpha-direction: to right;
  }
  :host([channel="alpha"][orientation="vertical"]) {
    --color-slider-alpha-direction: to top;
  }

  [part="thumb"] {
    position: absolute;
    inline-size: var(--color-slider-thumb-size);
    block-size: var(--color-slider-thumb-size);
    border-radius: 9999px;
    corner-shape: var(--vu-corner-shape, round);
    background: var(--color-slider-thumb-color, transparent);
    box-shadow:
      0 0 0 2px #fff,
      0 0 0 3px rgba(0, 0, 0, 0.4),
      0 1px 2px rgba(0, 0, 0, 0.3);
    transform: translate(-50%, -50%);
    pointer-events: none;
    transition:
      box-shadow var(--vu-duration-fast) var(--vu-ease-out-cubic),
      background var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }
  :host([orientation="horizontal"]) [part="thumb"] {
    inset-block-start: 50%;
    inset-inline-start: calc(var(--color-slider-position) * 1%);
  }
  :host([orientation="vertical"]) [part="thumb"] {
    inset-inline-start: 50%;
    inset-block-start: calc((100 - var(--color-slider-position)) * 1%);
  }

  :host(:focus) {
    outline: none;
  }

  :host(:focus-visible) [part="track"] {
    box-shadow: none;
  }

  :host(:focus-visible) [part="thumb"] {
    box-shadow:
      0 0 0 2px #fff,
      0 0 0 4px var(--vu-color-focus, var(--vu-color-accent)),
      0 1px 2px rgba(0, 0, 0, 0.3);
  }

  [part="live"] {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    [part="thumb"] {
      transition: none;
    }
  }

  @media (prefers-contrast: more) {
    [part="track"] {
      box-shadow: inset 0 0 0 var(--vu-border-width-emphasis) currentColor;
    }
    [part="thumb"] {
      box-shadow:
        0 0 0 2px #fff,
        0 0 0 calc(var(--vu-border-width-emphasis) * 3) currentColor;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    [part="track"] {
      forced-color-adjust: none;
      box-shadow: inset 0 0 0 1px CanvasText;
    }
    :host(:focus-visible) [part="track"] {
      box-shadow: none;
    }

    [part="thumb"] {
      forced-color-adjust: none;
      background: Highlight;
      box-shadow:
        0 0 0 2px Canvas,
        0 0 0 3px CanvasText;
    }

    :host(:focus-visible) [part="thumb"] {
      box-shadow:
        0 0 0 2px Canvas,
        0 0 0 4px CanvasText;
    }
  }
`;
