import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import { VuCarousel as VuCarouselElement, VuCarouselChangeDetail } from "@velkin/ui/carousel";

export const VuCarousel = createComponent({
  displayName: "Carousel",
  react: React,
  tagName: "vu-carousel",
  elementClass: VuCarouselElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuCarouselChangeDetail>>,
  },
});
export type * from "@velkin/ui/carousel";
