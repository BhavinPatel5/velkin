import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuSlider as VuSliderElement,
  VuSliderChangeDetail,
  VuSliderClearDetail,
  VuSliderInvalidDetail,
} from "@velkin/ui/slider";

export const VuSlider = createComponent({
  displayName: "Slider",
  react: React,
  tagName: "vu-slider",
  elementClass: VuSliderElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuSliderChangeDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent<VuSliderInvalidDetail>>,
    onVuClear: "vu-clear" as EventName<CustomEvent<VuSliderClearDetail>>,
  },
});
export type * from "@velkin/ui/slider";
