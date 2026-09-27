import type { PaginationPageToken } from "../pagination.types.js";

/** Builds visible page tokens for the numbered bar variant. */
export function buildPaginationPages(
  totalPages: number,
  currentPage: number,
  maxVisiblePages: number,
): PaginationPageToken[] {
  const pages: PaginationPageToken[] = [];

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  let startPage = Math.max(2, currentPage - 1);
  let endPage = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 3) {
    startPage = 2;
    endPage = 4;
  } else if (currentPage >= totalPages - 2) {
    startPage = totalPages - 3;
    endPage = totalPages - 1;
  }

  pages.push(1);
  if (startPage > 2) pages.push("ellipsis");
  for (let i = startPage; i <= endPage; i++) pages.push(i);
  if (endPage < totalPages - 1) pages.push("ellipsis");
  pages.push(totalPages);

  if (pages.length > maxVisiblePages + 2) {
    return [1, "ellipsis", currentPage, "ellipsis", totalPages];
  }

  return pages;
}
