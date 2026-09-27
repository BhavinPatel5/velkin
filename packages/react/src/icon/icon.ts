import * as React from "react";
import { createComponent } from "@lit/react";
import { VuIcon as VuIconElement } from "@velkin/ui/icon";

export const VuIcon = createComponent({
  displayName: "Icon",
  react: React,
  tagName: "vu-icon",
  elementClass: VuIconElement,
  events: {},
});
export type * from "@velkin/ui/icon";
