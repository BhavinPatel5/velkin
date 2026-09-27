import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuSpeeddial as VuSpeeddialElement,
  VuSpeeddialOpenChangeDetail,
} from "@velkin/ui/speeddial";

export const VuSpeeddial = createComponent({
  displayName: "Speeddial",
  react: React,
  tagName: "vu-speeddial",
  elementClass: VuSpeeddialElement,
  events: {
    onVuOpen: "vu-open" as EventName<CustomEvent<void>>,
    onVuClose: "vu-close" as EventName<CustomEvent<void>>,
    onVuOpenChange: "vu-open-change" as EventName<CustomEvent<VuSpeeddialOpenChangeDetail>>,
  },
});
export type * from "@velkin/ui/speeddial";
