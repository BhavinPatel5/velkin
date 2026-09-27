<script lang="ts">
export type {
  PopoverPlacement,
  VuNavPanelChangeDetail,
  VuNavPanelCollapseChangeDetail,
  VuNavPanelCollapsedHints,
  VuNavPanelColor,
  VuNavPanelItem,
  VuNavPanelSize,
} from "@velkin/ui/nav-panel";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/nav-panel";
import {
  PopoverPlacement,
  VuNavPanelChangeDetail,
  VuNavPanelCollapseChangeDetail,
  VuNavPanelCollapsedHints,
  VuNavPanelColor,
  VuNavPanelItem,
  VuNavPanelSize,
} from "@velkin/ui/nav-panel";

export interface Props {
  items?: VuNavPanelItem[];
  value?: string;
  collapsedGroups?: Record<string, boolean>;
  collapsed?: boolean;
  label?: string;
  size?: VuNavPanelSize;
  color?: VuNavPanelColor;
  collapsedHints?: VuNavPanelCollapsedHints;
  collapsedHintPlacement?: PopoverPlacement;
}
defineOptions({ name: "NavPanel" });

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
  (e: "vu-change", payload: CustomEvent<VuNavPanelChangeDetail>): void;
  (e: "vu-collapse-change", payload: CustomEvent<VuNavPanelCollapseChangeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuNavPanelChangeDetail>) =>
      emit("vu-change", event as CustomEvent<VuNavPanelChangeDetail>),
    onVuCollapseChange: (event: CustomEvent<VuNavPanelCollapseChangeDetail>) =>
      emit("vu-collapse-change", event as CustomEvent<VuNavPanelCollapseChangeDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-nav-panel", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
