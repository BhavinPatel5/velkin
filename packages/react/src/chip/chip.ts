import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuChip as VuChipElement, VuChipChangeDetail, VuChipCloseDetail } from "@velkin/ui/chip";

export const VuChip = createComponent({
  displayName: "Chip",
  react: React,
  tagName: "vu-chip",
  elementClass: VuChipElement,
  events: {
    onVuClose: "vu-close" as EventName<CustomEvent<VuChipCloseDetail>>,
    onVuChange: "vu-change" as EventName<CustomEvent<VuChipChangeDetail>>,
  },
});
export type * from "@velkin/ui/chip";
