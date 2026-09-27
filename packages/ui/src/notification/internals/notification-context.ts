import { createContext } from "@lit/context";
import type { NotificationApi } from "./notification-api.js";
import type { VuNotification } from "../notification.js";

/** Context value from `<vu-notification-provider>`. */
export type NotificationContextValue = {
  notify: NotificationApi;
  host: VuNotification | null;
};

export const notificationContext = createContext<NotificationContextValue>("vu/notification");
