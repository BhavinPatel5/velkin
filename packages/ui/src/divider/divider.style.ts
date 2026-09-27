import { css } from "lit";

export const dividerStyles = css`
  :host {
    /* flow-root keeps --divider-margin on the host (avoids hr margin collapse). */
    display: flow-root;
    box-sizing: border-box;
    border: 0;
    padding: 0;
    margin: var(--divider-margin);

    --divider-color: var(--vu-color-separator);
    --divider-thickness: var(--vu-border-width);
    --divider-margin: 0;
    --divider-length: 100%;
    --divider-inset: var(--vu-space-5);
  }

  :host([size="sm"]) {
    --divider-thickness: max(0.5px, calc(var(--vu-border-width) / 2));
  }

  :host([size="md"]) {
    --divider-thickness: var(--vu-border-width);
  }

  :host([size="lg"]) {
    --divider-thickness: var(--vu-border-width-emphasis);
  }

  :host([direction="vertical"]) {
    display: inline-flex;
    align-self: stretch;
    block-size: var(--divider-length);
    min-block-size: var(--vu-space-8);
    inline-size: auto;
  }

  [part="divider"] {
    box-sizing: border-box;
    border: 0;
    margin: 0;
    padding: 0;
    flex-shrink: 0;
    color: inherit;
    background: transparent;
  }

  :host(:not([direction="vertical"])) [part="divider"] {
    inline-size: 100%;
    block-size: 0;
    border-block-start: var(--divider-thickness) solid var(--divider-color);
  }

  :host([direction="vertical"]) [part="divider"] {
    inline-size: 0;
    block-size: 100%;
    border-inline-start: var(--divider-thickness) solid var(--divider-color);
  }

  /* Inset indents the line without overriding host block/inline margin. */
  :host([inset]:not([direction="vertical"])) {
    padding-inline: var(--divider-inset);
  }

  :host([inset][direction="vertical"]) {
    padding-block: var(--divider-inset);
  }

  :host([inset][direction="vertical"]) [part="divider"] {
    block-size: 100%;
  }

  @media (prefers-contrast: more) {
    :host {
      --divider-color: var(--vu-color-foreground);
    }

    :host([size="sm"]) {
      --divider-thickness: var(--vu-border-width);
    }
  }

  @media (forced-colors: active) {
    :host {
      forced-color-adjust: none;
      --divider-color: CanvasText;
    }
  }
`;
