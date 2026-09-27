import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuAlert as VuAlertElement, VuAlertCloseDetail } from "@velkin/ui/alert";

export const VuAlert = createComponent({
  displayName: "Alert",
  react: React,
  tagName: "vu-alert",
  elementClass: VuAlertElement,
  events: {
    onVuClose: "vu-close" as EventName<CustomEvent<VuAlertCloseDetail>>,
  },
});
export type * from "@velkin/ui/alert";
