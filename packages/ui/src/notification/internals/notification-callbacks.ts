export type NotificationItemCallbacks = {
  onClose?: () => void;
  onAction?: () => void;
};

const registry = new Map<number, NotificationItemCallbacks>();

/** Stores ephemeral callbacks for a queued toast id. */
export function setNotificationCallbacks(id: number, callbacks: NotificationItemCallbacks): void {
  registry.set(id, callbacks);
}

/** Reads callbacks registered for a toast id. */
export function getNotificationCallbacks(id: number): NotificationItemCallbacks | undefined {
  return registry.get(id);
}

/** Drops callbacks when a toast is removed. */
export function clearNotificationCallbacks(id: number): void {
  registry.delete(id);
}

/** Clears every registered callback. */
export function clearAllNotificationCallbacks(): void {
  registry.clear();
}
