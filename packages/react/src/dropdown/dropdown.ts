import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuDropdown as VuDropdownElement,
  VuDropdownOpenChangeDetail,
  VuDropdownSelectDetail,
} from "@velkin/ui/dropdown";

export const VuDropdown = createComponent({
  displayName: "Dropdown",
  react: React,
  tagName: "vu-dropdown",
  elementClass: VuDropdownElement,
  events: {
    onVuOpenChange: "vu-open-change" as EventName<CustomEvent<VuDropdownOpenChangeDetail>>,
    onVuSelect: "vu-select" as EventName<CustomEvent<VuDropdownSelectDetail>>,
    onVuOpen: "vu-open" as EventName<CustomEvent<void>>,
    onVuClose: "vu-close" as EventName<CustomEvent<void>>,
  },
});
export type * from "@velkin/ui/dropdown";
