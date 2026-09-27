import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuTab as VuTabElement, VuTabChangeDetail } from "@velkin/ui/tab";

export const VuTab = createComponent({
  displayName: "Tab",
  react: React,
  tagName: "vu-tab",
  elementClass: VuTabElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuTabChangeDetail>>,
  },
});
export type * from "@velkin/ui/tab";
