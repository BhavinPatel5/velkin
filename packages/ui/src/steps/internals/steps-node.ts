import { html, type TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";
import { ICONS } from "../../internals/icon.js";
import type { VuStepStatus, VuStepsLabelPlacement } from "../steps.types.js";

/** Resolves which node inner variant to show. */
export function stepNodeShowClass(options: {
  status: VuStepStatus;
  hideNumbers: boolean;
  hasCheckedIcon: boolean;
  hasRegularIcon: boolean;
}): string {
  const { status, hideNumbers, hasCheckedIcon, hasRegularIcon } = options;
  if (status === "error") return hasCheckedIcon ? "show-checked-icon" : "show-error-icon";
  if (status === "finish") {
    if (hasCheckedIcon) return "show-checked-icon";
    if (hasRegularIcon) return "show-regular-icon";
    return hideNumbers ? "show-bullet" : "show-number";
  }
  if (hasRegularIcon && status !== "wait") return "show-regular-icon";
  if (hideNumbers || status === "wait") return "show-bullet";
  return "show-number";
}

/** Renders the circular step indicator. */
export function renderStepNode(options: {
  index1: number;
  status: VuStepStatus;
  hideNumbers: boolean;
  icon?: string;
  checkedIcon?: string;
  errorIcon?: string;
  stepIconDefault?: string;
  checkedIconDefault?: string;
  iconTag: (icon: string) => TemplateResult;
}): TemplateResult {
  const stepIcon = options.icon ?? options.stepIconDefault;
  const checkedIcon = options.checkedIcon ?? options.checkedIconDefault;
  const errorIcon = options.errorIcon ?? ICONS.stepError;
  const hasChecked = Boolean(checkedIcon);
  const hasRegular = Boolean(stepIcon);

  const showClass = stepNodeShowClass({
    status: options.status,
    hideNumbers: options.hideNumbers,
    hasCheckedIcon: hasChecked,
    hasRegularIcon: hasRegular,
  });

  const inner =
    options.status === "error"
      ? html`<span class="icon error-icon" aria-hidden="true">${options.iconTag(errorIcon)}</span>`
      : options.status === "finish" && checkedIcon
        ? html`<span class="icon checked-icon" aria-hidden="true"
            >${options.iconTag(checkedIcon)}</span
          >`
        : stepIcon && options.status !== "wait"
          ? html`<span class="icon regular-icon" aria-hidden="true"
              >${options.iconTag(stepIcon)}</span
            >`
          : options.hideNumbers || options.status === "wait"
            ? html`<span class="bullet index" aria-hidden="true">•</span>`
            : html`<span class="number index" aria-hidden="true">${options.index1}</span>`;

  return html`<span
    class=${classMap({
      node: true,
      completed: options.status === "finish",
      error: options.status === "error",
      process: options.status === "process",
      wait: options.status === "wait",
      [showClass]: true,
    })}
    part="node"
    >${inner}</span
  >`;
}

/** Renders label + optional subtitle / optional hint stack. */
export function renderStepLabels(
  label: string,
  options?: {
    subtitle?: string;
    optional?: boolean;
    optionalLabel?: string;
    labelPlacement?: VuStepsLabelPlacement;
  },
): TemplateResult | null {
  const placement = options?.labelPlacement ?? "inline";
  const optionalLabel = options?.optionalLabel ?? "Optional";
  return html`<span
    class=${classMap({ labels: true, "labels-below": placement === "below" })}
    part="labels"
  >
    <span class="label">${label}</span>
    ${when(options?.subtitle, () => html`<span class="sub">${options!.subtitle}</span>`)}
    ${when(options?.optional, () => html`<span class="optional">${optionalLabel}</span>`)}
  </span>`;
}
