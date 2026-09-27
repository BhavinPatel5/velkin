import * as React from "react";
import { createComponent } from "@lit/react";
import { VuAvatar as VuAvatarElement } from "@velkin/ui/avatar";

export const VuAvatar = createComponent({
  displayName: "Avatar",
  react: React,
  tagName: "vu-avatar",
  elementClass: VuAvatarElement,
  events: {},
});
export type * from "@velkin/ui/avatar";
