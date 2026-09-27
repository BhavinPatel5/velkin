import { css } from "lit";

export const iconStyles = css`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    line-height: 0;
  }

  [part="icon"] {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  [part="icon"] svg {
    display: block;
    width: 100%;
    height: 100%;
    flex-shrink: 0;
  }

  ::slotted(svg) {
    display: block;
    width: 100%;
    height: 100%;
    flex-shrink: 0;
    fill: currentColor;
  }

  .iconify {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .iconify[hidden] {
    display: none;
  }

  .iconify svg {
    display: block;
    width: 100%;
    height: 100%;
    flex-shrink: 0;
  }

  slot[hidden] {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    [part="icon"] {
      transition: none;
    }
  }

  @media (prefers-contrast: more) {
    :host {
      color: var(--vu-color-foreground, currentColor);
    }
  }

  @media (forced-colors: active) {
    :host {
      forced-color-adjust: auto;
      color: CanvasText;
    }

    ::slotted(svg),
    .iconify svg {
      fill: CanvasText;
    }
  }
`;
