import * as React from "react";
import { createComponent } from "@lit/react";
import { VuSkeletonLoader as VuSkeletonLoaderElement } from "@velkin/ui/skeleton-loader";

export const VuSkeletonLoader = createComponent({
  displayName: "SkeletonLoader",
  react: React,
  tagName: "vu-skeleton-loader",
  elementClass: VuSkeletonLoaderElement,
  events: {},
});
export type * from "@velkin/ui/skeleton-loader";
