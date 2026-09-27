import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuNotification as VuNotificationElement,
  VuNotificationClearAllDetail,
  VuNotificationQueueDetail,
  VuNotificationRemoveDetail,
} from "@velkin/ui/notification";

export const VuNotification = createComponent({
  displayName: "Notification",
  react: React,
  tagName: "vu-notification",
  elementClass: VuNotificationElement,
  events: {
    onVuQueue: "vu-queue" as EventName<CustomEvent<VuNotificationQueueDetail>>,
    onVuRemove: "vu-remove" as EventName<CustomEvent<VuNotificationRemoveDetail>>,
    onVuClearAll: "vu-clear-all" as EventName<CustomEvent<VuNotificationClearAllDetail>>,
  },
});
export type * from "@velkin/ui/notification";
