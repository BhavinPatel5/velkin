import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuBreadcrumb as VuBreadcrumbElement,
  VuBreadcrumbRevealDetail,
} from "@velkin/ui/breadcrumb";

export const VuBreadcrumb = createComponent({
  displayName: "Breadcrumb",
  react: React,
  tagName: "vu-breadcrumb",
  elementClass: VuBreadcrumbElement,
  events: {
    onVuReveal: "vu-reveal" as EventName<CustomEvent<VuBreadcrumbRevealDetail>>,
  },
});
export type * from "@velkin/ui/breadcrumb";
