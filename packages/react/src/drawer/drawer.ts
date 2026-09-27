import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuDrawer as VuDrawerElement, VuDrawerCloseDetail } from "@velkin/ui/drawer";

export const VuDrawer = createComponent({
  displayName: "Drawer",
  react: React,
  tagName: "vu-drawer",
  elementClass: VuDrawerElement,
  events: {
    onVuClose: "vu-close" as EventName<CustomEvent<VuDrawerCloseDetail>>,
    onVuOpen: "vu-open" as EventName<CustomEvent<void>>,
    onVuAfteropen: "vu-afteropen" as EventName<CustomEvent<void>>,
    onVuAfterclose: "vu-afterclose" as EventName<CustomEvent<void>>,
  },
});
export type * from "@velkin/ui/drawer";
