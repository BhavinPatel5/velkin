import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuNavPanel as VuNavPanelElement,
  VuNavPanelChangeDetail,
  VuNavPanelCollapseChangeDetail,
} from "@velkin/ui/nav-panel";

export const VuNavPanel = createComponent({
  displayName: "NavPanel",
  react: React,
  tagName: "vu-nav-panel",
  elementClass: VuNavPanelElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuNavPanelChangeDetail>>,
    onVuCollapseChange: "vu-collapse-change" as EventName<
      CustomEvent<VuNavPanelCollapseChangeDetail>
    >,
  },
});
export type * from "@velkin/ui/nav-panel";
