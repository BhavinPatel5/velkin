import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuList as VuListElement, VuListChangeDetail } from "@velkin/ui/list";

export const VuList = createComponent({
  displayName: "List",
  react: React,
  tagName: "vu-list",
  elementClass: VuListElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuListChangeDetail>>,
  },
});
export type * from "@velkin/ui/list";
