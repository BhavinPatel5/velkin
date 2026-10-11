import { css } from "lit";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const carouselStyles = css`
  ${controlSizeMetricsTokens}

  :host {
    display: block;
    box-sizing: border-box;
    position: relative;
    font-family: var(--vu-font-sans);
    color: var(--vu-color-foreground);

    --carousel-gap: 0px;
    --carousel-duration: var(--vu-duration-slow);
    --carousel-easing: var(--vu-ease-out-fluid);
    --carousel-arrow-size: var(--vu-csm-action-min-block-size);
    --carousel-spinner-size: var(--vu-csm-action-min-block-size);

    --carousel-index: 0;
    --carousel-slides-per-view: 1;

    --carousel-slide-basis: max(
      0px,
      calc(
        (100% - (var(--carousel-slides-per-view) - 1) * var(--carousel-gap)) /
          var(--carousel-slides-per-view)
      )
    );
  }

  :host([gap="sm"]) { --carousel-gap: var(--vu-space-2); }
  :host([gap="md"]) { --carousel-gap: var(--vu-space-3); }
  :host([gap="lg"]) { --carousel-gap: var(--vu-space-5); }

  [part="base"] {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "stage"
      "dots";
    inline-size: 100%;
    box-sizing: border-box;
  }
  :host([orientation="vertical"]) [part="base"] {
    block-size: 100%;
    min-block-size: 0;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  [part="viewport"] {
    grid-area: stage;
    position: relative;
    overflow: hidden;
    inline-size: 100%;
    border-radius: inherit;
    touch-action: pan-y;
  }
  :host([orientation="vertical"]) [part="viewport"] {
    min-block-size: 0;
    display: flex;
    flex-direction: column;
    touch-action: pan-x;
  }

  [part="track"] {
    display: flex;
    flex-direction: row;
    gap: var(--carousel-gap);
    inline-size: 100%;
    transition: transform var(--carousel-duration) var(--carousel-easing);
    will-change: transform;
    transform: translateX(
      calc(
        -1 * var(--carousel-index) *
          (var(--carousel-slide-basis) + var(--carousel-gap))
      )
    );
  }
  :host([orientation="vertical"]) [part="track"] {
    flex-direction: column;
    flex: 1 1 auto;
    min-block-size: 0;
    transform: translateY(
      calc(
        -1 * var(--carousel-index) *
          (var(--carousel-slide-basis) + var(--carousel-gap))
      )
    );
  }

  :host([dragging]) [part="track"] {
    transition: none;
  }

  ::slotted(*) {
    flex: 0 0 var(--carousel-slide-basis);
    min-inline-size: 0;
    box-sizing: border-box;
  }
  :host([orientation="vertical"]) ::slotted(*) {
    flex: 0 0 var(--carousel-slide-basis);
    min-block-size: 0;
  }

  /* Arrows share the stage grid area so focus rings sit outside overflow:hidden viewport. */
  [part="prev"],
  [part="next"] {
    grid-area: stage;
    z-index: 2;
    align-self: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--carousel-arrow-size);
    block-size: var(--carousel-arrow-size);
    margin-inline: 0;
    padding: 0;
    border: var(--vu-border-width) solid var(--vu-color-border);
    border-radius: var(--vu-radius-full, 999px);
    background: var(--vu-color-surface);
    color: var(--vu-color-foreground);
    box-shadow: var(--vu-shadow-surface, 0 1px 2px rgba(0, 0, 0, 0.06));
    cursor: pointer;
    font: inherit;
    transition:
      background var(--vu-duration-fast) var(--vu-ease-out-cubic),
      opacity var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }
  [part="prev"] {
    justify-self: start;
    margin-inline-start: var(--vu-space-2-5, 0.5rem);
  }
  [part="next"] {
    justify-self: end;
    margin-inline-end: var(--vu-space-2-5, 0.5rem);
  }
  :host([orientation="vertical"]) [part="prev"] {
    align-self: start;
    justify-self: center;
    margin-block-start: var(--vu-space-2-5, 0.5rem);
    margin-inline-start: 0;
  }
  :host([orientation="vertical"]) [part="next"] {
    align-self: end;
    justify-self: center;
    margin-block-end: var(--vu-space-2-5, 0.5rem);
    margin-inline-end: 0;
  }

  @media (hover: hover) {
    [part="prev"]:hover:not([disabled]),
    [part="next"]:hover:not([disabled]) {
      background: color-mix(in oklab, var(--vu-color-foreground) 6%, var(--vu-color-surface));
    }
  }
  [part="prev"]:active:not([disabled]),
  [part="next"]:active:not([disabled]) {
    background: color-mix(in oklab, var(--vu-color-foreground) 10%, var(--vu-color-surface));
  }
  [part="prev"]:focus-visible,
  [part="next"]:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring), var(--vu-shadow-surface, 0 1px 2px rgba(0, 0, 0, 0.06));
  }
  [part="prev"][disabled],
  [part="next"][disabled] {
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
    pointer-events: none;
  }

  [part="dots"] {
    grid-area: dots;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
    gap: var(--vu-space-1-5, 0.375rem);
    margin-block-start: var(--vu-space-3, 0.75rem);
  }
  :host([orientation="vertical"]) [part="dots"] {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-end: var(--vu-space-2-5, 0.5rem);
    transform: translateY(-50%);
    flex-direction: column;
    margin-block-start: 0;
  }

  [part~="dot"] {
    appearance: none;
    -webkit-appearance: none;
    margin: 0;
    padding: 0;
    inline-size: var(--vu-space-2-5, 0.625rem);
    block-size: var(--vu-space-2-5, 0.625rem);
    flex: 0 0 auto;
    border: none;
    border-radius: 9999px;
    aspect-ratio: 1;
    background: color-mix(in oklab, currentColor 25%, transparent);
    cursor: pointer;
    transition:
      background var(--vu-duration-fast) var(--vu-ease-out-cubic),
      opacity var(--vu-duration-fast) var(--vu-ease-out-cubic),
      inline-size var(--vu-duration-fast) var(--vu-ease-out-cubic),
      block-size var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }
  [part~="dot-active"] {
    background: var(--vu-color-accent);
    inline-size: var(--vu-space-3, 0.75rem);
    block-size: var(--vu-space-3, 0.75rem);
  }
  @media (hover: hover) {
    [part~="dot"]:hover {
      background: color-mix(in oklab, currentColor 45%, transparent);
    }
    [part~="dot-active"]:hover {
      background: var(--vu-color-accent);
    }
  }
  [part~="dot"]:focus-visible {
    outline: var(--vu-border-width-emphasis, 2px) solid var(--vu-color-focus, var(--vu-color-accent));
    outline-offset: var(--vu-space-1, 0.25rem);
    box-shadow: none;
  }

  [part="live"] {
    grid-area: stage;
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

  [part="loading"] {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in oklab, var(--vu-color-surface) 75%, transparent);
    z-index: 3;
    border-radius: inherit;
  }
  [part="spinner"] {
    inline-size: var(--carousel-spinner-size);
    block-size: var(--carousel-spinner-size);
    border: 2px solid color-mix(in oklab, currentColor 18%, transparent);
    border-top-color: var(--vu-color-accent);
    border-radius: 50%;
    animation: vu-carousel-spin 0.8s linear infinite;
  }
  @keyframes vu-carousel-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    [part="track"],
    [part="prev"],
    [part="next"],
    [part~="dot"] {
      transition: none;
    }
    [part="spinner"] {
      animation: none;
    }
  }

  @media (prefers-contrast: more) {
    [part="prev"],
    [part="next"] {
      border-width: var(--vu-border-width-emphasis);
    }
    [part~="dot"] {
      outline: var(--vu-border-width-emphasis) solid currentColor;
      outline-offset: var(--vu-space-half);
    }
    [part~="dot"]:focus-visible,
    [part="prev"]:focus-visible,
    [part="next"]:focus-visible {
      outline-width: calc(var(--vu-border-width-emphasis) * 2);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    [part="loading"] {
      background: var(--vu-color-surface);
    }
    [part~="dot"] {
      background: var(--vu-color-surface-secondary);
    }
    [part~="dot-active"] {
      background: var(--vu-color-accent);
    }
  }

  @media (forced-colors: active) {
    [part="prev"],
    [part="next"] {
      border: var(--vu-border-width-emphasis, 2px) solid CanvasText;
      background: Canvas;
      color: CanvasText;
      box-shadow: none;
      forced-color-adjust: none;
    }
    [part="prev"]:focus-visible,
    [part="next"]:focus-visible {
      outline: var(--vu-border-width-emphasis, 2px) solid CanvasText;
      outline-offset: var(--vu-space-half, 2px);
      box-shadow: none;
    }
    [part="prev"][disabled],
    [part="next"][disabled] {
      color: GrayText;
      border-color: GrayText;
    }
    [part~="dot"] {
      border: none;
      outline: var(--vu-border-width-emphasis, 2px) solid CanvasText;
      outline-offset: 0;
      background: Canvas;
      forced-color-adjust: none;
    }
    [part~="dot-active"] {
      background: Highlight;
      outline-color: CanvasText;
    }
    [part~="dot"]:focus-visible {
      outline: var(--vu-border-width-emphasis, 2px) solid CanvasText;
      outline-offset: var(--vu-space-1, 0.25rem);
    }
  }
`;
