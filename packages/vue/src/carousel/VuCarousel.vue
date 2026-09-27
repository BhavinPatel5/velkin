<script lang="ts">
export type {
  VuCarouselChangeDetail,
  VuCarouselControls,
  VuCarouselGap,
  VuCarouselOrientation,
} from "@velkin/ui/carousel";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/carousel";
import {
  VuCarouselChangeDetail,
  VuCarouselControls,
  VuCarouselGap,
  VuCarouselOrientation,
} from "@velkin/ui/carousel";

export interface Props {
  index?: number;
  slidesPerView?: number;
  slidesToScroll?: number;
  loop?: boolean;
  autoplay?: boolean;
  interval?: number;
  pauseOnHover?: boolean;
  controls?: VuCarouselControls;
  gap?: VuCarouselGap;
  orientation?: VuCarouselOrientation;
  label?: string;
  prevLabel?: string;
  nextLabel?: string;
  dotsLabel?: string;
  loading?: boolean;
}
defineOptions({ name: "Carousel" });

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
  (e: "vu-change", payload: CustomEvent<VuCarouselChangeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuCarouselChangeDetail>) =>
      emit("vu-change", event as CustomEvent<VuCarouselChangeDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-carousel", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
