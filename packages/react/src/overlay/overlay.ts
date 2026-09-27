import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuOverlay as VuOverlayElement, VuOverlayCloseDetail } from "@velkin/ui/overlay";

export const VuOverlay = createComponent({
  displayName: "Overlay",
  react: React,
  tagName: "vu-overlay",
  elementClass: VuOverlayElement,
  events: {
    onVuOpen: "vu-open" as EventName<CustomEvent<void>>,
    onVuAfteropen: "vu-afteropen" as EventName<CustomEvent<void>>,
    onVuClose: "vu-close" as EventName<CustomEvent<VuOverlayCloseDetail>>,
    onVuAfterclose: "vu-afterclose" as EventName<CustomEvent<void>>,
  },
});
export type * from "@velkin/ui/overlay";
