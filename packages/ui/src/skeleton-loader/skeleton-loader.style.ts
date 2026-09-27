import { css } from "lit";

export const skeletonLoaderStyles = css`
  :host {
    display: block;
    box-sizing: border-box;
    inline-size: 100%;
    -webkit-tap-highlight-color: transparent;
  }

  [part="placeholder"],
  [part="content"] {
    transition:
      opacity var(--vu-duration-normal) var(--vu-ease-out-cubic),
      visibility var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  [part="placeholder"][hidden],
  [part="content"][hidden] {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    [part="placeholder"],
    [part="content"] {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    [part="placeholder"],
    [part="content"] {
      outline: var(--vu-border-width-emphasis) solid transparent;
    }
  }

  @media (forced-colors: active) {
    [part="placeholder"],
    [part="content"] {
      border: var(--vu-border-width-emphasis) solid CanvasText;
    }
  }
`;
