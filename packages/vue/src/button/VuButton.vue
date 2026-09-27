<script lang="ts">
export type {
  VuButtonColor,
  VuButtonRadius,
  VuButtonSize,
  VuButtonType,
  VuButtonVariant,
} from "@velkin/ui/button";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/button";
import {
  VuButtonColor,
  VuButtonRadius,
  VuButtonSize,
  VuButtonType,
  VuButtonVariant,
} from "@velkin/ui/button";

export interface Props {
  variant?: VuButtonVariant;
  color?: VuButtonColor;
  size?: VuButtonSize;
  radius?: VuButtonRadius;
  type?: VuButtonType;
  name?: string;
  value?: string;
  form?: string;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  iconOnly?: boolean;
  label?: string;
  pressed?: boolean;
  attached?: "first" | "middle" | "last" | "only" | undefined;
  axis?: "horizontal" | "vertical" | undefined;
  radio?: boolean;
}
defineOptions({ name: "Button" });

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
  (e: "click", payload: MouseEvent): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onClick: (event: MouseEvent) => emit("click", event as MouseEvent),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-button", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
