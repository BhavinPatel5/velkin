import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuPopover as VuPopoverElement, VuPopoverOpenChangeDetail } from "@velkin/ui/popover";

export const VuPopover = createComponent({
  displayName: "Popover",
  react: React,
  tagName: "vu-popover",
  elementClass: VuPopoverElement,
  events: {
    onVuOpen: "vu-open" as EventName<CustomEvent<void>>,
    onVuClose: "vu-close" as EventName<CustomEvent<void>>,
    onVuOpenChange: "vu-open-change" as EventName<CustomEvent<VuPopoverOpenChangeDetail>>,
  },
});
export type * from "@velkin/ui/popover";
