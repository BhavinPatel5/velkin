import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuCounter as VuCounterElement,
  VuCounterChangeDetail,
  VuCounterClearDetail,
  VuCounterInvalidDetail,
} from "@velkin/ui/counter";

export const VuCounter = createComponent({
  displayName: "Counter",
  react: React,
  tagName: "vu-counter",
  elementClass: VuCounterElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuCounterChangeDetail>>,
    onVuClear: "vu-clear" as EventName<CustomEvent<VuCounterClearDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent<VuCounterInvalidDetail>>,
  },
});
export type * from "@velkin/ui/counter";
