import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuPagination as VuPaginationElement,
  VuPaginationChangeDetail,
} from "@velkin/ui/pagination";

export const VuPagination = createComponent({
  displayName: "Pagination",
  react: React,
  tagName: "vu-pagination",
  elementClass: VuPaginationElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuPaginationChangeDetail>>,
  },
});
export type * from "@velkin/ui/pagination";
