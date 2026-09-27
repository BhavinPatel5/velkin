<script lang="ts">
export type {
  VuColorSwatchPickerChangeDetail,
  VuColorSwatchPickerLayout,
  VuColorSwatchShape,
  VuColorSwatchSize,
} from "@velkin/ui/color-swatch-picker";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/color-swatch-picker";
import {
  VuColorSwatchPickerChangeDetail,
  VuColorSwatchPickerLayout,
  VuColorSwatchShape,
  VuColorSwatchSize,
} from "@velkin/ui/color-swatch-picker";

export interface Props {
  value?: string;
  colors?: string[];
  columns?: number;
  size?: VuColorSwatchSize;
  variant?: VuColorSwatchShape;
  layout?: VuColorSwatchPickerLayout;
  checkerboard?: boolean;
  label?: string;
  showErrors?: boolean;
  validationActive?: boolean;
  invalid?: boolean;
}
defineOptions({ name: "ColorSwatchPicker" });

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
  (e: "vu-change", payload: CustomEvent<VuColorSwatchPickerChangeDetail>): void;
  (e: "vu-invalid", payload: CustomEvent): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuColorSwatchPickerChangeDetail>) =>
      emit("vu-change", event as CustomEvent<VuColorSwatchPickerChangeDetail>),
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

  return h("vu-color-swatch-picker", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
