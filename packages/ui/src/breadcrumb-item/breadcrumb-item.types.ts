/** Cancellable navigation event payload — listeners can `preventDefault()` to take over routing. */
export interface VuBreadcrumbItemActivateDetail {
  /** Resolved `href`; empty string when the item rendered as plain text. */
  href: string;
  /** The originating user click event. */
  originalEvent: MouseEvent | KeyboardEvent;
}
