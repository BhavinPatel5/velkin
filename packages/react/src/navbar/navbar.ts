import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuNavbar as VuNavbarElement,
  VuNavbarItemActivateDetail,
  VuNavbarNavigateDetail,
} from "@velkin/ui/navbar";

export const VuNavbar = createComponent({
  displayName: "Navbar",
  react: React,
  tagName: "vu-navbar",
  elementClass: VuNavbarElement,
  events: {
    onVuNavigate: "vu-navigate" as EventName<CustomEvent<VuNavbarNavigateDetail>>,
    onVuActivate: "vu-activate" as EventName<CustomEvent<VuNavbarItemActivateDetail>>,
  },
});
export type * from "@velkin/ui/navbar";
