import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuAccordionItem as VuAccordionItemElement,
  VuAccordionItemOpenChangeDetail,
} from "@velkin/ui/accordion-item";

export const VuAccordionItem = createComponent({
  displayName: "AccordionItem",
  react: React,
  tagName: "vu-accordion-item",
  elementClass: VuAccordionItemElement,
  events: {
    onVuOpenChange: "vu-open-change" as EventName<CustomEvent<VuAccordionItemOpenChangeDetail>>,
  },
});
export type * from "@velkin/ui/accordion-item";
