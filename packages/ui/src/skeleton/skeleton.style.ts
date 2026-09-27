import { css } from "lit";
import { surfaceToneInteractionHost } from "../internals/styles/surface-tone-interaction.css.js";

export const skeletonStyles = css`
  ${surfaceToneInteractionHost}

  :host {
    display: block;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;

    --skel-bg: var(--vu-color-surface);
    --skel-highlight: var(--surface-tone-hover);
    --skel-wave-speed: var(--vu-duration-spin);
    --skel-pulse-speed: var(--vu-duration-slow);
  }

  :host([inline]) {
    display: inline-block;
    vertical-align: middle;
  }

  :host([tone="subtle"]) {
    --skel-bg: var(--vu-color-surface-secondary);
  }

  :host([tone="strong"]) {
    --skel-bg: var(--vu-color-surface-tertiary);
  }

  :host([animation="none"]) [part="root"]::after {
    display: none;
  }

  :host([animation="pulse"]) [part="root"] {
    animation: skeleton-pulse var(--skel-pulse-speed) var(--vu-ease-in-out-cubic) infinite;
  }

  :host([animation="pulse"]) [part="root"]::after {
    display: none;
  }

  :host([animation="wave"]) [part="root"]::after {
    animation: skeleton-wave var(--skel-wave-speed) var(--vu-ease-linear) infinite;
  }

  [part="root"] {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    border-radius: inherit;
    corner-shape: var(--vu-corner-shape, round);
    background: inherit;
    position: relative;
    overflow: hidden;
  }

  [part="root"]::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: linear-gradient(90deg, transparent, var(--skel-highlight), transparent);
    transform: translateX(-100%);
  }

  @keyframes skeleton-wave {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(100%);
    }
  }

  @keyframes skeleton-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.55;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :host([animation="wave"]) [part="root"]::after,
    :host([animation="pulse"]) [part="root"] {
      animation: none;
    }
  }

  @media (prefers-contrast: more) {
    :host {
      outline: var(--vu-border-width-emphasis) solid transparent;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([animation="pulse"]) [part="root"] {
      animation: none;
      opacity: 1;
    }
  }

  @media (forced-colors: active) {
    :host {
      forced-color-adjust: none;
      --skel-bg: Canvas;
      --skel-highlight: Highlight;
    }
  }
`;
