/** Forwarded to every `<vu-breadcrumb-item>` child for uniform sizing. */
export type VuBreadcrumbSize = "sm" | "md" | "lg";

/** How hidden middle segments are exposed when `max` collapses the trail. */
export type VuBreadcrumbOverflow = "menu" | "inline";

/** Detail dispatched on the parent when the user expands the full trail (`overflow="inline"` ellipsis, or "Show full trail" in the overflow menu). */
export interface VuBreadcrumbRevealDetail {
  /** Number of items that were previously collapsed and have now been revealed. */
  revealed: number;
}
