import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuVideo as VuVideoElement,
  VuVideoPlaybackDetail,
  VuVideoSeekDetail,
} from "@velkin/ui/video";

export const VuVideo = createComponent({
  displayName: "Video",
  react: React,
  tagName: "vu-video",
  elementClass: VuVideoElement,
  events: {
    onVuPlay: "vu-play" as EventName<CustomEvent<VuVideoPlaybackDetail>>,
    onVuPause: "vu-pause" as EventName<CustomEvent<VuVideoPlaybackDetail>>,
    onVuSeek: "vu-seek" as EventName<CustomEvent<VuVideoSeekDetail>>,
    onVuEnded: "vu-ended" as EventName<CustomEvent<VuVideoPlaybackDetail>>,
  },
});
export type * from "@velkin/ui/video";
