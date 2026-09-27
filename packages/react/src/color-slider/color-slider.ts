import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuColorSlider as VuColorSliderElement,
  VuColorSliderChangeDetail,
} from "@velkin/ui/color-slider";

export const VuColorSlider = createComponent({
  displayName: "ColorSlider",
  react: React,
  tagName: "vu-color-slider",
  elementClass: VuColorSliderElement,
  events: {
    onVuInput: "vu-input" as EventName<CustomEvent<VuColorSliderChangeDetail>>,
    onVuChange: "vu-change" as EventName<CustomEvent<VuColorSliderChangeDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent>,
  },
});
export type * from "@velkin/ui/color-slider";
