import { describe, expect, it } from "vitest";
import { createNotificationApi } from "../../internals/notification-api.js";
import {
  clearAllNotificationProviders,
  findNotificationHostByToastId,
  registerNotificationProvider,
  resolveNotificationApi,
  unregisterNotificationProvider,
} from "../../internals/notification-registry.js";
import type { VuNotification } from "../../notification.js";

function mockRegistration(host: Partial<VuNotification> | null = null) {
  const api = createNotificationApi(() => host as VuNotification | null);
  const registration = {
    api,
    getHost: () => host as VuNotification | null,
  };
  return registration;
}

describe("notification-registry", () => {
  it("routes notify() to a named provider", () => {
    const alerts = mockRegistration({ addNotification: () => 7 } as VuNotification);
    registerNotificationProvider("alerts", alerts);
    expect(resolveNotificationApi("alerts")).toBe(alerts.api);
    unregisterNotificationProvider("alerts", alerts);
  });

  it("falls back to the default provider when toasterId is omitted", () => {
    const fallback = mockRegistration();
    registerNotificationProvider("", fallback);
    expect(resolveNotificationApi()).toBe(fallback.api);
    unregisterNotificationProvider("", fallback);
  });

  it("finds a host by toast id across providers", () => {
    const host = { notifications: [{ id: 42 }] } as VuNotification;
    const registration = mockRegistration(host);
    registerNotificationProvider("", registration);
    expect(findNotificationHostByToastId(42)).toBe(host);
    unregisterNotificationProvider("", registration);
  });

  it("clearAllNotificationProviders clears every unique host once", () => {
    const cleared: number[] = [];
    const hostA = { clearNotifications: () => cleared.push(1) } as VuNotification;
    const hostB = { clearNotifications: () => cleared.push(2) } as VuNotification;
    const regA = mockRegistration(hostA);
    const regB = mockRegistration(hostB);
    registerNotificationProvider("", regA);
    registerNotificationProvider("alerts", regB);
    clearAllNotificationProviders();
    expect(cleared.sort()).toEqual([1, 2]);
    unregisterNotificationProvider("", regA);
    unregisterNotificationProvider("alerts", regB);
  });
});
