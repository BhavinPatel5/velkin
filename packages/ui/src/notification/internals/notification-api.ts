import type {
  VuNotificationAddInput,
  VuNotificationColor,
  VuNotificationContentFn,
  VuNotificationPromiseMessages,
  VuNotificationUpdateInput,
} from "../notification.types.js";
import type { VuNotification } from "../notification.js";
import {
  clearAllNotificationProviders,
  findNotificationHostByToastId,
  resolveNotificationApi,
} from "./notification-registry.js";

export type NotificationApi = ((input: string | VuNotificationAddInput) => number) & {
  success: (title: string, options?: VuNotificationAddInput) => number;
  primary: (title: string, options?: VuNotificationAddInput) => number;
  warning: (title: string, options?: VuNotificationAddInput) => number;
  danger: (title: string, options?: VuNotificationAddInput) => number;
  promise: <T>(task: () => Promise<T>, messages: VuNotificationPromiseMessages<T>) => Promise<T>;
  custom: (
    content: VuNotificationContentFn,
    options?: Omit<VuNotificationAddInput, "content">,
  ) => number;
  close: (id: number) => void;
  clear: (toasterId?: string) => void;
  update: (id: number, patch: VuNotificationUpdateInput) => void;
};

function normalizeInput(input: string | VuNotificationAddInput): VuNotificationAddInput {
  return typeof input === "string" ? { title: input } : input;
}

function resolveMessage<T>(
  message: string | ((value: T) => string | VuNotificationAddInput),
  value: T,
): VuNotificationAddInput {
  if (typeof message === "function") {
    const resolved = message(value);
    return typeof resolved === "string" ? { title: resolved } : resolved;
  }
  return { title: message };
}

/** Builds the callable notify API backed by a notification host. */
export function createNotificationApi(getHost: () => VuNotification | null): NotificationApi {
  const add = (input: VuNotificationAddInput) => getHost()?.addNotification(input) ?? -1;

  const notify = ((input: string | VuNotificationAddInput) =>
    add(normalizeInput(input))) as NotificationApi;

  const withColor =
    (color: VuNotificationColor) =>
    (title: string, options: VuNotificationAddInput = {}) =>
      add({ ...options, title, color });

  notify.success = withColor("success");
  notify.primary = withColor("primary");
  notify.warning = withColor("warning");
  notify.danger = withColor("danger");

  notify.custom = (
    content: VuNotificationContentFn,
    options: Omit<VuNotificationAddInput, "content"> = {},
  ) => add({ ...options, content });

  notify.promise = async <T>(
    task: () => Promise<T>,
    messages: VuNotificationPromiseMessages<T>,
  ) => {
    const host = getHost();
    if (!host) {
      throw new Error("notify.promise() requires an active <vu-notification-provider>.");
    }

    const loading = normalizeInput(messages.loading);
    const id = host.addNotification({
      ...loading,
      state: "loading",
      duration: 0,
      removable: false,
    });

    try {
      const value = await task();
      const success = resolveMessage(messages.success, value);
      host.updateNotification(id, {
        ...success,
        state: "idle",
        color: success.color ?? "success",
        removable: success.removable ?? true,
      });
      return value;
    } catch (reason) {
      const error = resolveMessage(messages.error, reason);
      host.updateNotification(id, {
        ...error,
        state: "idle",
        color: error.color ?? "danger",
        removable: error.removable ?? true,
      });
      throw reason;
    }
  };

  notify.close = (id: number) => {
    const host = findNotificationHostByToastId(id);
    host?.removeNotification(id);
  };

  notify.clear = (toasterId?: string) => {
    if (toasterId) {
      resolveNotificationApi(toasterId)?.clear();
      return;
    }
    getHost()?.clearNotifications();
  };

  notify.update = (id: number, patch: VuNotificationUpdateInput) => {
    const host = findNotificationHostByToastId(id);
    host?.updateNotification(id, patch);
  };

  return notify;
}

export {
  registerNotificationProvider,
  unregisterNotificationProvider,
} from "./notification-registry.js";

/** Module-level toast API — routes to the default or `toasterId` provider. */
export const notify = Object.assign(
  (input: string | VuNotificationAddInput) => {
    const normalized = normalizeInput(input);
    const api = resolveNotificationApi(normalized.toasterId);
    return api ? api(normalized) : -1;
  },
  {
    success: (title: string, options?: VuNotificationAddInput) => {
      const api = resolveNotificationApi(options?.toasterId);
      return api ? api.success(title, options) : -1;
    },
    primary: (title: string, options?: VuNotificationAddInput) => {
      const api = resolveNotificationApi(options?.toasterId);
      return api ? api.primary(title, options) : -1;
    },
    warning: (title: string, options?: VuNotificationAddInput) => {
      const api = resolveNotificationApi(options?.toasterId);
      return api ? api.warning(title, options) : -1;
    },
    danger: (title: string, options?: VuNotificationAddInput) => {
      const api = resolveNotificationApi(options?.toasterId);
      return api ? api.danger(title, options) : -1;
    },
    custom: (
      content: VuNotificationContentFn,
      options?: Omit<VuNotificationAddInput, "content">,
    ) => {
      const api = resolveNotificationApi(options?.toasterId);
      return api ? api.custom(content, options) : -1;
    },
    promise: <T>(task: () => Promise<T>, messages: VuNotificationPromiseMessages<T>) => {
      const loading = normalizeInput(messages.loading);
      const api = resolveNotificationApi(loading.toasterId);
      if (!api) {
        return Promise.reject(
          new Error("notify.promise() requires an active <vu-notification-provider>."),
        );
      }
      return api.promise(task, messages);
    },
    close: (id: number) => {
      const host = findNotificationHostByToastId(id);
      host?.removeNotification(id);
    },
    clear: (toasterId?: string) => {
      if (toasterId) {
        resolveNotificationApi(toasterId)?.clear();
        return;
      }
      const api = resolveNotificationApi();
      if (api) {
        api.clear();
        return;
      }
      clearAllNotificationProviders();
    },
    update: (id: number, patch: VuNotificationUpdateInput) => {
      const host = findNotificationHostByToastId(id);
      host?.updateNotification(id, patch);
    },
  },
) as NotificationApi;
