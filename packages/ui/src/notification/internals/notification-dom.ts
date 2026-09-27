/** Stable shadow-DOM id for a toast item element. */
export function notificationItemDomId(id: number): string {
  return `nt-item-${id}`;
}

/** Finds a toast item surface in a shadow root by queue id. */
export function queryNotificationItem(
  root: ParentNode | null | undefined,
  id: number,
): HTMLElement | null {
  return root?.querySelector<HTMLElement>(`#${notificationItemDomId(id)}`) ?? null;
}

/** Reads the queue id encoded on a toast item element. */
export function readNotificationItemDomId(el: HTMLElement): string {
  const prefix = "nt-item-";
  return el.id.startsWith(prefix) ? el.id.slice(prefix.length) : el.id;
}
