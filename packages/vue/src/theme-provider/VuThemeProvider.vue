<script lang="ts">
export type {
  ThemePreference,
  VuThemeConfig,
  VuThemeProviderChangeDetail,
  VuThemeProviderScope,
} from "@velkin/ui/theme-provider";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/theme-provider";
import {
  ThemePreference,
  VuThemeConfig,
  VuThemeProviderChangeDetail,
  VuThemeProviderScope,
} from "@velkin/ui/theme-provider";

export interface Props {
  theme?: VuThemeConfig | undefined;
  scope?: VuThemeProviderScope;
  preference?: ThemePreference;
  persist?: boolean;
  broadcast?: boolean;
  locale?: string;
  injectStyles?: boolean;
  vibrantpalette?: boolean;
  glass?: boolean;
}
defineOptions({ name: "ThemeProvider" });

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
  (e: "vu-theme", payload: CustomEvent<VuThemeProviderChangeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuTheme: (event: CustomEvent<VuThemeProviderChangeDetail>) =>
      emit("vu-theme", event as CustomEvent<VuThemeProviderChangeDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-theme-provider", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
