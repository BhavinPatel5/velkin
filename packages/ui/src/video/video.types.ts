/** Object-fit preset for the inner `<video>`. */
export type VuVideoFit = "cover" | "contain" | "fill" | "none";

/** Native preload hint forwarded to the `<video>` element. */
export type VuVideoPreload = "none" | "metadata" | "auto";

/** Detail for `vu-play` and `vu-pause`. */
export type VuVideoPlaybackDetail = { currentTime: number };

/** Detail for `vu-seek`. */
export type VuVideoSeekDetail = { currentTime: number; previousTime: number };
