import type { VuCarouselOrientation } from "../carousel.types.js";
import { carouselDragDirection } from "./carousel-slides.js";

export type CarouselDragHost = {
  orientation: VuCarouselOrientation;
  readonly isStatic: boolean;
  _viewport: HTMLElement | null;
  _isDragging: boolean;
  _dragOffset: number;
  _dragPointerId: number | null;
  _dragStartX: number;
  _dragStartY: number;
  prev(): void;
  next(): void;
  requestUpdate(): void;
};

export function onCarouselPointerDown(
  host: CarouselDragHost,
  event: PointerEvent,
  isControlTarget: (path: EventTarget[]) => boolean,
): void {
  if (event.button !== 0) return;
  if (isControlTarget(event.composedPath())) return;
  if (host.isStatic) return;

  host._dragPointerId = event.pointerId;
  host._dragStartX = event.clientX;
  host._dragStartY = event.clientY;
  host._dragOffset = 0;
  host._isDragging = true;
  host._viewport?.setPointerCapture?.(event.pointerId);
  host.requestUpdate();
}

export function onCarouselPointerMove(host: CarouselDragHost, event: PointerEvent): void {
  if (!host._isDragging || event.pointerId !== host._dragPointerId) return;
  host._dragOffset =
    host.orientation === "horizontal"
      ? event.clientX - host._dragStartX
      : event.clientY - host._dragStartY;
  host.requestUpdate();
}

export function onCarouselPointerUp(host: CarouselDragHost, event: PointerEvent): void {
  if (!host._isDragging || event.pointerId !== host._dragPointerId) return;
  const delta = host._dragOffset;
  host._isDragging = false;
  host._dragOffset = 0;
  host._dragPointerId = null;
  host._viewport?.releasePointerCapture?.(event.pointerId);

  const nav = carouselDragDirection(delta);
  if (nav === "prev") host.prev();
  else if (nav === "next") host.next();
  host.requestUpdate();
}

export function onCarouselPointerCancel(host: CarouselDragHost, event: PointerEvent): void {
  if (event.pointerId !== host._dragPointerId) return;
  host._isDragging = false;
  host._dragOffset = 0;
  host._dragPointerId = null;
  host.requestUpdate();
}

export function syncCarouselDragTransform(host: CarouselDragHost, track: HTMLElement | null): void {
  if (host._isDragging) {
    const axis = host.orientation === "horizontal" ? "X" : "Y";
    track?.style.setProperty(
      "transform",
      `translate${axis}(calc(-1 * var(--carousel-index) * (var(--carousel-slide-basis) + var(--carousel-gap)) + ${host._dragOffset}px))`,
    );
  } else {
    track?.style.removeProperty("transform");
  }
}
