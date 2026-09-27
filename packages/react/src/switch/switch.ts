import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuSwitch as VuSwitchElement,
  VuSwitchChangeDetail,
  VuSwitchValidationErrorDetail,
  VuSwitchValueClearedDetail,
} from "@velkin/ui/switch";

export const VuSwitch = createComponent({
  displayName: "Switch",
  react: React,
  tagName: "vu-switch",
  elementClass: VuSwitchElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuSwitchChangeDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent<VuSwitchValidationErrorDetail>>,
    onVuClear: "vu-clear" as EventName<CustomEvent<VuSwitchValueClearedDetail>>,
  },
});
export type * from "@velkin/ui/switch";
