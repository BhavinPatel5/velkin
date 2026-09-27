<script lang="ts">
export type {
  VuComboboxAddDetail,
  VuComboboxChangeDetail,
  VuComboboxInputDetail,
  VuComboboxInvalidDetail,
  VuComboboxOption,
  VuComboboxRadius,
  VuComboboxRendererFn,
  VuComboboxSize,
  VuComboboxTone,
  VuComboboxValue,
  VuComboboxVariant,
} from "@velkin/ui/combobox";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/combobox";
import {
  VuComboboxAddDetail,
  VuComboboxChangeDetail,
  VuComboboxInputDetail,
  VuComboboxInvalidDetail,
  VuComboboxOption,
  VuComboboxRadius,
  VuComboboxRendererFn,
  VuComboboxSize,
  VuComboboxTone,
  VuComboboxValue,
  VuComboboxVariant,
} from "@velkin/ui/combobox";

export interface Props {
  variant?: VuFieldVariant;
  tone?: VuSurfaceTone;
  size?: VuComboboxSize;
  radius?: VuComboboxRadius;
  block?: boolean;
  value?: VuComboboxValue;
  placeholder?: string;
  label?: string;
  hint?: string;
  options?: VuComboboxOption[];
  renderer?: VuComboboxRendererFn | null;
  clearable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  visibleChips?: number;
  showErrors?: boolean;
  required?: boolean;
  addOption?: boolean;
  requiredMessage?: string;
  id?: string;
  ariaLabel?: string;
  readonly?: boolean;
  validationActive?: boolean;
  invalid?: boolean;
  query?: string;
}
defineOptions({ name: "Combobox" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["value"] | undefined>("value", { required: false });
const __velkinM1 = defineModel<Props["query"] | undefined>("query", { required: false });
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
  (e: "vu-change", payload: CustomEvent<VuComboboxChangeDetail>): void;
  (e: "vu-input", payload: CustomEvent<VuComboboxInputDetail>): void;
  (e: "vu-invalid", payload: CustomEvent<VuComboboxInvalidDetail>): void;
  (e: "vu-add", payload: CustomEvent<VuComboboxAddDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuComboboxChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "value")
          ? ((__d as Record<string, unknown>)["value"] as Props["value"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuComboboxChangeDetail>);
    },
    onVuInput: (event: CustomEvent<VuComboboxInputDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM1.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "query")
          ? ((__d as Record<string, unknown>)["query"] as Props["query"])
          : undefined;
      emit("vu-input", event as CustomEvent<VuComboboxInputDetail>);
    },
    onVuInvalid: (event: CustomEvent<VuComboboxInvalidDetail>) =>
      emit("vu-invalid", event as CustomEvent<VuComboboxInvalidDetail>),
    onVuAdd: (event: CustomEvent<VuComboboxAddDetail>) =>
      emit("vu-add", event as CustomEvent<VuComboboxAddDetail>),
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
  (props as unknown as Record<string, unknown>)["query"] = __velkinM1.value;

  return h("vu-combobox", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
