<script lang="ts">
export type { VuSpinnerColor, VuSpinnerVariant } from "@velkin/ui/spinner";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/spinner";
import { VuSpinnerColor, VuSpinnerVariant } from "@velkin/ui/spinner";

export interface Props {
  variant?: VuSpinnerVariant;
  size?: string;
  color?: VuSpinnerColor;
  label?: string;
  overlay?: boolean;
  fullscreen?: boolean;
  backdropBlur?: boolean;
  speed?: number;
  paused?: boolean;
}
defineOptions({ name: "Spinner" });

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

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {};
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-spinner", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
