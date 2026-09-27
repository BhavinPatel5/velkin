import * as React from "react";
import { createComponent } from "@lit/react";
import { VuSpinner as VuSpinnerElement } from "@velkin/ui/spinner";

export const VuSpinner = createComponent({
  displayName: "Spinner",
  react: React,
  tagName: "vu-spinner",
  elementClass: VuSpinnerElement,
  events: {},
});
export type * from "@velkin/ui/spinner";
