import { css } from "lit";

export const breadcrumbItemStyles = css`
  :host {
    display: inline-flex;
    align-items: center;
    gap: var(--breadcrumb-item-gap, calc(var(--vu-spacing) * 1.5));
    font-family: var(--vu-font-sans);
    font-size: var(--breadcrumb-font-size, var(--vu-font-size-sm));
    line-height: var(--vu-line-height-snug);
    color: var(--vu-color-foreground);
    min-inline-size: 0;

    --breadcrumb-link-gap: calc(var(--vu-spacing) * 1.25);
  }

  :host([size="sm"]) {
    --breadcrumb-font-size: var(--vu-font-size-xs);
    --breadcrumb-item-gap: var(--vu-spacing);
    --breadcrumb-link-gap: var(--vu-spacing);
  }
  :host([size="md"]) {
    --breadcrumb-font-size: var(--vu-font-size-sm);
  }
  :host([size="lg"]) {
    --breadcrumb-font-size: var(--vu-font-size-md);
    --breadcrumb-item-gap: calc(var(--vu-spacing) * 2);
    --breadcrumb-link-gap: calc(var(--vu-spacing) * 1.5);
  }

  [part="separator"] {
    display: inline-flex;
    align-items: center;
    color: var(--vu-color-foreground);
    opacity: 0.45;
    user-select: none;
    font-size: 1em;
    line-height: 1;
  }
  [part="separator"]::before {
    content: var(--breadcrumb-separator, "/");
  }
  :host([first]) [part="separator"] {
    display: none;
  }
  :host([first]) [part="separator"][hidden] {
    display: none;
  }

  [part="link"] {
    display: inline-flex;
    align-items: center;
    gap: var(--breadcrumb-link-gap);
    min-inline-size: 0;
    color: inherit;
    text-decoration: none;
    border-radius: var(--vu-radius-sm);
    corner-shape: var(--vu-corner-shape, round);
    padding-block: calc(var(--vu-spacing) * 0.5);
    padding-inline: calc(var(--vu-spacing) * 1.25);
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition:
      color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      background var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([size="sm"]) [part="link"] {
    padding-block: calc(var(--vu-spacing) * 0.375);
    padding-inline: calc(var(--vu-spacing) * 1);
  }
  :host([size="lg"]) [part="link"] {
    padding-block: calc(var(--vu-spacing) * 0.625);
    padding-inline: calc(var(--vu-spacing) * 1.5);
  }

  a[part="link"] {
    cursor: pointer;
    color: var(--vu-color-foreground);
    opacity: 0.72;
  }
  @media (hover: hover) {
    a[part="link"]:hover {
      opacity: 1;
      background: var(--surface-tone-hover, var(--vu-color-surface-hover));
    }
  }
  a[part="link"]:active {
    background: var(--surface-tone-active, var(--vu-color-surface-active));
    opacity: 1;
  }
  a[part="link"]:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
    opacity: 1;
  }

  :host([current]) [part="link"] {
    color: var(--vu-color-foreground);
    font-weight: var(--vu-font-weight-semibold);
    cursor: default;
    opacity: 1;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
  }
  :host([disabled]) a[part="link"] {
    cursor: default;
  }
  /* Parent trail already dims — don't stack link/separator opacity under it. */
  :host-context(vu-breadcrumb[disabled]) a[part="link"],
  :host-context(vu-breadcrumb[disabled]) [part="separator"] {
    opacity: 1;
  }
  :host([disabled]):host-context(vu-breadcrumb[disabled]) {
    opacity: 1;
  }

  [part="content"] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-inline-size: 0;
  }

  [part="start"] {
    display: inline-flex;
    align-items: center;
    flex: none;
    color: currentColor;
  }

  [part="start"][hidden] {
    display: none;
  }

  :host:not(:has([slot="start"])) [part="start"] {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    [part="link"] {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    [part="separator"] {
      opacity: 1;
    }
    a[part="link"]:focus-visible {
      box-shadow: none;
      outline: var(--vu-border-width-emphasis) solid currentColor;
      outline-offset: var(--vu-space-half);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
    @media (hover: hover) {
      a[part="link"]:hover {
        background: var(--vu-color-surface-hover);
      }
    }
    a[part="link"]:active {
      background: var(--vu-color-surface-active);
    }
  }

  @media (forced-colors: active) {
    a[part="link"]:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }
    :host([current]) [part="link"] {
      color: CanvasText;
      forced-color-adjust: none;
    }
  }
`;
