import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuBreadcrumbItem as VuBreadcrumbItemElement,
  VuBreadcrumbItemActivateDetail,
} from "@velkin/ui/breadcrumb-item";

export const VuBreadcrumbItem = createComponent({
  displayName: "BreadcrumbItem",
  react: React,
  tagName: "vu-breadcrumb-item",
  elementClass: VuBreadcrumbItemElement,
  events: {
    onVuActivate: "vu-activate" as EventName<CustomEvent<VuBreadcrumbItemActivateDetail>>,
  },
});
export type * from "@velkin/ui/breadcrumb-item";
