import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuInput as VuInputElement,
  VuInputChangeDetail,
  VuInputClearDetail,
  VuInputFileDetail,
  VuInputInvalidDetail,
} from "@velkin/ui/input";

export const VuInput = createComponent({
  displayName: "Input",
  react: React,
  tagName: "vu-input",
  elementClass: VuInputElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuInputChangeDetail>>,
    onVuClear: "vu-clear" as EventName<CustomEvent<VuInputClearDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent<VuInputInvalidDetail>>,
    onVuFile: "vu-file" as EventName<CustomEvent<VuInputFileDetail>>,
  },
});
export type * from "@velkin/ui/input";
