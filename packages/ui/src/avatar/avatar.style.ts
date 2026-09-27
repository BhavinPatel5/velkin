import { css } from "lit";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const avatarStyles = css`
  ${controlSizeMetricsTokens}

  :host {
    display: inline-flex;
    box-sizing: border-box;
    line-height: var(--vu-line-height-none);
    font-family: var(--vu-font-sans);
    vertical-align: middle;

    /* Surface — neutral default uses the surface stack (see 30-tokens-and-helpers).
       Intent overrides below switch to the matching '*-soft' tints.
       bg/fg are PAIRED tokens — keep them on the same family (see "Paired tokens" rule). */
    --avatar-bg: var(--vu-color-surface-secondary);
    --avatar-fg: var(--vu-color-surface-secondary-foreground);
    --avatar-ring: var(--vu-color-border);

    /* Sized layout — from controlSizeMetricsTokens (Role A hit target). */
    --avatar-size: var(--vu-csm-action-min-block-size);
    --avatar-font-size: calc(var(--avatar-size) * 0.4);
    --avatar-icon-size: calc(var(--avatar-size) * 0.55);
    --avatar-ring-offset: var(--vu-space-half);

    /* Radius — overridable via [radius='*'] selectors below. Default is circular. */
    --avatar-radius: var(--vu-radius-full);
  }

  /* '--avatar-bordered-gap-color' is intentionally NOT declared on :host so
     a parent (e.g. 'vu-avatar-group' or any consumer surface) can override
     it via plain CSS inheritance — declaring it on :host would let the
     avatar's own value win over the inherited one. The fallback below is
     applied inline at the consumption site instead. */

  :host([disabled]) {
    opacity: var(--vu-opacity-disabled-control);
    pointer-events: none;
  }

  /* Radius — corners only, never sizing. */
  :host([radius="none"]) {
    --avatar-radius: 0;
  }
  :host([radius="sm"]) {
    --avatar-radius: var(--vu-radius-sm);
  }
  :host([radius="md"]) {
    --avatar-radius: var(--vu-radius-md);
  }
  :host([radius="lg"]) {
    --avatar-radius: var(--vu-radius-lg);
  }
  :host([radius="full"]) {
    --avatar-radius: var(--vu-radius-full);
  }

  /* Intent palettes — fallback surface color when no image is shown. */
  :host([color="primary"]) {
    --avatar-bg: var(--vu-color-accent-soft);
    --avatar-fg: var(--vu-color-accent-soft-foreground);
    --avatar-ring: var(--vu-color-accent);
  }
  :host([color="success"]) {
    --avatar-bg: var(--vu-color-success-soft);
    --avatar-fg: var(--vu-color-success-soft-foreground);
    --avatar-ring: var(--vu-color-success);
  }
  :host([color="warning"]) {
    --avatar-bg: var(--vu-color-warning-soft);
    --avatar-fg: var(--vu-color-warning-soft-foreground);
    --avatar-ring: var(--vu-color-warning);
  }
  :host([color="danger"]) {
    --avatar-bg: var(--vu-color-danger-soft);
    --avatar-fg: var(--vu-color-danger-soft-foreground);
    --avatar-ring: var(--vu-color-danger);
  }

  /* Avatar surface — fixed square, clipped to the radius. */
  [part="avatar"] {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--avatar-size);
    block-size: var(--avatar-size);
    overflow: hidden;
    background: var(--avatar-bg);
    color: var(--avatar-fg);
    border-radius: var(--avatar-radius);
    corner-shape: var(--vu-corner-shape, round);
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([radius="full"]) [part="avatar"],
  :host(:not([radius])) [part="avatar"] {
    corner-shape: round;
  }

  /* Bordered ring — uses 'box-shadow' so it follows the radius and doesn't
     affect layout (unlike 'outline', which can't be radiused on Safari).
     Gap color falls back to the page bg; consumers / 'vu-avatar-group' override
     '--avatar-bordered-gap-color' to match whatever surface the avatar sits on. */
  :host([bordered]) [part="avatar"] {
    box-shadow:
      0 0 0 var(--avatar-ring-offset) var(--avatar-bordered-gap-color, var(--vu-color-background)),
      0 0 0 calc(var(--avatar-ring-offset) + var(--vu-border-width-emphasis)) var(--avatar-ring);
  }

  /* Image fills the surface; stays hidden until load so initials/icon remain visible. */
  [part="image"] {
    position: absolute;
    inset: 0;
    display: block;
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
    object-position: center;
    color: transparent;
  }
  [part="image"][hidden] {
    display: none;
  }

  /* Fallback wrapper holds initials, default icon, or slotted content. */
  [part="fallback"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 100%;
    block-size: 100%;
    font-size: var(--avatar-font-size);
    font-weight: var(--vu-font-weight-semibold);
    letter-spacing: var(--vu-letter-spacing-tight);
    /* Override the host's collapsed line-height (set to 0 above to avoid
       affecting surrounding inline text); initials need a proper baseline. */
    line-height: 1;
    user-select: none;
  }

  [part="fallback"][hidden] {
    display: none;
  }

  /* Default-icon fallback gets a slightly larger glyph than initials read at. */
  [part="fallback"] vu-icon {
    font-size: var(--avatar-icon-size);
  }

  /* Slotted custom fallback content inherits color and centers inside the surface. */
  ::slotted(*) {
    color: inherit;
    line-height: 1;
  }

  /* User preferences */
  @media (prefers-reduced-motion: reduce) {
    [part="avatar"] {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    [part="avatar"] {
      outline: var(--vu-border-width-emphasis) solid transparent;
      outline-offset: calc(-1 * var(--vu-border-width-emphasis));
    }
    :host([bordered]) [part="avatar"] {
      box-shadow:
        0 0 0 var(--avatar-ring-offset) var(--avatar-bordered-gap-color, var(--vu-color-background)),
        0 0 0 calc(var(--avatar-ring-offset) + var(--vu-border-width-emphasis) * 2) var(--avatar-ring);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    [part="avatar"] {
      border: var(--vu-border-width-emphasis) solid CanvasText;
    }
    :host([bordered]) [part="avatar"] {
      box-shadow: none;
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--avatar-ring-offset);
    }
  }
`;
