import { str } from "@lit/localize";
import { msg } from "../../internals/utils/localize.js";
import type { VuNavbarLabels } from "../navbar.types.js";

/** Host surface for localized navbar copy. */
export type NavbarLabelsHost = {
  readonly menubarLabel: string;
  readonly menuLabel: string;
  readonly ariaLabel: string;
  readonly closeLabel: string;
};

/** Builds the localized label bundle consumed by navbar render. */
export function buildNavbarLabels(host: NavbarLabelsHost): VuNavbarLabels {
  return {
    main: msg("Main", {
      id: "nu.navbar.main",
      desc: "Accessible name for the desktop navigation landmark.",
    }),
    menubar:
      host.menubarLabel.trim() ||
      msg("Main navigation", {
        id: "nu.navbar.menubar",
        desc: "Accessible name for the desktop menubar row.",
      }),
    menu:
      host.menuLabel.trim() ||
      msg("Menu", {
        id: "nu.navbar.menu",
        desc: "Accessible name for the mobile menu toggle.",
      }),
    navigation:
      host.ariaLabel.trim() ||
      msg("Navigation", {
        id: "nu.navbar.navigation",
        desc: "Accessible name for the mobile navigation drawer.",
      }),
    close:
      host.closeLabel.trim() ||
      msg("Close", {
        id: "nu.close",
        desc: "Accessible name for a dismiss control.",
      }),
    nestedSubmenu: msg("Nested submenu", {
      id: "nu.navbar.nestedSubmenu",
      desc: "Accessible name for a nested flyout panel.",
    }),
    submenuFor: (id: string) =>
      msg(str`Submenu for ${id}`, {
        id: "nu.navbar.submenuFor",
        desc: "Accessible name for a top-level dropdown panel.",
      }),
  };
}
