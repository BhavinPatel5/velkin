<script lang="ts">
export type {
  VuColorAreaChangeDetail,
  VuColorAreaChannel,
  VuColorAreaColorSpace,
} from "@velkin/ui/color-area";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/color-area";
import {
  VuColorAreaChangeDetail,
  VuColorAreaChannel,
  VuColorAreaColorSpace,
} from "@velkin/ui/color-area";

export interface Props {
  planeRenderer?: "css" | "canvas";
  value?: string;
  colorSpace?: VuColorAreaColorSpace;
  xChannel?: VuColorAreaChannel;
  yChannel?: VuColorAreaChannel;
  hue?: number;
  saturation?: number;
  brightness?: number;
  red?: number;
  green?: number;
  blue?: number;
  step?: number;
  showDots?: boolean;
  label?: string;
  showErrors?: boolean;
  validationActive?: boolean;
  invalid?: boolean;
}
defineOptions({ name: "ColorArea" });

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
  (e: "vu-input", payload: CustomEvent<VuColorAreaChangeDetail>): void;
  (e: "vu-change", payload: CustomEvent<VuColorAreaChangeDetail>): void;
  (e: "vu-invalid", payload: CustomEvent): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuInput: (event: CustomEvent<VuColorAreaChangeDetail>) =>
      emit("vu-input", event as CustomEvent<VuColorAreaChangeDetail>),
    onVuChange: (event: CustomEvent<VuColorAreaChangeDetail>) =>
      emit("vu-change", event as CustomEvent<VuColorAreaChangeDetail>),
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

  return h("vu-color-area", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
