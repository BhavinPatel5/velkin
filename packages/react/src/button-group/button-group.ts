import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuButtonGroup as VuButtonGroupElement,
  VuButtonGroupChangeDetail,
} from "@velkin/ui/button-group";

export const VuButtonGroup = createComponent({
  displayName: "ButtonGroup",
  react: React,
  tagName: "vu-button-group",
  elementClass: VuButtonGroupElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuButtonGroupChangeDetail>>,
  },
});
export type * from "@velkin/ui/button-group";
