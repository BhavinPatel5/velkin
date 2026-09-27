<script lang="ts">
export type {
  VuSurfaceTone,
  VuSwitchChangeDetail,
  VuSwitchColor,
  VuSwitchSize,
  VuSwitchValueClearedDetail,
  VuSwitchVariant,
} from "@velkin/ui/switch";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/switch";
import {
  VuSurfaceTone,
  VuSwitchChangeDetail,
  VuSwitchColor,
  VuSwitchSize,
  VuSwitchValueClearedDetail,
  VuSwitchVariant,
} from "@velkin/ui/switch";

export interface Props {
  label?: string;
  hint?: string;
  id?: string;
  value?: string;
  color?: VuSwitchColor;
  tone?: VuSurfaceTone;
  size?: VuSwitchSize;
  variant?: VuSwitchVariant;
  ariaLabel?: string;
  compact?: boolean;
  defaultChecked?: boolean;
  showErrors?: boolean;
  validationActive?: boolean;
  invalid?: boolean;
  checked?: boolean;
}
defineOptions({ name: "Switch" });

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
  (e: "vu-change", payload: CustomEvent<VuSwitchChangeDetail>): void;
  (e: "vu-invalid", payload: CustomEvent<VuSwitchValidationErrorDetail>): void;
  (e: "vu-clear", payload: CustomEvent<VuSwitchValueClearedDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuSwitchChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null &&
        typeof __d === "object" &&
        Object.prototype.hasOwnProperty.call(__d, "checked")
          ? ((__d as Record<string, unknown>)["checked"] as Props["checked"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuSwitchChangeDetail>);
    },
    onVuInvalid: (event: CustomEvent<VuSwitchValidationErrorDetail>) =>
      emit("vu-invalid", event as CustomEvent<VuSwitchValidationErrorDetail>),
    onVuClear: (event: CustomEvent<VuSwitchValueClearedDetail>) =>
      emit("vu-clear", event as CustomEvent<VuSwitchValueClearedDetail>),
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

  return h("vu-switch", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
