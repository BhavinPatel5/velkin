<script lang="ts">
export type {
  VuDropdownAlign,
  VuDropdownItemColor,
  VuDropdownOpenChangeDetail,
  VuDropdownPlacement,
  VuDropdownRadius,
  VuDropdownSelectDetail,
  VuDropdownSize,
  VuDropdownTone,
  VuDropdownTrigger,
  VuDropdownVariant,
} from "@velkin/ui/dropdown";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/dropdown";
import {
  VuDropdownAlign,
  VuDropdownItemColor,
  VuDropdownOpenChangeDetail,
  VuDropdownPlacement,
  VuDropdownRadius,
  VuDropdownSelectDetail,
  VuDropdownSize,
  VuDropdownTone,
  VuDropdownTrigger,
  VuDropdownVariant,
} from "@velkin/ui/dropdown";

export interface Props {
  trigger?: VuDropdownTrigger;
  placement?: VuDropdownPlacement;
  align?: VuDropdownAlign;
  open?: boolean;
  value?: string;
  width?: string;
  variant?: VuDropdownVariant;
  tone?: VuDropdownTone;
  size?: VuDropdownSize;
  itemColor?: VuDropdownItemColor;
  radius?: VuDropdownRadius;
  maxHeight?: string;
  closeOnSelect?: boolean;
  offset?: number;
  disabled?: boolean;
}
defineOptions({ name: "Dropdown" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["value"] | undefined>("value", { required: false });
const __velkinM1 = defineModel<Props["open"] | undefined>("open", { required: false });
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
  (e: "vu-open-change", payload: CustomEvent<VuDropdownOpenChangeDetail>): void;
  (e: "vu-select", payload: CustomEvent<VuDropdownSelectDetail>): void;
  (e: "vu-open", payload: CustomEvent<void>): void;
  (e: "vu-close", payload: CustomEvent<void>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuOpenChange: (event: CustomEvent<VuDropdownOpenChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM1.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "open")
          ? ((__d as Record<string, unknown>)["open"] as Props["open"])
          : undefined;
      emit("vu-open-change", event as CustomEvent<VuDropdownOpenChangeDetail>);
    },
    onVuSelect: (event: CustomEvent<VuDropdownSelectDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "value")
          ? ((__d as Record<string, unknown>)["value"] as Props["value"])
          : undefined;
      emit("vu-select", event as CustomEvent<VuDropdownSelectDetail>);
    },
    onVuOpen: (event: CustomEvent<void>) => emit("vu-open", event as CustomEvent<void>),
    onVuClose: (event: CustomEvent<void>) => emit("vu-close", event as CustomEvent<void>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  (props as unknown as Record<string, unknown>)["value"] = __velkinM0.value;
  (props as unknown as Record<string, unknown>)["open"] = __velkinM1.value;

  return h("vu-dropdown", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
