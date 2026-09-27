import { css } from "lit";

export const spinnerStyles = css`
  :host {
    display: inline-block;
    box-sizing: border-box;
    font-family: var(--vu-font-sans);
    color: var(--vu-color-accent);
    -webkit-tap-highlight-color: transparent;

    --spinner-speed: 0.8s;
    --spinner-size: var(--vu-control-height-sm);
    /* ~10% of glyph; floor so xs stays visible. Custom size lengths inherit this. */
    --spinner-thickness: max(var(--vu-space-half), calc(var(--spinner-size) * 0.1));
  }

  :host([size="xs"]) {
    --spinner-size: var(--vu-space-3);
    --spinner-thickness: var(--vu-space-half);
  }

  :host([size="sm"]) {
    --spinner-size: var(--vu-space-6);
    --spinner-thickness: var(--vu-space-0-75);
  }

  :host([size="md"]) {
    --spinner-size: var(--vu-control-height-sm);
    --spinner-thickness: var(--vu-space-0-75);
  }

  :host([size="lg"]) {
    --spinner-size: var(--vu-control-height-md);
    --spinner-thickness: var(--vu-space-1);
  }

  :host([size="xl"]) {
    --spinner-size: var(--vu-control-height-lg);
    --spinner-thickness: var(--vu-space-1-25);
  }

  :host([color="default"]),
  :host([color="primary"]) {
    color: var(--vu-color-accent);
  }

  :host([color="success"]) {
    color: var(--vu-color-success);
  }

  :host([color="warning"]) {
    color: var(--vu-color-warning);
  }

  :host([color="danger"]) {
    color: var(--vu-color-danger);
  }

  [part="spinner"] {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  :host([overlay]) [part="spinner"] {
    position: absolute;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--vu-color-backdrop, rgba(0, 0, 0, 0.4));
  }

  :host([fullscreen]) [part="spinner"] {
    position: fixed;
    inset: 0;
    inline-size: 100vw;
    block-size: 100vh;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.4);
  }

  :host([backdropblur]) [part="spinner"] {
    backdrop-filter: var(--vu-overlay-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-overlay-backdrop-filter);
  }

  [part="circle"] {
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    border-radius: 50%;
    border-style: solid;
    border-color: transparent;
    border-top-color: currentColor;
    animation: spinner-spin var(--spinner-speed) linear infinite;
    inline-size: var(--spinner-size);
    block-size: var(--spinner-size);
    border-width: var(--spinner-thickness);
  }

  @keyframes spinner-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes spinner-pulse {
    0% {
      transform: scale(0.6);
      opacity: var(--vu-opacity-disabled-control);
    }
    50% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0.6);
      opacity: var(--vu-opacity-disabled-control);
    }
  }

  @keyframes spinner-dots-pulse {
    0% {
      transform: scale(0.6);
      opacity: 0.4;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0.6);
      opacity: 0.4;
    }
  }

  @keyframes spinner-bars-stretch {
    0% {
      transform: scaleY(0.5);
      opacity: var(--vu-opacity-disabled-control);
    }
    50% {
      transform: scaleY(1);
      opacity: 1;
    }
    100% {
      transform: scaleY(0.5);
      opacity: var(--vu-opacity-disabled-control);
    }
  }

  :host([variant="solid"]) [part="circle"] {
    border-color: color-mix(in srgb, currentColor 20%, transparent);
    border-top-color: currentColor;
  }

  :host([variant="track"]) [part="circle"] {
    border-width: var(--spinner-thickness);
    border-color: color-mix(in srgb, currentColor 55%, transparent);
    border-top-color: currentColor;
    border-right-color: color-mix(in srgb, currentColor 35%, transparent);
    border-bottom-color: color-mix(in srgb, currentColor 25%, transparent);
    border-left-color: color-mix(in srgb, currentColor 35%, transparent);
  }

  :host([variant="dashed"]) [part="circle"] {
    border-style: dashed;
    border-color: currentColor;
    border-left-color: transparent;
    border-bottom-color: transparent;
  }

  :host([variant="segment"]) [part="circle"] {
    border: 0;
  }

  :host([variant="segment"]) [part="circle"]::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    box-sizing: border-box;
    background: repeating-conic-gradient(
      from 0deg,
      currentColor 0deg 12deg,
      transparent 12deg 36deg
    );
    mask: radial-gradient(
      farthest-side,
      transparent calc(100% - var(--spinner-thickness)),
      #000 100%
    );
    -webkit-mask: radial-gradient(
      farthest-side,
      transparent calc(100% - var(--spinner-thickness)),
      #000 100%
    );
    animation: spinner-spin calc(var(--spinner-speed) * 1.8) linear infinite;
  }

  :host([variant="gradient"]) [part="circle"] {
    border: 0;
    background: none;
  }

  :host([variant="gradient"]) [part="circle"]::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(from 0deg, transparent, currentColor, transparent);
    animation: spinner-spin var(--spinner-speed) linear infinite;
    mask: radial-gradient(
      farthest-side,
      transparent calc(100% - var(--spinner-thickness)),
      #000 100%
    );
    -webkit-mask: radial-gradient(
      farthest-side,
      transparent calc(100% - var(--spinner-thickness)),
      #000 100%
    );
  }

  :host([variant="dual"]) [part="circle"] {
    border-width: var(--spinner-thickness);
    border-color: transparent;
    border-top-color: currentColor;
    border-bottom-color: currentColor;
  }

  :host([variant="material"]) [part="circle"] {
    border: 0;
  }

  :host([variant="material"]) [part="circle"]::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    box-sizing: border-box;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      transparent 70deg,
      currentColor 70deg,
      currentColor 230deg,
      transparent 230deg,
      transparent 360deg
    );
    mask: radial-gradient(
      farthest-side,
      transparent calc(100% - var(--spinner-thickness)),
      #000 100%
    );
    -webkit-mask: radial-gradient(
      farthest-side,
      transparent calc(100% - var(--spinner-thickness)),
      #000 100%
    );
    animation: spinner-spin calc(var(--spinner-speed) * 1.1) cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  :host([variant="pulse"]) [part="circle"] {
    border: 0;
    border-radius: 50%;
    inline-size: calc(var(--spinner-size) * 0.5);
    block-size: calc(var(--spinner-size) * 0.5);
    background-color: currentColor;
    animation: spinner-pulse calc(var(--spinner-speed) * 1.1) ease-in-out infinite;
  }

  [part="dots"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: calc(var(--spinner-size) * 0.14);
  }

  [part="dot"] {
    inline-size: calc(var(--spinner-size) * 0.2);
    block-size: calc(var(--spinner-size) * 0.2);
    border-radius: 50%;
    background-color: currentColor;
    animation: spinner-dots-pulse calc(var(--spinner-speed) * 1.3) ease-in-out infinite;
  }

  [part="dot"]:nth-child(2) {
    animation-delay: calc(var(--spinner-speed) * 0.18);
  }

  [part="dot"]:nth-child(3) {
    animation-delay: calc(var(--spinner-speed) * 0.36);
  }

  [part="bars"] {
    display: inline-flex;
    align-items: flex-end;
    justify-content: center;
    gap: calc(var(--spinner-size) * 0.08);
  }

  [part="bar"] {
    inline-size: calc(var(--spinner-size) * 0.12);
    block-size: calc(var(--spinner-size) * 0.35);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background-color: currentColor;
    transform-origin: center bottom;
    animation: spinner-bars-stretch calc(var(--spinner-speed) * 1.4) ease-in-out infinite;
  }

  [part="bar"]:nth-child(2) {
    animation-delay: calc(var(--spinner-speed) * 0.12);
  }

  [part="bar"]:nth-child(3) {
    animation-delay: calc(var(--spinner-speed) * 0.24);
  }

  [part="bar"]:nth-child(4) {
    animation-delay: calc(var(--spinner-speed) * 0.36);
  }

  :host([paused]) [part="circle"],
  :host([paused]) [part="circle"]::before,
  :host([paused]) [part="dot"],
  :host([paused]) [part="bar"],
  :host([paused]) [part="circle"] {
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    [part="circle"],
    [part="circle"]::before,
    [part="dot"],
    [part="bar"] {
      animation-duration: var(--vu-duration-instant);
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([backdropblur]) [part="spinner"] {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
  }

  @media (prefers-contrast: more) {
    :host([overlay]) [part="spinner"],
    :host([fullscreen]) [part="spinner"] {
      box-shadow: inset 0 0 0 var(--vu-border-width-emphasis) CanvasText;
    }
  }

  @media (forced-colors: active) {
    :host([overlay]) [part="spinner"],
    :host([fullscreen]) [part="spinner"] {
      background: Canvas;
      box-shadow: inset 0 0 0 1px CanvasText;
    }

    [part="circle"],
    [part="dot"],
    [part="bar"] {
      forced-color-adjust: none;
      background: Highlight;
      border-color: Highlight;
    }
  }
`;
