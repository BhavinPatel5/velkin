import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuRadio as VuRadioElement,
  VuRadioChangeDetail,
  VuRadioValidationErrorDetail,
  VuRadioValueClearedDetail,
} from "@velkin/ui/radio";

export const VuRadio = createComponent({
  displayName: "Radio",
  react: React,
  tagName: "vu-radio",
  elementClass: VuRadioElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuRadioChangeDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent<VuRadioValidationErrorDetail>>,
    onVuClear: "vu-clear" as EventName<CustomEvent<VuRadioValueClearedDetail>>,
  },
});
export type * from "@velkin/ui/radio";
