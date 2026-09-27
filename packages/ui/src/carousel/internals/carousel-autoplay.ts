import { canUseDocument, isClient, isServer } from "../../internals/utils/env.js";
import { REDUCED_MOTION_QUERY } from "../../internals/utils/motion.js";

export type CarouselAutoplayHost = {
  autoplay: boolean;
  interval: number;
  loop: boolean;
  pauseOnHover: boolean;
  readonly isStatic: boolean;
  readonly clampedIndex: number;
  readonly maxIndex: number;
  next(): void;
};

export type CarouselAutoplayState = {
  timer: ReturnType<typeof setInterval> | null;
  hovered: boolean;
  focused: boolean;
  offscreen: boolean;
  reducedMotionQuery: MediaQueryList | null;
  intersectionObserver: IntersectionObserver | null;
};

export function createCarouselAutoplayState(): CarouselAutoplayState {
  return {
    timer: null,
    hovered: false,
    focused: false,
    offscreen: false,
    reducedMotionQuery: null,
    intersectionObserver: null,
  };
}

export function stopCarouselAutoplay(state: CarouselAutoplayState): void {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
}

export function reconcileCarouselAutoplay(
  state: CarouselAutoplayState,
  host: CarouselAutoplayHost,
): void {
  stopCarouselAutoplay(state);
  if (!host.autoplay) return;
  if (state.reducedMotionQuery?.matches) return;
  if (host.isStatic) return;
  if (state.hovered || state.focused || state.offscreen) return;
  if (canUseDocument() && document.hidden) return;
  if (host.interval <= 0) return;
  state.timer = setInterval(() => {
    if (!host.loop && host.clampedIndex >= host.maxIndex) {
      stopCarouselAutoplay(state);
      return;
    }
    host.next();
  }, host.interval);
}

export function connectCarouselAutoplay(
  host: CarouselAutoplayHost,
  state: CarouselAutoplayState,
  onReducedMotion: () => void,
  onVisibilityChange: () => void,
): void {
  if (isServer) return;

  state.reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  state.reducedMotionQuery.addEventListener("change", onReducedMotion);
  document.addEventListener("visibilitychange", onVisibilityChange);

  if (typeof IntersectionObserver === "undefined") return;
  state.intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      state.offscreen = !entry?.isIntersecting;
      reconcileCarouselAutoplay(state, host);
    },
    { threshold: 0.1 },
  );
  state.intersectionObserver.observe(host as unknown as Element);
}

export function disconnectCarouselAutoplay(
  state: CarouselAutoplayState,
  onReducedMotion: () => void,
  onVisibilityChange: () => void,
): void {
  if (isClient()) {
    state.reducedMotionQuery?.removeEventListener("change", onReducedMotion);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  }
  state.intersectionObserver?.disconnect();
  state.intersectionObserver = null;
  stopCarouselAutoplay(state);
}

export function onCarouselMouseEnter(
  state: CarouselAutoplayState,
  host: CarouselAutoplayHost,
): void {
  if (!host.pauseOnHover) return;
  state.hovered = true;
  reconcileCarouselAutoplay(state, host);
}

export function onCarouselMouseLeave(
  state: CarouselAutoplayState,
  host: CarouselAutoplayHost,
): void {
  if (!host.pauseOnHover) return;
  state.hovered = false;
  reconcileCarouselAutoplay(state, host);
}

export function onCarouselFocusIn(state: CarouselAutoplayState, host: CarouselAutoplayHost): void {
  state.focused = true;
  reconcileCarouselAutoplay(state, host);
}

export function onCarouselFocusOut(
  state: CarouselAutoplayState,
  host: CarouselAutoplayHost,
  relatedTarget: EventTarget | null,
  contains: (node: Node | null) => boolean,
): void {
  if (contains(relatedTarget as Node | null)) return;
  state.focused = false;
  reconcileCarouselAutoplay(state, host);
}
