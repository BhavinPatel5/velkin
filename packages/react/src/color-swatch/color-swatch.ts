import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuColorSwatch as VuColorSwatchElement,
  VuColorSwatchSelectDetail,
} from "@velkin/ui/color-swatch";

export const VuColorSwatch = createComponent({
  displayName: "ColorSwatch",
  react: React,
  tagName: "vu-color-swatch",
  elementClass: VuColorSwatchElement,
  events: {
    onVuSelect: "vu-select" as EventName<CustomEvent<VuColorSwatchSelectDetail>>,
  },
});
export type * from "@velkin/ui/color-swatch";
