import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuColorSwatchPicker as VuColorSwatchPickerElement,
  VuColorSwatchPickerChangeDetail,
} from "@velkin/ui/color-swatch-picker";

export const VuColorSwatchPicker = createComponent({
  displayName: "ColorSwatchPicker",
  react: React,
  tagName: "vu-color-swatch-picker",
  elementClass: VuColorSwatchPickerElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuColorSwatchPickerChangeDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent>,
  },
});
export type * from "@velkin/ui/color-swatch-picker";
