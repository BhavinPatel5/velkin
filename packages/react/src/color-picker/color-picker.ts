import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuColorPicker as VuColorPickerElement,
  VuColorPickerChangeDetail,
} from "@velkin/ui/color-picker";

export const VuColorPicker = createComponent({
  displayName: "ColorPicker",
  react: React,
  tagName: "vu-color-picker",
  elementClass: VuColorPickerElement,
  events: {
    onVuInput: "vu-input" as EventName<CustomEvent<VuColorPickerChangeDetail>>,
    onVuChange: "vu-change" as EventName<CustomEvent<VuColorPickerChangeDetail>>,
    onVuOpenChange: "vu-open-change" as EventName<CustomEvent<{ open: boolean }>>,
    onVuOpen: "vu-open" as EventName<CustomEvent>,
    onVuClose: "vu-close" as EventName<CustomEvent>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent>,
  },
});
export type * from "@velkin/ui/color-picker";
