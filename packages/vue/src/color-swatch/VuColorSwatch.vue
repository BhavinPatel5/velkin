<script lang="ts">
export type {
  VuColorSwatchSelectDetail,
  VuColorSwatchShape,
  VuColorSwatchSize,
} from "@velkin/ui/color-swatch";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/color-swatch";
import {
  VuColorSwatchSelectDetail,
  VuColorSwatchShape,
  VuColorSwatchSize,
} from "@velkin/ui/color-swatch";

export interface Props {
  color?: string;
  value?: string;
  size?: VuColorSwatchSize;
  shape?: VuColorSwatchShape;
  checkerboard?: boolean;
  selected?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  colorName?: string;
}
defineOptions({ name: "ColorSwatch" });

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
  (e: "vu-select", payload: CustomEvent<VuColorSwatchSelectDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuSelect: (event: CustomEvent<VuColorSwatchSelectDetail>) =>
      emit("vu-select", event as CustomEvent<VuColorSwatchSelectDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-color-swatch", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
