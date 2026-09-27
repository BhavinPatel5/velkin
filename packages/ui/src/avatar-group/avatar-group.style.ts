import { css } from "lit";

export const avatarGroupStyles = css`
  :host {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;

    /* Default ring gap matches page bg; override when the group sits on another surface. */
    --avatar-bordered-gap-color: var(--vu-color-background);

    /* Overlap scales with size; spacing adjusts density. */
    --_ag-size: var(--vu-control-height-md);
    --_ag-density: 0.28;
    --avatar-group-overlap: calc(var(--_ag-size) * var(--_ag-density) * -1);
  }

  :host([disabled]) {
    pointer-events: none;
  }

  :host([size="sm"]) {
    --_ag-size: var(--vu-control-height-sm);
  }
  :host([size="lg"]) {
    --_ag-size: var(--vu-control-height-lg);
  }

  :host([spacing="sm"]) {
    --_ag-density: 0.4;
  }
  :host([spacing="lg"]) {
    --_ag-density: 0.15;
  }

  [part="group"] {
    display: contents;
  }

  ::slotted(vu-avatar:not(:first-child)),
  ::slotted([slot="overflow"]),
  [part="overflow"] {
    margin-inline-start: var(--avatar-group-overlap);
  }

  ::slotted([slot="overflow"]),
  [part="overflow"] {
    position: relative;
    z-index: var(--avatar-group-overflow-z, 1);
  }

  ::slotted([hidden]) {
    display: none !important;
  }

  @media (prefers-contrast: more) {
    ::slotted(vu-avatar),
    [part="overflow"] {
      outline: var(--vu-border-width-emphasis) solid transparent;
      outline-offset: calc(-1 * var(--vu-border-width-emphasis));
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) ::slotted(vu-avatar),
    :host([disabled]) [part="overflow"] {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    ::slotted(vu-avatar),
    [part="overflow"] {
      forced-color-adjust: auto;
    }
  }
`;
