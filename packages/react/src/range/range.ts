import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuRange as VuRangeElement,
  VuRangeChangeDetail,
  VuRangeClearDetail,
  VuRangeInvalidDetail,
} from "@velkin/ui/range";

export const VuRange = createComponent({
  displayName: "Range",
  react: React,
  tagName: "vu-range",
  elementClass: VuRangeElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuRangeChangeDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent<VuRangeInvalidDetail>>,
    onVuClear: "vu-clear" as EventName<CustomEvent<VuRangeClearDetail>>,
  },
});
export type * from "@velkin/ui/range";
