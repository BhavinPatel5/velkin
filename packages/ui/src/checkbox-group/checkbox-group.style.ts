import { css } from "lit";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const checkboxGroupStyles = css`
  ${fieldValidationStyles}
  ${controlSizeMetricsTokens}

  :host {
    display: block;
    box-sizing: border-box;
    font-family: var(--vu-font-sans);
    font-size: var(--vu-csm-field-font-size);
  }

  .checkbox-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-inline-size: 0;
  }

  :host([compact]) .checkbox-hint,
  :host([compact]) .error-message {
    margin-block-start: 2px;
  }

  .cbg-label {
    text-align: start;
    color: var(--vu-color-foreground);
    font-size: var(--vu-csm-field-font-size);
    font-weight: var(--vu-font-weight-semibold);
    line-height: var(--vu-line-height-snug);
    margin-block-end: var(--vu-space-half);
  }

  .cbg-label-text {
    font-weight: var(--vu-font-weight-semibold);
  }

  ::slotted(*) {
    font-size: inherit;
    line-height: var(--vu-line-height-snug);
  }

  [part="base"] {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--vu-space-2);
    min-inline-size: 0;
  }

  :host([orientation="horizontal"]) [part="base"] {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  [part="legend"] {
    font-size: var(--vu-csm-field-font-size);
    font-weight: var(--vu-font-weight-medium);
    color: var(--vu-color-muted);
    line-height: var(--vu-line-height-snug);
    padding: 0;
    margin: 0;
  }

  [part="fields"] {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--vu-space-2);
    min-inline-size: 0;
  }

  :host([orientation="horizontal"]) [part="fields"] {
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: var(--vu-space-4);
    row-gap: var(--vu-space-2);
    align-items: center;
  }

  ::slotted(vu-checkbox) {
    min-inline-size: 0;
  }

  .checkbox-hint {
    font-size: var(--vu-font-size-xs);
    line-height: var(--vu-line-height-normal);
    color: var(--vu-color-muted);
    white-space: normal;
    pointer-events: none;
    margin-inline-start: 0;
    margin-block-start: var(--vu-space-half);
    inline-size: 100%;
    max-inline-size: 100%;
    text-align: start;
    font-family: var(--vu-font-sans);
  }

  .error-message {
    font-size: var(--vu-font-size-xs);
    line-height: var(--vu-line-height-normal);
    color: var(--vu-color-danger);
    white-space: normal;
    pointer-events: none;
    margin-inline-start: 0;
    margin-block-start: var(--vu-space-half);
    inline-size: 100%;
    max-inline-size: 100%;
    text-align: start;
    font-family: var(--vu-font-sans);
  }

  .cbg-label[aria-hidden="true"],
  [part="legend"][aria-hidden="true"] {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    :host,
    [part="base"],
    [part="fields"] {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    .cbg-label {
      font-weight: var(--vu-font-weight-bold);
    }
    .error-message {
      font-weight: var(--vu-font-weight-semibold);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) ::slotted(vu-checkbox) {
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    .error-message {
      color: LinkText;
    }
  }
`;
