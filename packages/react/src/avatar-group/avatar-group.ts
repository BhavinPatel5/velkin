import * as React from "react";
import { createComponent } from "@lit/react";
import { VuAvatarGroup as VuAvatarGroupElement } from "@velkin/ui/avatar-group";

export const VuAvatarGroup = createComponent({
  displayName: "AvatarGroup",
  react: React,
  tagName: "vu-avatar-group",
  elementClass: VuAvatarGroupElement,
  events: {},
});
export type * from "@velkin/ui/avatar-group";
