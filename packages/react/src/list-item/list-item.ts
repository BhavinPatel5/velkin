import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuListitem as VuListitemElement, VuListitemActivateDetail } from "@velkin/ui/list-item";

export const VuListitem = createComponent({
  displayName: "ListItem",
  react: React,
  tagName: "vu-listitem",
  elementClass: VuListitemElement,
  events: {
    onVuActivate: "vu-activate" as EventName<CustomEvent<VuListitemActivateDetail>>,
  },
});
export type * from "@velkin/ui/list-item";
