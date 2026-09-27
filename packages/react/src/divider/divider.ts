import * as React from "react";
import { createComponent } from "@lit/react";
import { VuDivider as VuDividerElement } from "@velkin/ui/divider";

export const VuDivider = createComponent({
  displayName: "Divider",
  react: React,
  tagName: "vu-divider",
  elementClass: VuDividerElement,
  events: {},
});
export type * from "@velkin/ui/divider";
