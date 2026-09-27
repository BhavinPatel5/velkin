import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuDialog as VuDialogElement, VuDialogCloseDetail } from "@velkin/ui/dialog";

export const VuDialog = createComponent({
  displayName: "Dialog",
  react: React,
  tagName: "vu-dialog",
  elementClass: VuDialogElement,
  events: {
    onVuClose: "vu-close" as EventName<CustomEvent<VuDialogCloseDetail>>,
    onVuOpen: "vu-open" as EventName<CustomEvent<void>>,
    onVuAfteropen: "vu-afteropen" as EventName<CustomEvent<void>>,
    onVuAfterclose: "vu-afterclose" as EventName<CustomEvent<void>>,
  },
});
export type * from "@velkin/ui/dialog";
