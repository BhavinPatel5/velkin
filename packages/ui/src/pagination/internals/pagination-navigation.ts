/** Returns the next selectable page in `direction`, or `current` when blocked. */
export function paginationNextAvailablePage(
  current: number,
  totalPages: number,
  disabledPages: number[],
  direction: number,
): number {
  let page = current;
  while (true) {
    page += direction;
    if (page < 1 || page > totalPages) return current;
    if (!disabledPages.includes(page)) return page;
  }
}

/** True when `page` is in range and not disabled. */
export function paginationCanActivatePage(
  page: number,
  totalPages: number,
  disabledPages: number[],
): boolean {
  return page >= 1 && page <= totalPages && !disabledPages.includes(page);
}
