/** Public type aliases for `<vu-carousel>`. Re-exported from the component file. */

/** Which navigation affordances render. `dots` (default) is the most discoverable for short lists; `arrows` for long lists; `both` for galleries; `none` when the carousel is driven entirely from outside (state/controller). */
export type VuCarouselControls = "none" | "arrows" | "dots" | "both";

/** Gap between slides — token-driven so a carousel reads consistently with the surrounding density. `none` (default) is edge-to-edge for media galleries; `sm` / `md` / `lg` add increasing breathing room for cards / quotes / tiles. */
export type VuCarouselGap = "none" | "sm" | "md" | "lg";

/** Layout axis. `horizontal` (default) translates the track on the X axis; `vertical` on the Y axis (the consumer must set a `block-size` on the host so there's something to scroll within). */
export type VuCarouselOrientation = "horizontal" | "vertical";

/** Detail payload for the `vu-change` event fired whenever the active slide index moves (via API, click, drag, keyboard, or autoplay). */
export type VuCarouselChangeDetail = {
  /** The new active index after the change. */
  index: number;
  /** The previous active index — useful for direction-aware animations. */
  previous: number;
};
