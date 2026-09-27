<script lang="ts">
export type {
  VuRadioColor,
  VuRadioSize,
  VuRadioValueClearedDetail,
  VuRadioVariant,
  VuSurfaceTone,
} from "@velkin/ui/radio";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/radio";
import {
  VuRadioColor,
  VuRadioSize,
  VuRadioValueClearedDetail,
  VuRadioVariant,
  VuSurfaceTone,
} from "@velkin/ui/radio";

export interface Props {
  label?: string;
  hint?: string;
  id?: string;
  value?: string;
  color?: VuRadioColor;
  tone?: VuSurfaceTone;
  size?: VuRadioSize;
  variant?: VuRadioVariant;
  ariaLabel?: string;
  compact?: boolean;
  defaultChecked?: boolean;
  showErrors?: boolean;
  validationActive?: boolean;
  invalid?: boolean;
  checked?: boolean;
}
defineOptions({ name: "Radio" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["checked"] | undefined>("checked", { required: false });
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
  (e: "vu-change", payload: CustomEvent<VuRadioChangeDetail>): void;
  (e: "vu-invalid", payload: CustomEvent<VuRadioValidationErrorDetail>): void;
  (e: "vu-clear", payload: CustomEvent<VuRadioValueClearedDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuRadioChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null &&
        typeof __d === "object" &&
        Object.prototype.hasOwnProperty.call(__d, "checked")
          ? ((__d as Record<string, unknown>)["checked"] as Props["checked"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuRadioChangeDetail>);
    },
    onVuInvalid: (event: CustomEvent<VuRadioValidationErrorDetail>) =>
      emit("vu-invalid", event as CustomEvent<VuRadioValidationErrorDetail>),
    onVuClear: (event: CustomEvent<VuRadioValueClearedDetail>) =>
      emit("vu-clear", event as CustomEvent<VuRadioValueClearedDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  (props as unknown as Record<string, unknown>)["checked"] = __velkinM0.value;

  return h("vu-radio", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
