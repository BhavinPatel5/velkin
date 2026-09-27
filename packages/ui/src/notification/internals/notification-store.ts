import type {
  VuNotificationAddInput,
  VuNotificationColor,
  VuNotificationItem,
  VuNotificationTextAlign,
  VuNotificationVariant,
} from "../notification.types.js";

export const NOTIFICATION_REMOVAL_MS = 400;
export const NOTIFICATION_CLEAR_STAGGER_MS = 80;

const DEFAULT_COLOR: VuNotificationColor = "default";
const DEFAULT_ALIGN: VuNotificationTextAlign = "start";

/** Returns true when two add payloads should merge. */
export function notificationMatchesDuplicate(
  item: VuNotificationItem,
  input: VuNotificationAddInput,
): boolean {
  if (item.removing || item.state === "loading" || item.custom) return false;
  return (
    item.title === (input.title ?? "") &&
    item.message === (input.message ?? "") &&
    item.color === (input.color ?? DEFAULT_COLOR) &&
    item.image === input.image &&
    item.icon === input.icon &&
    item.textAlign === (input.textAlign ?? DEFAULT_ALIGN) &&
    item.actionLabel === input.action?.label
  );
}

/** Builds a new queued notification item. */
export function createNotificationItem(
  id: number,
  input: VuNotificationAddInput,
  defaults: { removable: boolean; variant: VuNotificationVariant },
): VuNotificationItem {
  return {
    id,
    title: input.title ?? "",
    message: input.message ?? "",
    color: input.color ?? DEFAULT_COLOR,
    variant: input.variant ?? defaults.variant,
    duration: input.duration,
    image: input.image,
    imageAlt: input.imageAlt,
    icon: input.icon,
    textAlign: input.textAlign ?? DEFAULT_ALIGN,
    state: input.state ?? "idle",
    removing: false,
    count: 1,
    custom: Boolean(input.content),
    actionLabel: input.action?.label,
    removable: input.removable ?? defaults.removable,
    itemClass: input.itemClass,
    itemStyle: input.itemStyle,
    durationMs: null,
  };
}

/** Clears auto-dismiss timers on every item. */
export function clearNotificationTimeouts(items: Array<{ _timeout?: number }>): void {
  for (const item of items) {
    if (item._timeout) clearTimeout(item._timeout);
  }
}

/** Resolves auto-dismiss duration from input + host default. */
export function resolveNotificationDuration(
  inputDuration: number | null | undefined,
  defaultDuration: number,
): number | null {
  if (inputDuration === 0 || inputDuration === null) return null;
  if (inputDuration === undefined) return defaultDuration > 0 ? defaultDuration : null;
  return inputDuration > 0 ? inputDuration : null;
}
