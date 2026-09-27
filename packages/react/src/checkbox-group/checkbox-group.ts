import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuCheckboxGroup as VuCheckboxGroupElement,
  VuCheckboxGroupChangeDetail,
  VuCheckboxGroupValidationErrorDetail,
} from "@velkin/ui/checkbox-group";

export const VuCheckboxGroup = createComponent({
  displayName: "CheckboxGroup",
  react: React,
  tagName: "vu-checkbox-group",
  elementClass: VuCheckboxGroupElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuCheckboxGroupChangeDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent<VuCheckboxGroupValidationErrorDetail>>,
  },
});
export type * from "@velkin/ui/checkbox-group";
