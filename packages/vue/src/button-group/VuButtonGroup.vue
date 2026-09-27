<script lang="ts">
export type {
  VuButtonColor,
  VuButtonGroupChangeDetail,
  VuButtonGroupOrientation,
  VuButtonGroupRadius,
  VuButtonGroupSelectionMode,
  VuButtonGroupVariant,
  VuButtonSize,
} from "@velkin/ui/button-group";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/button-group";
import {
  VuButtonColor,
  VuButtonGroupChangeDetail,
  VuButtonGroupOrientation,
  VuButtonGroupRadius,
  VuButtonGroupSelectionMode,
  VuButtonGroupVariant,
  VuButtonSize,
} from "@velkin/ui/button-group";

export interface Props {
  variant?: VuButtonGroupVariant;
  color?: VuButtonColor;
  size?: VuButtonSize;
  radius?: VuButtonGroupRadius;
  orientation?: VuButtonGroupOrientation;
  disabled?: boolean;
  label?: string;
  selectionMode?: VuButtonGroupSelectionMode;
  value?: string;
  values?: string[];
}
defineOptions({ name: "ButtonGroup" });

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
  (e: "vu-change", payload: CustomEvent<VuButtonGroupChangeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuButtonGroupChangeDetail>) =>
      emit("vu-change", event as CustomEvent<VuButtonGroupChangeDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-button-group", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
