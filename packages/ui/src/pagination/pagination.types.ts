/** Numbered bar or compact page picker menu. */
export type VuPaginationLayout = "bar" | "menu";

/** Row density preset. */
export type VuPaginationSize = "sm" | "md" | "lg";

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuPaginationRadius = "none" | "sm" | "md" | "lg" | "full";

/** `vu-change` when `currentPage` changes. */
export type VuPaginationChangeDetail = { currentPage: number };

/** Page token in the bar layout (`ellipsis` is a decorative range marker). */
export type PaginationPageToken = number | "ellipsis";
