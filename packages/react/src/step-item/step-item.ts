import * as React from "react";
import { createComponent } from "@lit/react";
import { VuStepItem as VuStepItemElement } from "@velkin/ui/step-item";

export const VuStepItem = createComponent({
  displayName: "StepItem",
  react: React,
  tagName: "vu-step-item",
  elementClass: VuStepItemElement,
  events: {},
});
export type * from "@velkin/ui/step-item";
