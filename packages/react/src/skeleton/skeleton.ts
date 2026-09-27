import * as React from "react";
import { createComponent } from "@lit/react";
import { VuSkeleton as VuSkeletonElement } from "@velkin/ui/skeleton";

export const VuSkeleton = createComponent({
  displayName: "Skeleton",
  react: React,
  tagName: "vu-skeleton",
  elementClass: VuSkeletonElement,
  events: {},
});
export type * from "@velkin/ui/skeleton";
