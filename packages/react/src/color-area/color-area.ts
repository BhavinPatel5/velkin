import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuColorArea as VuColorAreaElement, VuColorAreaChangeDetail } from "@velkin/ui/color-area";

export const VuColorArea = createComponent({
  displayName: "ColorArea",
  react: React,
  tagName: "vu-color-area",
  elementClass: VuColorAreaElement,
  events: {
    onVuInput: "vu-input" as EventName<CustomEvent<VuColorAreaChangeDetail>>,
    onVuChange: "vu-change" as EventName<CustomEvent<VuColorAreaChangeDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent>,
  },
});
export type * from "@velkin/ui/color-area";
