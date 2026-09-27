<script lang="ts">
export type {
  VuListitemActivateDetail,
  VuListitemSize,
  VuListSelectionMode,
} from "@velkin/ui/list-item";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/list-item";
import {
  VuListitemActivateDetail,
  VuListitemSize,
  VuListSelectionMode,
} from "@velkin/ui/list-item";

export interface Props {
  label?: string;
  hint?: string;
  avatar?: string;
  name?: string;
  value?: string;
  subheader?: string;
  href?: string;
  target?: string;
  rel?: string;
  size?: VuListitemSize | undefined;
  selected?: boolean;
  dense?: boolean;
  disabled?: boolean;
  itemTabIndex?: number;
  listSelectionMode?: "" | VuListSelectionMode;
}
defineOptions({ name: "ListItem" });

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
  (e: "vu-activate", payload: CustomEvent<VuListitemActivateDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuActivate: (event: CustomEvent<VuListitemActivateDetail>) =>
      emit("vu-activate", event as CustomEvent<VuListitemActivateDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-listitem", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
