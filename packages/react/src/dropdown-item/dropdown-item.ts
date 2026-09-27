import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuDropdownItem as VuDropdownItemElement,
  VuDropdownItemSelectDetail,
} from "@velkin/ui/dropdown-item";

export const VuDropdownItem = createComponent({
  displayName: "DropdownItem",
  react: React,
  tagName: "vu-dropdown-item",
  elementClass: VuDropdownItemElement,
  events: {
    onVuSelect: "vu-select" as EventName<CustomEvent<VuDropdownItemSelectDetail>>,
  },
});
export type * from "@velkin/ui/dropdown-item";
