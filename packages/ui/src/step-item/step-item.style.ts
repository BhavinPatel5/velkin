import { css } from "lit";
import { stepsSharedStyles } from "../steps/steps.style.js";
import {
  stepsVerticalPanelBorderStyles,
  stepsVerticalPanelStyles,
  stepsVerticalRailStyles,
} from "../steps/steps.vertical.style.js";

export const stepItemStyles = css`
  :host {
    display: block;
    color: inherit;
    font: inherit;
  }

  ${stepsSharedStyles}

  :host-context(vu-steps[layout="horizontal"]) {
    display: inline-flex;
    align-items: center;
    vertical-align: top;
    gap: var(--vu-space-3);
    min-inline-size: 0;
  }

  :host-context(vu-steps[layout="horizontal"][labelplacement="below"]) {
    align-items: flex-start;
  }

  :host-context(vu-steps[layout="horizontal"][compact]) {
    gap: var(--vu-space-2);
  }

  :host-context(vu-steps[layout="horizontal"][compact]) .connector {
    flex-basis: var(--vu-space-4);
    min-inline-size: var(--vu-space-4);
  }

  :host-context(vu-steps[layout="vertical"]) {
    display: block;
    width: 100%;
    position: relative;
    overflow: visible;
    margin-bottom: var(--vu-space-3);
    ${stepsVerticalPanelStyles}
    ${stepsVerticalPanelBorderStyles(":host")}
    ${stepsVerticalRailStyles(":host")}
  }

  :host-context(vu-steps[layout="vertical"]) .v-header {
    position: relative;
  }

  :host-context(vu-steps[layout="vertical"]) .step-btn {
    align-items: flex-start;
  }

  :host-context(vu-steps[layout="vertical"]:last-of-type) {
    margin-bottom: 0;
  }
`;
