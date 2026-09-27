import type {
  VuNavbarItem,
  VuNavbarItemActivateDetail,
  VuNavbarNavigateDetail,
} from "../navbar.types.js";
import { runNavbarAction } from "./navbar.utils.js";

/** Host surface for item activation and route navigation. */
export type NavbarActivateHost = {
  readonly customEvent: boolean;
  activeRoute: string | null;
  dispatchEvent(event: Event): boolean;
  closeAfterActivate(): void;
};

/** Dispatches vu-navigate and updates activeRoute. */
export function navigateNavbarRoute(host: NavbarActivateHost, route: string): void {
  if (route.startsWith("#") && route.length > 1) {
    document.querySelector(route)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  host.dispatchEvent(
    new CustomEvent<VuNavbarNavigateDetail>("vu-navigate", {
      detail: { route },
      bubbles: true,
      composed: true,
    }),
  );
  host.activeRoute = route;
}

/** Runs action, custom event, route, or href activation for a nav item. */
export function activateNavbarItem(
  host: NavbarActivateHost,
  item: VuNavbarItem,
  path: string | null,
  event?: Event,
): void {
  if (item.action) {
    runNavbarAction(item.action, { item, path, host: host as unknown as HTMLElement, event });
    host.closeAfterActivate();
    return;
  }
  if (host.customEvent) {
    host.dispatchEvent(
      new CustomEvent<VuNavbarItemActivateDetail>("vu-activate", {
        detail: { item, path },
        bubbles: true,
        composed: true,
      }),
    );
    host.closeAfterActivate();
    return;
  }
  if (item.route) {
    navigateNavbarRoute(host, item.route);
    host.closeAfterActivate();
    return;
  }
  if (item.href) {
    host.closeAfterActivate();
    return;
  }
  host.closeAfterActivate();
}
