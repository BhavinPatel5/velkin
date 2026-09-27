import type { NotificationApi } from "./notification-api.js";
import type { VuNotification } from "../notification.js";

type ProviderRegistration = {
  api: NotificationApi;
  getHost: () => VuNotification | null;
};

const providersById = new Map<string, ProviderRegistration>();
let defaultProvider: ProviderRegistration | null = null;

/** Registers a provider API; empty `providerId` becomes the default route for `notify()`. */
export function registerNotificationProvider(
  providerId: string,
  registration: ProviderRegistration,
): void {
  if (providerId) {
    providersById.set(providerId, registration);
    return;
  }
  defaultProvider = registration;
}

/** Unregisters a provider when it disconnects. */
export function unregisterNotificationProvider(
  providerId: string,
  registration: ProviderRegistration,
): void {
  if (providerId) {
    if (providersById.get(providerId) === registration) {
      providersById.delete(providerId);
    }
    return;
  }
  if (defaultProvider === registration) {
    defaultProvider = null;
  }
}

function warnMissingProvider(toasterId?: string): void {
  if (typeof console === "undefined") return;
  if (toasterId) {
    console.warn(
      `[vu-notification] notify() called with toasterId "${toasterId}" but no matching <vu-notification-provider> is connected.`,
    );
    return;
  }
  console.warn(
    "[vu-notification] notify() called without a default <vu-notification-provider> in the document.",
  );
}

/** Resolves the provider API for a toast payload. */
export function resolveNotificationApi(toasterId?: string): NotificationApi | null {
  if (toasterId) {
    const registration = providersById.get(toasterId);
    if (!registration) warnMissingProvider(toasterId);
    return registration?.api ?? null;
  }
  const registration = defaultProvider ?? providersById.values().next().value ?? null;
  if (!registration) warnMissingProvider();
  return registration?.api ?? null;
}

/** Finds the host that owns a toast id (for close/update without `toasterId`). */
export function findNotificationHostByToastId(id: number): VuNotification | null {
  const hosts: Array<VuNotification | null> = [
    defaultProvider?.getHost() ?? null,
    ...Array.from(providersById.values(), (entry) => entry.getHost()),
  ];
  for (const host of hosts) {
    if (host?.notifications.some((item) => item.id === id)) return host;
  }
  return null;
}

/** Clears every connected notification provider. */
export function clearAllNotificationProviders(): void {
  const seen = new Set<VuNotification>();
  for (const host of [
    defaultProvider?.getHost() ?? null,
    ...Array.from(providersById.values(), (entry) => entry.getHost()),
  ]) {
    if (!host || seen.has(host)) continue;
    seen.add(host);
    host.clearNotifications();
  }
}
