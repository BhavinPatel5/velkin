import { css } from "lit";

export const carouselItemStyles = css`
  :host {
    display: block;
    box-sizing: border-box;
    min-inline-size: 0;
    min-block-size: 0;
    font-family: var(--vu-font-sans);
    color: var(--vu-color-foreground);
  }

  /* Vertical carousels size each slide as a flex slice; fill that slice so media/cards paint edge-to-edge. */
  :host([orientation="vertical"]) {
    min-block-size: 100%;
    align-self: stretch;
  }

  [part="base"] {
    display: block;
    box-sizing: border-box;
    inline-size: 100%;
    block-size: 100%;
    min-block-size: inherit;
  }
`;
