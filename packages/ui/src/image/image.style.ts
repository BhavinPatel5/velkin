import { css } from "lit";

export const imageStyles = css`
  :host {
    display: inline-block;
    box-sizing: border-box;
    max-inline-size: 100%;
    overflow: hidden;
    vertical-align: middle;
  }

  img,
  [part="placeholder"] {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    max-inline-size: 100%;
  }

  img {
    object-fit: cover;
    object-position: center;
  }

  :host([fit="contain"]) img {
    object-fit: contain;
  }

  :host([fit="fill"]) img {
    object-fit: fill;
  }

  :host([fit="none"]) img {
    object-fit: none;
  }

  :host([fit="scale-down"]) img {
    object-fit: scale-down;
  }

  [part="placeholder"] {
    background: inherit;
  }

  @media (prefers-contrast: more) {
    [part="placeholder"] {
      outline: 1px solid var(--vu-color-foreground, currentColor);
      outline-offset: -1px;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    [part="placeholder"] {
      background: var(--vu-color-surface, Canvas);
    }
  }

  @media (forced-colors: active) {
    [part="placeholder"] {
      forced-color-adjust: none;
      background: Canvas;
      outline: 1px solid CanvasText;
      outline-offset: -1px;
    }
  }
`;
