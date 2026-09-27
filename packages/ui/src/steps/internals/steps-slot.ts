import type { VuStepItem } from "../../step-item/step-item.js";
import { ICONS } from "../../internals/icon.js";
import type {
  VuStepNormalizedItem,
  VuStepsLabelPlacement,
  VuStepsLayout,
  VuStepsSize,
  VuStepsVariant,
} from "../steps.types.js";
import { resolveStepStatus, stepIsCompleted } from "./steps-nav.js";

const SLOT_MEMBER_SELECTOR = "vu-step-item";

/** True when light DOM contains `<vu-step-item>` default-slot children. */
export function hasStepSlotChildren(host: Element): boolean {
  for (const child of host.children) {
    if (child.tagName.toLowerCase() === SLOT_MEMBER_SELECTOR) return true;
  }
  return false;
}

/** Light-DOM `<vu-step-item>` children when the default slot has not assigned yet. */
function lightDomStepItems(host: Element): VuStepItem[] {
  const collection = host.children;
  if (!collection || typeof collection.length !== "number") return [];
  const members: VuStepItem[] = [];
  for (let i = 0; i < collection.length; i++) {
    const child = collection[i];
    if (child?.tagName?.toLowerCase() === SLOT_MEMBER_SELECTOR) {
      members.push(child as VuStepItem);
    }
  }
  return members;
}

/** Assigned or light-DOM slot members before first `slotchange`. */
export function resolveStepSlotMembers(
  host: Element,
  assigned: VuStepItem[] | undefined,
): VuStepItem[] {
  if (assigned && assigned.length > 0) return assigned;
  return lightDomStepItems(host);
}

/** True when slotted step children should drive the navigator. */
export function stepsUsesSlotItems(
  host: Element,
  assigned: VuStepItem[] | undefined,
): boolean {
  return resolveStepSlotMembers(host, assigned).length > 0;
}

/** Reads normalized step data from a slotted `<vu-step-item>`. */
export function stepItemFromElement(el: VuStepItem): VuStepNormalizedItem {
  return {
    label: el.label,
    subtitle: el.subtitle,
    disabled: el.disabled,
    optional: el.optional,
    icon: el.icon || undefined,
    checkedIcon: el.checkedIcon || undefined,
    status: el.status || undefined,
  };
}

/** Maps assigned slot members to the internal step list. */
export function stepsFromSlot(members: VuStepItem[]): VuStepNormalizedItem[] {
  return members.map((el) => stepItemFromElement(el));
}

/** Syncs coordinator state onto slotted `<vu-step-item>` children. */
export function syncStepSlotMembers(
  members: VuStepItem[],
  options: {
    currentStep: number;
    completedSteps: number[] | null;
    lastCompletedStep: number;
    layout: VuStepsLayout;
    hideNumbers: boolean;
    showLabels: boolean;
    labelPlacement: VuStepsLabelPlacement;
    readonly: boolean;
    expandAll?: boolean;
    size: VuStepsSize;
    variant: VuStepsVariant;
    stepIcon?: string;
    checkedIcon?: string;
    errorIcon?: string;
    items: VuStepNormalizedItem[];
  },
): void {
  const {
    currentStep,
    completedSteps,
    lastCompletedStep,
    layout,
    hideNumbers,
    showLabels,
    labelPlacement,
    readonly,
    expandAll = false,
    size,
    variant,
    stepIcon,
    checkedIcon,
    errorIcon,
    items,
  } = options;

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const index1 = i + 1;
    const item = items[i];
    member.index = index1;
    member.current = index1 === currentStep;
    member.expandAll = expandAll;
    member.completed = stepIsCompleted(
      index1,
      currentStep,
      completedSteps,
      lastCompletedStep,
    );
    member.layout = layout;
    member.hideNumbers = hideNumbers;
    member.showLabels = showLabels;
    member.labelPlacement = labelPlacement;
    member.readonly = readonly;
    member.size = size;
    member.variant = variant;
    member.stepIconDefault = stepIcon ?? "";
    member.checkedIconDefault = checkedIcon ?? "";
    member.errorIconDefault = errorIcon?.trim() || ICONS.stepError;
    member.resolvedStatus = item
      ? resolveStepStatus(index1, currentStep, item, completedSteps, lastCompletedStep)
      : "wait";

    const nextCompleted = stepIsCompleted(
      index1 + 1,
      currentStep,
      completedSteps,
      lastCompletedStep,
    );
    member.showConnector =
      variant === "default"
      && layout === "horizontal"
      && i < members.length - 1;
    member.connectorActive =
      member.completed && (nextCompleted || currentStep > index1);
  }
}

export { SLOT_MEMBER_SELECTOR };
