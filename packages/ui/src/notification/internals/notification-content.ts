import type { TemplateResult } from "lit";
import type {
  VuNotificationContentContext,
  VuNotificationContentFn,
} from "../notification.types.js";

type ContentEntry = TemplateResult | VuNotificationContentFn;

const registry = new Map<number, ContentEntry>();

/** Stores ephemeral custom body markup for a toast id. */
export function setNotificationContent(id: number, content: ContentEntry): void {
  registry.set(id, content);
}

/** Reads custom body markup for a toast id. */
export function getNotificationContent(id: number): ContentEntry | undefined {
  return registry.get(id);
}

/** Drops custom body markup when a toast is removed. */
export function clearNotificationContent(id: number): void {
  registry.delete(id);
}

/** Clears every registered custom body. */
export function clearAllNotificationContent(): void {
  registry.clear();
}

/** Resolves a stored custom body into a Lit template. */
export function resolveNotificationContent(
  id: number,
  dismiss: () => void,
): TemplateResult | undefined {
  const entry = registry.get(id);
  if (!entry) return undefined;
  if (typeof entry === "function") {
    const ctx: VuNotificationContentContext = { id, dismiss };
    return entry(ctx);
  }
  return entry;
}
