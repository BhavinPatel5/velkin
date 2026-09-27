<script lang="ts">
export type {
  VuVideoFit,
  VuVideoPlaybackDetail,
  VuVideoPreload,
  VuVideoSeekDetail,
} from "@velkin/ui/video";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/video";
import {
  VuVideoFit,
  VuVideoPlaybackDetail,
  VuVideoPreload,
  VuVideoSeekDetail,
} from "@velkin/ui/video";

export interface Props {
  src?: string;
  poster?: string;
  fit?: VuVideoFit;
  preload?: VuVideoPreload;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsinline?: boolean;
  controls?: boolean;
  playLabel?: string;
  pauseLabel?: string;
  muteLabel?: string;
  unmuteLabel?: string;
  fullscreenLabel?: string;
  exitFullscreenLabel?: string;
  seekLabel?: string;
  volumeLabel?: string;
  label?: string;
}
defineOptions({ name: "Video" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const defaults = reactive({} as Props);
const vDefaults = {
  created(el: any) {
    for (const p in vueProps) {
      defaults[p as keyof Props] = el[p];
    }
  },
};

let hasRendered = false;

const emit = defineEmits<{
  (e: "vu-play", payload: CustomEvent<VuVideoPlaybackDetail>): void;
  (e: "vu-pause", payload: CustomEvent<VuVideoPlaybackDetail>): void;
  (e: "vu-seek", payload: CustomEvent<VuVideoSeekDetail>): void;
  (e: "vu-ended", payload: CustomEvent<VuVideoPlaybackDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuPlay: (event: CustomEvent<VuVideoPlaybackDetail>) =>
      emit("vu-play", event as CustomEvent<VuVideoPlaybackDetail>),
    onVuPause: (event: CustomEvent<VuVideoPlaybackDetail>) =>
      emit("vu-pause", event as CustomEvent<VuVideoPlaybackDetail>),
    onVuSeek: (event: CustomEvent<VuVideoSeekDetail>) =>
      emit("vu-seek", event as CustomEvent<VuVideoSeekDetail>),
    onVuEnded: (event: CustomEvent<VuVideoPlaybackDetail>) =>
      emit("vu-ended", event as CustomEvent<VuVideoPlaybackDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-video", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
