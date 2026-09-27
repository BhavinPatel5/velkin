import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuAccordion as VuAccordionElement,
  VuAccordionItemOpenChangeDetail,
} from "@velkin/ui/accordion";

export const VuAccordion = createComponent({
  displayName: "Accordion",
  react: React,
  tagName: "vu-accordion",
  elementClass: VuAccordionElement,
  events: {
    onVuOpenChange: "vu-open-change" as EventName<CustomEvent<VuAccordionItemOpenChangeDetail>>,
  },
});
export type * from "@velkin/ui/accordion";
