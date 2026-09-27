import * as React from "react";
import { createComponent } from "@lit/react";
import { VuProgress as VuProgressElement } from "@velkin/ui/progress";

export const VuProgress = createComponent({
  displayName: "Progress",
  react: React,
  tagName: "vu-progress",
  elementClass: VuProgressElement,
  events: {},
});
export type * from "@velkin/ui/progress";
