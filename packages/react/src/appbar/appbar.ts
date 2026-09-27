import * as React from "react";
import { createComponent } from "@lit/react";
import { VuAppbar as VuAppbarElement } from "@velkin/ui/appbar";

export const VuAppbar = createComponent({
  displayName: "Appbar",
  react: React,
  tagName: "vu-appbar",
  elementClass: VuAppbarElement,
  events: {},
});
export type * from "@velkin/ui/appbar";
