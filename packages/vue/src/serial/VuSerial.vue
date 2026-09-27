<script lang="ts">
export type {
  VuSerialChangeDetail,
  VuSerialClearDetail,
  VuSerialInvalidDetail,
  VuSerialRadius,
  VuSerialSize,
  VuSerialTone,
  VuSerialVariant,
} from "@velkin/ui/serial";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/serial";
import {
  VuSerialChangeDetail,
  VuSerialClearDetail,
  VuSerialInvalidDetail,
  VuSerialRadius,
  VuSerialSize,
  VuSerialTone,
  VuSerialVariant,
} from "@velkin/ui/serial";

export interface Props {
  variant?: VuSerialVariant;
  tone?: VuSerialTone;
  size?: VuSerialSize;
  radius?: VuSerialRadius;
  block?: boolean;
  compact?: boolean;
  length?: number;
  separator?: string;
  separatorPositions?: number[];
  alphanumeric?: boolean;
  value?: string;
  withSeparator?: boolean;
  masked?: boolean;
  label?: string;
  hint?: string;
  incompleteMessage?: string;
  ariaLabel?: string;
  id?: string;
  showErrors?: boolean;
  validationActive?: boolean;
  invalid?: boolean;
}
defineOptions({ name: "Serial" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["value"] | undefined>("value", { required: false });
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
  (e: "vu-change", payload: CustomEvent<VuSerialChangeDetail>): void;
  (e: "vu-invalid", payload: CustomEvent<VuSerialInvalidDetail>): void;
  (e: "vu-clear", payload: CustomEvent<VuSerialClearDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuSerialChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "value")
          ? ((__d as Record<string, unknown>)["value"] as Props["value"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuSerialChangeDetail>);
    },
    onVuInvalid: (event: CustomEvent<VuSerialInvalidDetail>) =>
      emit("vu-invalid", event as CustomEvent<VuSerialInvalidDetail>),
    onVuClear: (event: CustomEvent<VuSerialClearDetail>) =>
      emit("vu-clear", event as CustomEvent<VuSerialClearDetail>),
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

  return h("vu-serial", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
