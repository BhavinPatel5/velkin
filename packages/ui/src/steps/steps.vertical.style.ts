import { css, unsafeCSS } from "lit";

export const stepsVerticalPanelStyles = css`
  .v-panel {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows var(--steps-anim-ms, var(--vu-duration-normal)) var(--steps-anim-ease, var(--vu-ease-out-cubic)),
      opacity var(--steps-anim-ms, var(--vu-duration-normal)) var(--steps-anim-ease, var(--vu-ease-out-cubic));
    overflow: visible;
  }

  .v-panel.is-open {
    grid-template-rows: 1fr;
    opacity: 1;
  }

  .v-inner {
    min-height: 0;
    overflow: hidden;
  }

  .v-content {
    margin-inline-start: var(--steps-content-inset);
    border-inline-start: var(--steps-rail-width) solid var(--vu-color-muted);
    padding-block-start: var(--vu-space-2-5);
    padding-inline-start: var(--vu-space-3);
    padding-block-end: 0;
    padding-inline-end: 0;
    transition: border-color var(--steps-anim-ms, var(--vu-duration-normal)) var(--steps-anim-ease, var(--vu-ease-out-cubic));
  }

  .panel-body {
    padding-block-start: var(--vu-space-1);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-panel {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    .v-content {
      border-inline-start-width: calc(var(--steps-rail-width) + var(--vu-border-width));
    }
  }

  @media (forced-colors: active) {
    .v-content {
      border-inline-start-color: CanvasText;
    }
  }
`;

export const stepsVerticalPanelBorderStyles = (item: string) => css`
  ${unsafeCSS(`${item}:not(:last-child) .v-panel:not(.is-open) .v-content,
  ${item}:not(:last-of-type) .v-panel:not(.is-open) .v-content`)} {
    border-inline-start: var(--steps-rail-width) dashed var(--vu-color-muted);
    opacity: var(--vu-opacity-disabled-control);
  }

  ${unsafeCSS(`${item}:not(:last-child) .v-panel.is-open .v-content,
  ${item}:not(:last-of-type) .v-panel.is-open .v-content`)} {
    border-inline-start: var(--steps-rail-width) solid var(--vu-color-accent);
  }

  ${unsafeCSS(`${item}:last-child .v-content,
  ${item}:last-of-type .v-content`)} {
    border-inline-start: none !important;
  }
`;

export const stepsVerticalRailStyles = (item: string) => css`
  ${unsafeCSS(`${item}:not(:last-child)::after,
  ${item}:not(:last-of-type)::after`)} {
    content: "";
    position: absolute;
    inset-inline-start: var(--steps-node-center);
    margin-inline-start: calc(var(--steps-rail-width) / -2);
    top: var(--steps-rail-top);
    bottom: calc(-1 * var(--vu-space-3));
    width: var(--steps-rail-width);
    background: var(--vu-color-muted);
    z-index: 0;
    transition: background-color var(--steps-anim-ms, var(--vu-duration-normal)) var(--steps-anim-ease, var(--vu-ease-out-cubic));
  }

  ${unsafeCSS(`${item}.completed:not(:last-child)::after,
  ${item}([completed]):not(:last-of-type)::after`)} {
    background: var(--vu-color-accent);
  }

  ${unsafeCSS(`${item}:last-child::after,
  ${item}:last-of-type)::after`)} {
    display: none;
  }

  .v-header .node {
    position: relative;
    z-index: 1;
  }
`;
