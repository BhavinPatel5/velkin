<script lang="ts">
export type {
  VuDropdownItemColor,
  VuDropdownItemKind,
  VuDropdownItemSelectDetail,
  VuDropdownItemSize,
} from "@velkin/ui/dropdown-item";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/dropdown-item";
import {
  VuDropdownItemColor,
  VuDropdownItemKind,
  VuDropdownItemSelectDetail,
  VuDropdownItemSize,
} from "@velkin/ui/dropdown-item";

export interface Props {
  value?: string;
  label?: string;
  hint?: string;
  startIcon?: string;
  endIcon?: string;
  shortcut?: string;
  badge?: string;
  href?: string;
  target?: string;
  rel?: string;
  kind?: VuDropdownItemKind;
  checked?: boolean;
  disabled?: boolean;
  selected?: boolean;
  color?: VuDropdownItemColor;
  size?: VuDropdownItemSize;
  menuTabIndex?: number;
}
defineOptions({ name: "DropdownItem" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["selected"] | undefined>("selected", { required: false });
const __velkinM1 = defineModel<Props["checked"] | undefined>("checked", { required: false });
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
  (e: "vu-select", payload: CustomEvent<VuDropdownItemSelectDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuSelect: (event: CustomEvent<VuDropdownItemSelectDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null &&
        typeof __d === "object" &&
        Object.prototype.hasOwnProperty.call(__d, "selected")
          ? ((__d as Record<string, unknown>)["selected"] as Props["selected"])
          : undefined;
      __velkinM1.value =
        __d != null &&
        typeof __d === "object" &&
        Object.prototype.hasOwnProperty.call(__d, "checked")
          ? ((__d as Record<string, unknown>)["checked"] as Props["checked"])
          : undefined;
      emit("vu-select", event as CustomEvent<VuDropdownItemSelectDetail>);
    },
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  (props as unknown as Record<string, unknown>)["selected"] = __velkinM0.value;
  (props as unknown as Record<string, unknown>)["checked"] = __velkinM1.value;

  return h("vu-dropdown-item", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
