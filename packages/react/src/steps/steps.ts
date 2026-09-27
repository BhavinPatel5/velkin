import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuSteps as VuStepsElement, VuStepsChangeDetail } from "@velkin/ui/steps";

export const VuSteps = createComponent({
  displayName: "Steps",
  react: React,
  tagName: "vu-steps",
  elementClass: VuStepsElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuStepsChangeDetail>>,
  },
});
export type * from "@velkin/ui/steps";
