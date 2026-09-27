import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuAdaptiveBar as VuAdaptiveBarElement,
  VuAdaptiveBarOpenChangeDetail,
} from "@velkin/ui/adaptive-bar";

export const VuAdaptiveBar = createComponent({
  displayName: "AdaptiveBar",
  react: React,
  tagName: "vu-adaptive-bar",
  elementClass: VuAdaptiveBarElement,
  events: {
    onVuOpenChange: "vu-open-change" as EventName<CustomEvent<VuAdaptiveBarOpenChangeDetail>>,
  },
});
export type * from "@velkin/ui/adaptive-bar";
