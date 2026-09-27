import type { VuStepNormalizedItem, VuStepStatus } from "../steps.types.js";

/** Coerces `steps` prop entries into a stable normalized list. */
export function normalizeStepItems(
  steps:
    | {
        label: string;
        subtitle?: string;
        disabled?: boolean;
        optional?: boolean;
        icon?: string;
        checkedIcon?: string;
        status?: VuStepStatus;
      }[]
    | undefined,
): VuStepNormalizedItem[] {
  return (steps ?? []).map((entry) => ({
    label: entry.label,
    subtitle: entry.subtitle,
    disabled: Boolean(entry.disabled),
    optional: Boolean(entry.optional),
    icon: entry.icon,
    checkedIcon: entry.checkedIcon,
    status: entry.status,
  }));
}

/** Effective furthest completed step (1-based). */
export function stepsEffectiveLastCompleted(
  lastCompletedStep: number,
  currentStep: number,
  completedSteps: number[] | null,
): number {
  if (lastCompletedStep > 0) return lastCompletedStep;
  if (completedSteps?.length) {
    return Math.max(...completedSteps);
  }
  return Math.max(0, currentStep - 1);
}

/** True when the step index (1-based) is completed. */
export function stepIsCompleted(
  index1: number,
  currentStep: number,
  completedSteps: number[] | null,
  lastCompletedStep: number,
): boolean {
  if (completedSteps) return completedSteps.includes(index1);
  const last = stepsEffectiveLastCompleted(lastCompletedStep, currentStep, null);
  if (last > 0) return index1 <= last;
  return index1 < currentStep;
}

/** Resolves visual status for a step. */
export function resolveStepStatus(
  index1: number,
  currentStep: number,
  item: VuStepNormalizedItem,
  completedSteps: number[] | null,
  lastCompletedStep: number,
): VuStepStatus {
  if (item.status) return item.status;
  if (index1 === currentStep) return "process";
  if (stepIsCompleted(index1, currentStep, completedSteps, lastCompletedStep)) {
    return "finish";
  }
  return "wait";
}

/** True when navigation to `toIndex1` is allowed from `currentStep`. */
export function stepCanJump(
  toIndex1: number,
  currentStep: number,
  allowStepJump: boolean,
  lastCompletedStep: number,
  _stepCount: number,
): boolean {
  if (toIndex1 === currentStep) return true;
  if (allowStepJump) return true;

  const adjacent = Math.abs(toIndex1 - currentStep) === 1;
  if (!adjacent) return false;

  const last = stepsEffectiveLastCompleted(lastCompletedStep, currentStep, null);
  if (toIndex1 > currentStep && last > 0 && toIndex1 > last + 1) {
    return false;
  }
  if (toIndex1 > currentStep && last === 0 && !allowStepJump) {
    return toIndex1 === currentStep + 1;
  }
  return adjacent;
}

/** Previous enabled step (1-based), or null. */
export function stepPrevIndex(
  items: VuStepNormalizedItem[],
  currentStep: number,
  allowStepJump: boolean,
): number | null {
  const want = currentStep - 1;
  if (!allowStepJump) {
    if (want >= 1 && !items[want - 1]?.disabled) return want;
    return null;
  }
  for (let i = want; i >= 1; i--) {
    if (!items[i - 1]?.disabled) return i;
  }
  return null;
}

/** Next enabled step (1-based), or null. */
export function stepNextIndex(
  items: VuStepNormalizedItem[],
  currentStep: number,
  allowStepJump: boolean,
  lastCompletedStep: number,
): number | null {
  const want = currentStep + 1;
  const last = stepsEffectiveLastCompleted(lastCompletedStep, currentStep, null);

  if (!allowStepJump) {
    if (want > last + 1 && last > 0) return null;
    if (want <= items.length && !items[want - 1]?.disabled) return want;
    return null;
  }

  for (let i = want; i <= items.length; i++) {
    if (!items[i - 1]?.disabled) return i;
  }
  return null;
}

/** Clamps a 1-based step into range. */
export function clampStep(step: number, count: number): number {
  if (count <= 0) return 1;
  return Math.min(Math.max(1, Math.floor(step)), count);
}
