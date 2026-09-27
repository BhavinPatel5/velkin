import * as React from "react";
import { createComponent } from "@lit/react";
import { VuBadge as VuBadgeElement } from "@velkin/ui/badge";

export const VuBadge = createComponent({
  displayName: "Badge",
  react: React,
  tagName: "vu-badge",
  elementClass: VuBadgeElement,
  events: {},
});
export type * from "@velkin/ui/badge";
