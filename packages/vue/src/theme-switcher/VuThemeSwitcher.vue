<script lang="ts">
export type {
  VuThemeSwitcherColor,
  VuThemeSwitcherRadius,
  VuThemeSwitcherSize,
  VuThemeSwitcherType,
  VuThemeSwitcherVariant,
} from "@velkin/ui/theme-switcher";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/theme-switcher";
import {
  VuThemeSwitcherColor,
  VuThemeSwitcherRadius,
  VuThemeSwitcherSize,
  VuThemeSwitcherType,
  VuThemeSwitcherVariant,
} from "@velkin/ui/theme-switcher";

export interface Props {
  darkIcon?: string;
  lightIcon?: string;
  systemIcon?: string;
  type?: VuThemeSwitcherType;
  color?: VuButtonColor;
  disabled?: boolean;
  size?: VuButtonSize;
  variant?: VuButtonVariant;
  radius?: VuThemeSwitcherRadius;
  iconOnly?: boolean;
}
defineOptions({ name: "ThemeSwitcher" });

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
  (e: "vu-theme", payload: CustomEvent<VuThemeSwitcherChangeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuTheme: (event: CustomEvent<VuThemeSwitcherChangeDetail>) =>
      emit("vu-theme", event as CustomEvent<VuThemeSwitcherChangeDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-theme-switcher", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
