import type {
  CloseReason,
  MaxWidthMode,
  PopoverAlign,
  PopoverPlacement,
  PopoverPreset,
} from "../internals/controllers/popover-controller.js";

export type VuPopoverAnchorScope = "document" | "root";

export type VuPopoverPlacement = PopoverPlacement;

export type VuPopoverAlign = PopoverAlign;

export type VuPopoverPreset = PopoverPreset;

export type VuPopoverMaxWidthMode = MaxWidthMode;

export type VuPopoverFlipSide = "top" | "bottom" | "left" | "right";

/** Anchor selector, element, or framework ref object. */
export type VuPopoverAnchor =
  string | HTMLElement | { value?: HTMLElement | null } | null | undefined;

export type VuPopoverOpenChangeDetail = {
  open: boolean;
  reason: CloseReason;
};
