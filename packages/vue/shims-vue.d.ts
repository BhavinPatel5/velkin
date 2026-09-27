declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@lit-labs/vue-utils/wrapper-utils.js" {
  export const assignSlotNodes: any;
  export type Slots = any;
}
