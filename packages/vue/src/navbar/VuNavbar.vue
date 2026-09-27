<script lang="ts">
export type {
  VuNavbarAlign,
  VuNavbarIndicator,
  VuNavbarItem,
  VuNavbarItemActivateDetail,
  VuNavbarMenuTrigger,
  VuNavbarNavigateDetail,
  VuNavbarPlacement,
  VuNavbarSize,
  VuNavbarTone,
  VuNavbarVariant,
} from "@velkin/ui/navbar";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/navbar";
import {
  VuNavbarAlign,
  VuNavbarIndicator,
  VuNavbarItem,
  VuNavbarItemActivateDetail,
  VuNavbarMenuTrigger,
  VuNavbarNavigateDetail,
  VuNavbarPlacement,
  VuNavbarSize,
  VuNavbarTone,
  VuNavbarVariant,
} from "@velkin/ui/navbar";

export interface Props {
  items?: VuNavbarItem[];
  variant?: VuNavbarVariant;
  tone?: VuSurfaceTone;
  size?: VuNavbarSize;
  indicator?: VuNavbarIndicator;
  contained?: boolean;
  activeRoute?: string | null;
  breakpoint?: number;
  isMobile?: boolean;
  overflowThreshold?: number;
  justifyBar?: string;
  justifyBarItems?: string;
  pwaOverlay?: boolean;
  customEvent?: boolean;
  menuTrigger?: VuNavbarMenuTrigger;
  placement?: VuNavbarPlacement;
  align?: VuNavbarAlign;
  offset?: number;
  sticky?: boolean;
  condense?: boolean;
  ariaLabel?: string;
  menuLabel?: string;
  closeLabel?: string;
  menubarLabel?: string;
}
defineOptions({ name: "Navbar" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["activeRoute"] | undefined>("activeRoute", {
  required: false,
});
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
  (e: "vu-navigate", payload: CustomEvent<VuNavbarNavigateDetail>): void;
  (e: "vu-activate", payload: CustomEvent<VuNavbarItemActivateDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuNavigate: (event: CustomEvent<VuNavbarNavigateDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "route")
          ? ((__d as Record<string, unknown>)["route"] as Props["activeRoute"])
          : undefined;
      emit("vu-navigate", event as CustomEvent<VuNavbarNavigateDetail>);
    },
    onVuActivate: (event: CustomEvent<VuNavbarItemActivateDetail>) =>
      emit("vu-activate", event as CustomEvent<VuNavbarItemActivateDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  (props as unknown as Record<string, unknown>)["activeRoute"] = __velkinM0.value;

  return h("vu-navbar", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
