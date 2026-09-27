/** Host surface for sticky / condense scroll pinning. */
export type NavbarStickyHost = {
  readonly sticky: boolean;
  readonly condense: boolean;
  setStuck(stuck: boolean): void;
};

export type NavbarStickyHandle = {
  disconnect: () => void;
};

/** Observes scroll past the host to toggle condensed bar styling when `sticky` + `condense`. */
export function setupNavbarStickyObserver(
  host: NavbarStickyHost,
  root: HTMLElement,
): NavbarStickyHandle | null {
  if (!host.sticky || !host.condense || typeof IntersectionObserver === "undefined") {
    return null;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      host.setStuck(!entry?.isIntersecting);
    },
    { threshold: [1] },
  );
  observer.observe(root);
  return { disconnect: () => observer.disconnect() };
}
