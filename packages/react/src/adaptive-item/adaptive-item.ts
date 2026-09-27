import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuAdaptiveItem as VuAdaptiveItemElement,
  VuAdaptiveItemSizeDetail,
} from "@velkin/ui/adaptive-item";

export const VuAdaptiveItem = createComponent({
  displayName: "AdaptiveItem",
  react: React,
  tagName: "vu-adaptive-item",
  elementClass: VuAdaptiveItemElement,
  events: {
    onVuResize: "vu-resize" as EventName<CustomEvent<VuAdaptiveItemSizeDetail>>,
  },
});
export type * from "@velkin/ui/adaptive-item";
