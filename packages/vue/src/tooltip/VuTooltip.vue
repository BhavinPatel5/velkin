<script lang="ts">
export type {
  PopoverAlign,
  PopoverPlacement,
  VuTooltipOpenChangeDetail,
  VuTooltipRadius,
  VuTooltipSize,
  VuTooltipTone,
  VuTooltipTrigger,
  VuTooltipVariant,
} from "@velkin/ui/tooltip";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/tooltip";
import {
  PopoverAlign,
  PopoverPlacement,
  VuTooltipOpenChangeDetail,
  VuTooltipRadius,
  VuTooltipSize,
  VuTooltipTone,
  VuTooltipTrigger,
  VuTooltipVariant,
} from "@velkin/ui/tooltip";

export interface Props {
  open?: boolean;
  placement?: PopoverPlacement;
  align?: PopoverAlign;
  trigger?: VuTooltipTrigger;
  label?: string;
  variant?: VuTooltipVariant;
  tone?: VuTooltipTone;
  size?: VuTooltipSize;
  radius?: VuTooltipRadius;
  arrow?: boolean;
  interactive?: boolean;
  noAutoTrigger?: boolean;
  delay?: number | undefined;
  closeDelay?: number | undefined;
  offset?: number;
  block?: boolean;
}
defineOptions({ name: "Tooltip" });

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
  (e: "vu-open", payload: CustomEvent<void>): void;
  (e: "vu-close", payload: CustomEvent<void>): void;
  (e: "vu-open-change", payload: CustomEvent<VuTooltipOpenChangeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuOpen: (event: CustomEvent<void>) => emit("vu-open", event as CustomEvent<void>),
    onVuClose: (event: CustomEvent<void>) => emit("vu-close", event as CustomEvent<void>),
    onVuOpenChange: (event: CustomEvent<VuTooltipOpenChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "open")
          ? ((__d as Record<string, unknown>)["open"] as Props["open"])
          : undefined;
      emit("vu-open-change", event as CustomEvent<VuTooltipOpenChangeDetail>);
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

  (props as unknown as Record<string, unknown>)["open"] = __velkinM0.value;

  return h("vu-tooltip", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
