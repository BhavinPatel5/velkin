import * as React from "react";
import { createComponent } from "@lit/react";
import { VuNotificationProvider as VuNotificationProviderElement } from "@velkin/ui/notification";

export const VuNotificationProvider = createComponent({
  displayName: "Notification",
  react: React,
  tagName: "vu-notification-provider",
  elementClass: VuNotificationProviderElement,
  events: {},
});
export type * from "@velkin/ui/notification";
