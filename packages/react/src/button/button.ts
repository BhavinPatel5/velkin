import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuButton as VuButtonElement } from "@velkin/ui/button";

export const VuButton = createComponent({
  displayName: "Button",
  react: React,
  tagName: "vu-button",
  elementClass: VuButtonElement,
  events: {
    onClick: "click" as EventName<MouseEvent>,
  },
});
export type * from "@velkin/ui/button";
