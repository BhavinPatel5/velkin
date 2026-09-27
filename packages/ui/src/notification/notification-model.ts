export type { NotificationApi } from "./internals/notification-api.js";
export {
  createNotificationApi,
  notify,
  registerNotificationProvider,
  unregisterNotificationProvider,
} from "./internals/notification-api.js";
export {
  notificationContext,
  type NotificationContextValue,
} from "./internals/notification-context.js";
export type {
  VuNotificationContentContext,
  VuNotificationContentFn,
  VuNotificationPosition,
  VuNotificationVariant,
} from "./notification.types.js";
