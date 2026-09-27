<script lang="ts">
export type {
  VuColorSliderChangeDetail,
  VuColorSliderChannel,
  VuColorSliderColorSpace,
  VuColorSliderOrientation,
} from "@velkin/ui/color-slider";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/color-slider";
import {
  VuColorSliderChangeDetail,
  VuColorSliderChannel,
  VuColorSliderColorSpace,
  VuColorSliderOrientation,
} from "@velkin/ui/color-slider";

export interface Props {
  channel?: VuColorSliderChannel;
  value?: string;
  colorSpace?: "" | VuColorSliderColorSpace;
  orientation?: VuColorSliderOrientation;
  step?: number;
  baseColor?: string;
  label?: string;
  showErrors?: boolean;
  validationActive?: boolean;
  invalid?: boolean;
}
defineOptions({ name: "ColorSlider" });

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
  (e: "vu-input", payload: CustomEvent<VuColorSliderChangeDetail>): void;
  (e: "vu-change", payload: CustomEvent<VuColorSliderChangeDetail>): void;
  (e: "vu-invalid", payload: CustomEvent): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuInput: (event: CustomEvent<VuColorSliderChangeDetail>) =>
      emit("vu-input", event as CustomEvent<VuColorSliderChangeDetail>),
    onVuChange: (event: CustomEvent<VuColorSliderChangeDetail>) =>
      emit("vu-change", event as CustomEvent<VuColorSliderChangeDetail>),
    onVuInvalid: (event: CustomEvent) => emit("vu-invalid", event as CustomEvent),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-color-slider", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
