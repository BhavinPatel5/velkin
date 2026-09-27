import * as React from "react";
import { createComponent } from "@lit/react";
import { VuImage as VuImageElement } from "@velkin/ui/image";

export const VuImage = createComponent({
  displayName: "Image",
  react: React,
  tagName: "vu-image",
  elementClass: VuImageElement,
  events: {},
});
export type * from "@velkin/ui/image";
