import { css } from "lit";

export const overlayStyles = css`
  :host {
    display: block;
    box-sizing: border-box;
    pointer-events: none;
    font-family: var(--vu-font-sans);
    -webkit-tap-highlight-color: transparent;
    position: fixed;
    inset: 0;
    z-index: var(--overlay-z);

    --overlay-backdrop-color: var(--vu-color-backdrop);
    --overlay-z: var(--vu-z-overlay, 500);
  }

  :host([open]) {
    pointer-events: auto;
  }

  [part="backdrop"] {
    position: absolute;
    inset: 0;
    background: var(--overlay-backdrop-color);
    opacity: 0;
    transition: opacity var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([open]) [part="backdrop"] {
    opacity: 1;
  }

  :host([backdropblur]) [part="backdrop"] {
    backdrop-filter: var(--vu-overlay-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-overlay-backdrop-filter);
  }

  [part="content"] {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: var(--vu-space-4);
    pointer-events: none;
    opacity: 0;
    transition: opacity var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([open]) [part="content"] {
    opacity: 1;
  }

  ::slotted(*) {
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    [part="backdrop"],
    [part="content"] {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    [part="backdrop"] {
      outline: var(--vu-border-width-emphasis) solid transparent;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([backdropblur]) [part="backdrop"] {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }

    [part="backdrop"] {
      background: color-mix(in oklab, var(--overlay-backdrop-color) 95%, CanvasText 5%);
    }
  }

  @media (forced-colors: active) {
    [part="backdrop"] {
      forced-color-adjust: none;
      background: Canvas;
      opacity: 0.85;
    }
  }
`;
