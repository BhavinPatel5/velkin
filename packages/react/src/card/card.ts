import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuCard as VuCardElement, VuCardActivateDetail } from "@velkin/ui/card";

export const VuCard = createComponent({
  displayName: "Card",
  react: React,
  tagName: "vu-card",
  elementClass: VuCardElement,
  events: {
    onVuActivate: "vu-activate" as EventName<CustomEvent<VuCardActivateDetail>>,
  },
});
export type * from "@velkin/ui/card";
