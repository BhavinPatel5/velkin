import * as React from "react";
import { createComponent } from "@lit/react";
import { VuConfigProvider as VuConfigProviderElement } from "@velkin/ui/config-provider";

export const VuConfigProvider = createComponent({
  displayName: "ConfigProvider",
  react: React,
  tagName: "vu-config-provider",
  elementClass: VuConfigProviderElement,
  events: {},
});
export type * from "@velkin/ui/config-provider";
