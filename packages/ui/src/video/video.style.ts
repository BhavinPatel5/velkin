import { css } from "lit";

export const videoStyles = css`
  :host {
    display: block;
    box-sizing: border-box;
    max-inline-size: 100%;
    overflow: hidden;
    font-family: var(--vu-font-sans);
    color: #fff;
    -webkit-font-smoothing: antialiased;
  }
  :host(:fullscreen),
  :host(:-webkit-full-screen) {
    inline-size: 100%;
    block-size: 100%;
    max-inline-size: none;
  }

  :host([fit="cover"]) {
    --video-object-fit: cover;
  }

  :host([fit="contain"]) {
    --video-object-fit: contain;
  }

  :host([fit="fill"]) {
    --video-object-fit: fill;
  }

  :host([fit="none"]) {
    --video-object-fit: none;
  }

  [part="base"] {
    position: relative;
    inline-size: 100%;
    block-size: 100%;
    background: #000;
    overflow: hidden;
  }

  [part="video"] {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    object-fit: var(--video-object-fit, cover);
    object-position: center;
    background: inherit;
  }

  [part="controls"] {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-rows: auto 1fr auto;
    pointer-events: none;
    opacity: 0;
    overflow: visible;
    transition: opacity var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  [part="controls"][data-visible] {
    opacity: 1;
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    [part="controls"] {
      transition: none;
    }
  }

  [part="top-bar"] {
    position: relative;
    z-index: 3;
    display: flex;
    justify-content: flex-end;
    gap: var(--vu-space-2);
    padding: var(--vu-space-3);
    overflow: visible;
    background: linear-gradient(to bottom, rgb(0 0 0 / 0.45), transparent);
  }

  [part="volume-shell"] {
    position: relative;
    z-index: 4;
    inline-size: 2rem;
  }

  [part="mute"],
  [part="fullscreen"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 2rem;
    block-size: 2rem;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: rgb(255 255 255 / 0.18);
    backdrop-filter: blur(var(--vu-blur-md));
    -webkit-backdrop-filter: blur(var(--vu-blur-md));
    color: inherit;
    cursor: pointer;
    flex-shrink: 0;
  }

  [part="volume-popover"] {
    position: absolute;
    inset-block-start: calc(100% + var(--vu-space-2));
    inset-inline-start: 50%;
    inset-inline-end: auto;
    z-index: 5;
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: transparent;
    box-shadow: none;
    pointer-events: auto;
    transform: translateX(-50%);
  }

  [part="volume-popover"][data-open] {
    display: flex;
  }

  [part="volume-rail"] {
    position: relative;
    display: block;
    inline-size: 1.25rem;
    block-size: 5.5rem;
    overflow: visible;
  }

  [part="volume-rail"]::before {
    content: "";
    position: absolute;
    inset-block: 0;
    inset-inline: 0;
    inline-size: 4px;
    margin-inline: auto;
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: rgb(255 255 255 / 0.32);
    pointer-events: none;
  }

  [part="volume-rail"]::after {
    content: "";
    position: absolute;
    inset-block-end: 0;
    inset-inline: 0;
    inline-size: 4px;
    block-size: var(--video-volume, 100%);
    max-block-size: 100%;
    margin-inline: auto;
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: #fff;
    pointer-events: none;
  }

  [part="volume"] {
    -webkit-appearance: none;
    appearance: none;
    position: absolute;
    inset-inline-start: 50%;
    inset-block-start: 50%;
    inline-size: 5.5rem;
    block-size: 1.25rem;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    opacity: 0.001;
    transform: translate(-50%, -50%) rotate(-90deg);
    --video-range-track: 4px;
    --video-range-thumb: 12px;
  }

  [part="volume"]:focus-visible {
    opacity: 1;
  }

  [part="volume"]::-webkit-slider-runnable-track {
    block-size: var(--video-range-track);
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: transparent;
  }

  [part="volume"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    inline-size: var(--video-range-thumb);
    block-size: var(--video-range-thumb);
    margin-block-start: calc((var(--video-range-track) - var(--video-range-thumb)) / 2);
    border: 0;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.35);
    cursor: pointer;
  }

  [part="volume"]:focus-visible::-webkit-slider-thumb,
  [part="volume"]:active::-webkit-slider-thumb {
    transform: scale(1.15);
  }

  [part="volume"]::-moz-range-track {
    block-size: var(--video-range-track);
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: transparent;
  }

  [part="volume"]::-moz-range-progress {
    block-size: var(--video-range-track);
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: transparent;
  }

  [part="volume"]::-moz-range-thumb {
    inline-size: var(--video-range-thumb);
    block-size: var(--video-range-thumb);
    border: 0;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.35);
    cursor: pointer;
  }

  @media (hover: hover) {
    [part="mute"]:hover,
    [part="fullscreen"]:hover {
      background: rgb(255 255 255 / 0.28);
    }
  }

  [part="mute"]:focus-visible,
  [part="fullscreen"]:focus-visible,
  [part="play"]:focus-visible,
  [part="seek"]:focus-visible,
  [part="volume"]:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  [part="mute"] vu-icon,
  [part="fullscreen"] vu-icon {
    inline-size: 1rem;
    block-size: 1rem;
  }

  [part="play"] {
    place-self: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 3.25rem;
    block-size: 3.25rem;
    padding: 0;
    margin: 0;
    border: 0;
    border-radius: 50%;
    background: rgb(255 255 255 / 0.22);
    backdrop-filter: blur(var(--vu-blur-lg));
    -webkit-backdrop-filter: blur(var(--vu-blur-lg));
    box-shadow: 0 0 0 1px rgb(255 255 255 / 0.12);
    color: inherit;
    cursor: pointer;
  }

  @media (hover: hover) {
    [part="play"]:hover {
      background: rgb(255 255 255 / 0.32);
    }
  }

  [part="play"] vu-icon {
    inline-size: 2rem;
    block-size: 2rem;
  }

  [part="bottom-bar"] {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--vu-space-2);
    padding: var(--vu-space-2) var(--vu-space-3) var(--vu-space-3);
    background: linear-gradient(to top, rgb(0 0 0 / 0.55), transparent);
  }

  [part="time-current"],
  [part="time-remaining"] {
    font-size: 0.6875rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    white-space: nowrap;
    user-select: none;
    opacity: 0.92;
    min-inline-size: 2.25rem;
  }

  [part="time-current"] {
    text-align: start;
  }

  [part="time-remaining"] {
    text-align: end;
  }

  [part="seek"] {
    -webkit-appearance: none;
    appearance: none;
    inline-size: 100%;
    block-size: 1.75rem;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    --video-range-track: 3px;
    --video-range-thumb: 11px;
  }

  [part="seek"]::-webkit-slider-runnable-track {
    block-size: var(--video-range-track);
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: linear-gradient(
      to right,
      #fff 0 var(--video-progress, 0%),
      rgb(255 255 255 / 0.35) var(--video-progress, 0%) 100%
    );
  }

  [part="seek"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    inline-size: var(--video-range-thumb);
    block-size: var(--video-range-thumb);
    margin-block-start: calc((var(--video-range-track) - var(--video-range-thumb)) / 2);
    border: 0;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.35);
    cursor: pointer;
    transition: transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  [part="seek"]:active::-webkit-slider-thumb {
    transform: scale(1.2);
  }

  [part="seek"]::-moz-range-track {
    block-size: var(--video-range-track);
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: rgb(255 255 255 / 0.35);
  }

  [part="seek"]::-moz-range-progress {
    block-size: var(--video-range-track);
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: #fff;
  }

  [part="seek"]::-moz-range-thumb {
    inline-size: var(--video-range-thumb);
    block-size: var(--video-range-thumb);
    border: 0;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.35);
    cursor: pointer;
  }

  @media (prefers-contrast: more) {
    [part="seek"]::-webkit-slider-thumb,
    [part="seek"]::-moz-range-thumb {
      border: var(--vu-border-width-emphasis) solid CanvasText;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    [part="time-current"],
    [part="time-remaining"] {
      opacity: 1;
    }

    [part="top-bar"] {
      background: rgb(0 0 0);
    }

    [part="bottom-bar"] {
      background: rgb(0 0 0);
    }
  }

  @media (forced-colors: active) {
    [part="seek"]::-webkit-slider-thumb,
    [part="seek"]::-moz-range-thumb {
      border: var(--vu-border-width-emphasis) solid CanvasText;
      background: ButtonFace;
      box-shadow: none;
    }

    [part="seek"]::-webkit-slider-runnable-track,
    [part="seek"]::-moz-range-track {
      background: Canvas;
      border: var(--vu-border-width) solid CanvasText;
    }
  }
`;
