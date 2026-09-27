import { css } from "lit";

export const buttonGroupStyles = css`
  :host {
    display: inline-flex;
    box-sizing: border-box;
    vertical-align: middle;
  }

  :host([orientation="vertical"]) {
    display: inline-flex;
    flex-direction: column;
  }

  [part="base"] {
    display: inline-flex;
    align-items: stretch;
  }
  :host([orientation="vertical"]) [part="base"] {
    flex-direction: column;
  }

  ::slotted([attached]) {
    align-self: stretch;
  }

  :host([variant="outline"][orientation="horizontal"]) ::slotted([attached="middle"]),
  :host([variant="outline"][orientation="horizontal"]) ::slotted([attached="last"]) {
    margin-inline-start: calc(-1 * var(--vu-border-width-emphasis));
  }
  :host([variant="outline"][orientation="vertical"]) ::slotted([attached="middle"]),
  :host([variant="outline"][orientation="vertical"]) ::slotted([attached="last"]) {
    margin-block-start: calc(-1 * var(--vu-border-width-emphasis));
  }

  ::slotted([attached]) {
    position: relative;
  }
  ::slotted([attached]:focus-within),
  ::slotted([attached]:hover) {
    z-index: 1;
  }

  ::slotted([pressed]) {
    z-index: 2;
  }

  :host([disabled]) {
    cursor: not-allowed;
    pointer-events: none;
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) ::slotted([attached]) {
      outline: var(--vu-border-width-emphasis) solid transparent;
      outline-offset: calc(-1 * var(--vu-border-width-emphasis));
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) ::slotted([attached]) {
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    ::slotted([attached]) {
      margin: 0 !important;
    }
  }
`;
