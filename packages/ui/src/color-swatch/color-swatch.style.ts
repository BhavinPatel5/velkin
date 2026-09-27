import { css } from "lit";

export const colorSwatchStyles = css`
  :host {
    display: inline-block;
    box-sizing: border-box;
    color: var(--vu-color-foreground);
    font-family: var(--vu-font-sans);
    --color-swatch-size: var(--vu-control-height-sm);
    --color-swatch-check: var(--vu-space-2);
    --color-swatch-inset: var(--vu-border-width);
    --color-swatch-radius: 9999px;
    --color-swatch-color: transparent;
  }

  :host([size="xs"]) {
    --color-swatch-size: var(--vu-space-3-5);
    --color-swatch-check: var(--vu-space-1);
    --color-swatch-inset: var(--vu-border-width);
  }
  :host([size="sm"]) {
    --color-swatch-size: var(--vu-space-4-5);
    --color-swatch-check: var(--vu-space-1-5);
    --color-swatch-inset: var(--vu-border-width);
  }
  :host([size="md"]) {
    --color-swatch-size: var(--vu-control-height-sm);
    --color-swatch-check: var(--vu-space-2);
    --color-swatch-inset: var(--vu-border-width);
  }
  :host([size="lg"]) {
    --color-swatch-size: var(--vu-control-height-md);
    --color-swatch-check: var(--vu-space-2);
    --color-swatch-inset: var(--vu-border-width-emphasis);
  }
  :host([size="xl"]) {
    --color-swatch-size: var(--vu-chrome-height-lg);
    --color-swatch-check: var(--vu-space-2-5);
    --color-swatch-inset: var(--vu-border-width-emphasis);
  }

  :host([shape="square"]) {
    --color-swatch-radius: 0;
  }
  :host([shape="circle"]) {
    --color-swatch-radius: 9999px;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
  }

  :host([readonly]) {
    cursor: default;
  }
  :host([readonly][selectable]) [part="base"] {
    cursor: default;
  }

  [part="base"] {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    inline-size: var(--color-swatch-size);
    block-size: var(--color-swatch-size);
    margin: 0;
    padding: 0;
    border: none;
    border-radius: var(--color-swatch-radius);
    corner-shape: var(--vu-corner-shape, round);
    background-color: var(--color-swatch-color);
    box-shadow: inset 0 0 0 var(--color-swatch-inset) color-mix(in oklab, currentColor 14%, transparent);
    cursor: default;
    color: inherit;
    font: inherit;
    transition:
      transform var(--vu-duration-fast) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-fast) var(--vu-ease-out-cubic),
      outline-offset var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  :host([checkerboard]) [part="base"] {
    background:
      linear-gradient(var(--color-swatch-color), var(--color-swatch-color)),
      linear-gradient(45deg, color-mix(in oklab, currentColor 14%, transparent) 25%, transparent 25%, transparent 75%, color-mix(in oklab, currentColor 14%, transparent) 75%),
      linear-gradient(45deg, color-mix(in oklab, currentColor 14%, transparent) 25%, transparent 25%, transparent 75%, color-mix(in oklab, currentColor 14%, transparent) 75%);
    background-size: 100% 100%, var(--color-swatch-check) var(--color-swatch-check), var(--color-swatch-check) var(--color-swatch-check);
    background-position: 0 0, 0 0, calc(var(--color-swatch-check) / 2) calc(var(--color-swatch-check) / 2);
  }

  :host([selectable]) {
    cursor: pointer;
  }
  :host([selectable]) [part="base"] {
    cursor: pointer;
  }
  @media (hover: hover) {
    :host([selectable]) [part="base"]:hover {
      transform: translateY(-1px);
      box-shadow:
        inset 0 0 0 var(--color-swatch-inset) color-mix(in oklab, currentColor 14%, transparent),
        0 2px 6px color-mix(in oklab, currentColor 18%, transparent);
    }
  }
  :host([selectable]) [part="base"]:focus-visible,
  :host(:focus-visible) [part="base"] {
    outline: var(--vu-border-width-emphasis, 2px) solid
      var(--vu-color-focus, var(--vu-color-accent));
    outline-offset: var(--vu-space-1, 0.25rem);
  }

  :host([selected]) [part="base"]:not(:focus-visible) {
    outline: var(--vu-border-width-emphasis, 2px) solid
      var(--color-swatch-color, currentColor);
    outline-offset: var(--vu-space-half, 2px);
  }
  :host([selected]) [part="base"]::after {
    content: "";
    position: absolute;
    inset: 0;
    background-color: white;
    pointer-events: none;
    filter:
      drop-shadow(0 0 1px rgba(0, 0, 0, 0.55))
      drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
    -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='5 12.5 10 17.5 19 7'/></svg>");
    mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='5 12.5 10 17.5 19 7'/></svg>");
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    -webkit-mask-size: 60% 60%;
    mask-size: 60% 60%;
  }

  @media (prefers-reduced-motion: reduce) {
    [part="base"] {
      transition-duration: var(--vu-duration-instant);
    }
    :host([selectable]) [part="base"]:hover {
      transform: none;
    }
  }

  @media (prefers-contrast: more) {
    [part="base"] {
      box-shadow: inset 0 0 0 var(--vu-border-width-emphasis) currentColor;
    }
    :host([selected]) [part="base"]:not(:focus-visible) {
      outline-width: calc(var(--vu-border-width-emphasis) * 2);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    [part="base"] {
      forced-color-adjust: none;
      box-shadow: inset 0 0 0 1px CanvasText;
    }
    :host([selectable]) [part="base"]:focus-visible,
    :host(:focus-visible) [part="base"] {
      outline: var(--vu-border-width-emphasis, 2px) solid CanvasText;
    }
    :host([selected]) [part="base"]:not(:focus-visible) {
      outline: var(--vu-border-width-emphasis, 2px) solid Highlight;
      outline-offset: var(--vu-space-half, 2px);
    }
    :host([selected]) [part="base"]::after {
      background-color: Highlight;
      mix-blend-mode: normal;
    }
  }
`;
