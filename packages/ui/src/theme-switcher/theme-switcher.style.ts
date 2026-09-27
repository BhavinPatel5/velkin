import { css, type CSSResult } from "lit";

export const themeSwitcherStyles: CSSResult = css`
  :host {
    display: inline-block;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
  }

  [part="container"] {
    display: inline-flex;
    align-items: center;
  }

  vu-icon {
    display: inline-flex;
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }
`;
