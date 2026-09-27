import { clearNotificationTimeouts, resolveNotificationDuration } from "./notification-store.js";

export type NotificationTimedItem = {
  id: number;
  removing: boolean;
  durationMs: number | null;
  _timeout?: number;
  _expiresAt?: number;
  _remainingMs?: number;
};

/** Applies, pauses, and resumes auto-dismiss timers for toast items. */
export class NotificationDurationController {
  apply<T extends NotificationTimedItem>(
    item: T,
    duration: number | null | undefined,
    defaultDuration: number,
    onExpire: (id: number) => void,
  ): void {
    if (item._timeout) clearTimeout(item._timeout);
    const resolved = resolveNotificationDuration(duration, defaultDuration);
    item.durationMs = resolved;
    if (resolved != null) {
      item._expiresAt = Date.now() + resolved;
      item._remainingMs = resolved;
      item._timeout = window.setTimeout(() => onExpire(item.id), resolved);
      return;
    }
    item._expiresAt = undefined;
    item._remainingMs = undefined;
    item._timeout = undefined;
  }

  pauseAll<T extends NotificationTimedItem>(items: T[]): void {
    for (const item of items) {
      if (!item._timeout || item._expiresAt == null) continue;
      clearTimeout(item._timeout);
      item._timeout = undefined;
      item._remainingMs = Math.max(0, item._expiresAt - Date.now());
    }
  }

  resumeAll<T extends NotificationTimedItem>(items: T[], onExpire: (id: number) => void): void {
    for (const item of items) {
      if (item.removing || item._remainingMs == null || item._remainingMs <= 0) continue;
      if (item._timeout) continue;
      item._expiresAt = Date.now() + item._remainingMs;
      item._timeout = window.setTimeout(() => onExpire(item.id), item._remainingMs);
    }
  }

  clearAll<T extends NotificationTimedItem>(items: T[]): void {
    clearNotificationTimeouts(items);
  }
}
