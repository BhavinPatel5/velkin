import type { VuStepNormalizedItem, VuStepsLayout } from "../steps.types.js";
import { stepCanJump } from "./steps-nav.js";

/** Keyboard surface the steps key handler coordinates. */
export type StepsKeyboardHost = {
  layout: VuStepsLayout;
  activeStep: number;
  items: VuStepNormalizedItem[];
  allowStepJump: boolean;
  lastCompletedStep: number;
  readonly: boolean;
  setCurrentStep(step: number, focus: boolean): void;
};

/** Handles arrow / Home / End navigation on the step list. */
export function onStepsKeydown(host: StepsKeyboardHost, event: KeyboardEvent): void {
  if (host.readonly) return;
  const count = host.items.length;
  if (!count) return;

  const horizontal = host.layout === "horizontal";
  let next = host.activeStep;
  const key = event.key;

  if ((horizontal && key === "ArrowRight") || (!horizontal && key === "ArrowDown")) {
    next++;
  } else if ((horizontal && key === "ArrowLeft") || (!horizontal && key === "ArrowUp")) {
    next--;
  } else if (key === "Home") {
    next = 1;
  } else if (key === "End") {
    next = count;
  } else {
    return;
  }

  event.preventDefault();
  next = Math.min(Math.max(1, next), count);
  const target = host.items[next - 1];
  if (target?.disabled) return;
  if (!stepCanJump(next, host.activeStep, host.allowStepJump, host.lastCompletedStep, count))
    return;
  host.setCurrentStep(next, true);
}
