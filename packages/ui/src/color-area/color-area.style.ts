import { css } from "lit";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";

export const colorAreaStyles = css`
  ${fieldValidationStyles}

  :host {
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    box-sizing: border-box;
    inline-size: var(--color-area-size, 16rem);
    block-size: var(--color-area-size, 16rem);
    color: var(--vu-color-foreground);
    font-family: var(--vu-font-sans);
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
    position: relative;

    --color-area-hue: 0;
    --color-area-saturation: 100;
    --color-area-brightness: 100;
    --color-area-color: hsl(0 100% 50%);
    --color-area-thumb-x-pct: 100;
    --color-area-thumb-y-pct: 100;

    --color-area-thumb-size: var(--vu-space-4-5, 1.125rem);
    --color-area-radius: var(--vu-radius-md, 0.5rem);
    --color-area-dot-color: rgba(255, 255, 255, 0.45);
    --color-area-dot-size: 3px;
    --color-area-dot-gap: 16.6667%;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
  }

  :host([readonly]) [part="base"] {
    cursor: default;
  }

  .color-area-field {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: stretch;
    min-inline-size: 0;
    block-size: 100%;
  }

  .error-message {
    margin-block-start: var(--vu-space-half);
  }

  [part="base"] {
    position: relative;
    flex: 1 1 auto;
    inline-size: 100%;
    block-size: 100%;
    min-block-size: 0;
    border-radius: var(--color-area-radius);
    corner-shape: var(--vu-corner-shape, round);
    box-shadow:
      inset 0 0 0 1px color-mix(in oklab, currentColor 12%, transparent),
      var(--vu-shadow-surface, 0 1px 2px rgba(0, 0, 0, 0.06));
    cursor: crosshair;
    overflow: hidden;
  }

  :host([planerenderer="css"]) [part="base"] {
    background-color: hsl(var(--color-area-hue) 100% 50%);
    background-image:
      linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, transparent);
  }

  :host([planerenderer="canvas"]) [part="base"] {
    background-color: transparent;
    background-image: none;
  }

  canvas.plane {
    position: absolute;
    inset: 0;
    display: block;
    inline-size: 100%;
    block-size: 100%;
    pointer-events: none;
    border-radius: var(--color-area-radius);
    corner-shape: var(--vu-corner-shape, round);
  }

  canvas.plane[hidden] {
    display: none;
  }

  [part="thumb"] {
    position: absolute;
    inline-size: var(--color-area-thumb-size);
    block-size: var(--color-area-thumb-size);
    border-radius: 9999px;
    corner-shape: var(--vu-corner-shape, round);
    background: var(--color-area-color);
    box-shadow:
      0 0 0 2px #fff,
      0 0 0 3px rgba(0, 0, 0, 0.4),
      0 1px 2px rgba(0, 0, 0, 0.3);
    transform: translate(-50%, -50%);
    pointer-events: none;
    transition:
      box-shadow var(--vu-duration-fast) var(--vu-ease-out-cubic),
      background var(--vu-duration-fast) var(--vu-ease-out-cubic);
    inset-inline-start: calc(var(--color-area-thumb-x-pct) * 1%);
    inset-block-start: calc((100 - var(--color-area-thumb-y-pct)) * 1%);
  }

  [part="dots"] {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(
      circle at center,
      var(--color-area-dot-color) 0,
      var(--color-area-dot-color) calc(var(--color-area-dot-size) / 2),
      transparent calc(var(--color-area-dot-size) / 2 + 0.5px)
    );
    background-size: var(--color-area-dot-gap) var(--color-area-dot-gap);
    background-position: calc(var(--color-area-dot-gap) / 2) calc(var(--color-area-dot-gap) / 2);
    mix-blend-mode: difference;
    border-radius: var(--color-area-radius);
    corner-shape: var(--vu-corner-shape, round);
  }

  :host(:focus) {
    outline: none;
  }

  :host(:focus-visible) [part="base"] {
    box-shadow: var(--vu-shadow-surface, 0 1px 2px rgba(0, 0, 0, 0.06));
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
    [part="base"] {
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
    :host([planerenderer="css"]) [part="base"] {
      forced-color-adjust: none;
      box-shadow: inset 0 0 0 1px CanvasText;
    }
    :host([planerenderer="canvas"]) canvas.plane {
      forced-color-adjust: none;
      opacity: 0.85;
    }
    [part="thumb"] {
      forced-color-adjust: none;
      background: Highlight;
      box-shadow:
        0 0 0 2px Canvas,
        0 0 0 3px CanvasText;
    }
    :host(:focus-visible) [part="base"] {
      box-shadow: none;
    }

    :host(:focus-visible) [part="thumb"] {
      box-shadow:
        0 0 0 2px Canvas,
        0 0 0 4px CanvasText;
    }
    [part="dots"] {
      mix-blend-mode: normal;
      background-image: radial-gradient(
        circle at center,
        CanvasText 0,
        CanvasText calc(var(--color-area-dot-size) / 2),
        transparent calc(var(--color-area-dot-size) / 2 + 0.5px)
      );
    }
  }
`;
