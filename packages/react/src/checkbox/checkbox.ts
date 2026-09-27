import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuCheckbox as VuCheckboxElement,
  VuCheckboxChangeDetail,
  VuCheckboxValidationErrorDetail,
  VuCheckboxValueClearedDetail,
} from "@velkin/ui/checkbox";

export const VuCheckbox = createComponent({
  displayName: "Checkbox",
  react: React,
  tagName: "vu-checkbox",
  elementClass: VuCheckboxElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuCheckboxChangeDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent<VuCheckboxValidationErrorDetail>>,
    onVuClear: "vu-clear" as EventName<CustomEvent<VuCheckboxValueClearedDetail>>,
  },
});
export type * from "@velkin/ui/checkbox";
