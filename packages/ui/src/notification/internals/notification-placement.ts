import type {
  PopoverAlign,
  PopoverSide,
} from "../../internals/controllers/popover-controller.js";

/** Screen corner/center where the toast region anchors. */
export type VuNotificationPosition =
  "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end";

/** Vertical viewport edge for internal popover + motion wiring. */
export type NotificationEdge = "top" | "bottom";

/** Horizontal alignment along the top/bottom edge. */
export type NotificationEdgeAlign = "start" | "center" | "end";

export type ResolvedNotificationPosition = {
  edge: NotificationEdge;
  align: NotificationEdgeAlign;
};

export const NOTIFICATION_POSITIONS = [
  "top-start",
  "top-center",
  "top-end",
  "bottom-start",
  "bottom-center",
  "bottom-end",
] as const satisfies readonly VuNotificationPosition[];

const DEFAULT_POSITION: VuNotificationPosition = "bottom-end";

/** Normalizes legacy or partial values to one of the six screen positions. */
export function normalizeNotificationPosition(value: string): VuNotificationPosition {
  if ((NOTIFICATION_POSITIONS as readonly string[]).includes(value)) {
    return value as VuNotificationPosition;
  }
  return DEFAULT_POSITION;
}

/** Splits a screen position into edge + align for anchor and popover wiring. */
export function resolveNotificationPosition(
  position: VuNotificationPosition,
): ResolvedNotificationPosition {
  const [edge, align] = position.split("-") as [NotificationEdge, NotificationEdgeAlign];
  return { edge, align };
}

/** Maps a screen position to the popover side that opens inward from the edge. */
export function toPopoverPlacement(position: VuNotificationPosition): PopoverSide {
  return resolveNotificationPosition(position).edge === "top" ? "bottom" : "top";
}

/** Popover align along the top/bottom edge. */
export function toPopoverAlign(position: VuNotificationPosition): PopoverAlign {
  return resolveNotificationPosition(position).align;
}

/** Vertical edge used by enter/exit motion and stack fan direction. */
export function notificationMotionEdge(position: VuNotificationPosition): NotificationEdge {
  return resolveNotificationPosition(position).edge;
}
