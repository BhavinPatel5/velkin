import * as React from "react";
import { createComponent } from "@lit/react";
import { VuTabItem as VuTabItemElement } from "@velkin/ui/tab-item";

export const VuTabItem = createComponent({
  displayName: "TabItem",
  react: React,
  tagName: "vu-tab-item",
  elementClass: VuTabItemElement,
  events: {},
});
export type * from "@velkin/ui/tab-item";
