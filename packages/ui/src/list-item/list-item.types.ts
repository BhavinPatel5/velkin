/** Row density preset. */
export type VuListitemSize = "sm" | "md" | "lg";

/** Payload for `vu-activate` on `<vu-listitem>`. */
export type VuListitemActivateDetail = {
  item: import("./list-item.js").VuListitem;
};
