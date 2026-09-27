<script lang="ts">
export type {
  VuDialogCloseDetail,
  VuDialogRadius,
  VuDialogSize,
  VuDialogVariant,
  VuSurfaceTone,
} from "@velkin/ui/dialog";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/dialog";
import {
  VuDialogCloseDetail,
  VuDialogRadius,
  VuDialogSize,
  VuDialogVariant,
  VuSurfaceTone,
} from "@velkin/ui/dialog";

export interface Props {
  open?: boolean;
  closable?: boolean;
  closeLabel?: string;
  ariaLabel?: string;
  variant?: VuDialogVariant;
  tone?: VuSurfaceTone;
  size?: VuDialogSize;
  radius?: VuDialogRadius;
  divider?: boolean;
  persistent?: boolean;
  closeOnEsc?: boolean;
  maxWidth?: string;
  maxHeight?: string;
}
defineOptions({ name: "Dialog" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["open"] | undefined>("open", { required: false });
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
  (e: "vu-close", payload: CustomEvent<VuDialogCloseDetail>): void;
  (e: "vu-open", payload: CustomEvent<void>): void;
  (e: "vu-afteropen", payload: CustomEvent<void>): void;
  (e: "vu-afterclose", payload: CustomEvent<void>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuClose: (event: CustomEvent<VuDialogCloseDetail>) => {
      __velkinM0.value = false as Props["open"];
      emit("vu-close", event as CustomEvent<VuDialogCloseDetail>);
    },
    onVuOpen: (event: CustomEvent<void>) => emit("vu-open", event as CustomEvent<void>),
    onVuAfteropen: (event: CustomEvent<void>) => emit("vu-afteropen", event as CustomEvent<void>),
    onVuAfterclose: (event: CustomEvent<void>) => emit("vu-afterclose", event as CustomEvent<void>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  (props as unknown as Record<string, unknown>)["open"] = __velkinM0.value;

  return h("vu-dialog", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
