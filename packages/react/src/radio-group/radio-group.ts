import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuRadioGroup as VuRadioGroupElement,
  VuRadioGroupChangeDetail,
  VuRadioGroupValidationErrorDetail,
} from "@velkin/ui/radio-group";

export const VuRadioGroup = createComponent({
  displayName: "RadioGroup",
  react: React,
  tagName: "vu-radio-group",
  elementClass: VuRadioGroupElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuRadioGroupChangeDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent<VuRadioGroupValidationErrorDetail>>,
  },
});
export type * from "@velkin/ui/radio-group";
