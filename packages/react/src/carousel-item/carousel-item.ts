import * as React from "react";
import { createComponent } from "@lit/react";
import { VuCarouselItem as VuCarouselItemElement } from "@velkin/ui/carousel-item";

export const VuCarouselItem = createComponent({
  displayName: "CarouselItem",
  react: React,
  tagName: "vu-carousel-item",
  elementClass: VuCarouselItemElement,
  events: {},
});
export type * from "@velkin/ui/carousel-item";
