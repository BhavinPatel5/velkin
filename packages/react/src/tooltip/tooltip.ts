import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuTooltip as VuTooltipElement, VuTooltipOpenChangeDetail } from "@velkin/ui/tooltip";

export const VuTooltip = createComponent({
  displayName: "Tooltip",
  react: React,
  tagName: "vu-tooltip",
  elementClass: VuTooltipElement,
  events: {
    onVuOpen: "vu-open" as EventName<CustomEvent<void>>,
    onVuClose: "vu-close" as EventName<CustomEvent<void>>,
    onVuOpenChange: "vu-open-change" as EventName<CustomEvent<VuTooltipOpenChangeDetail>>,
  },
});
export type * from "@velkin/ui/tooltip";
