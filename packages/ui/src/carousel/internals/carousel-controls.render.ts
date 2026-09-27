import { html, nothing, type TemplateResult } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { ICONS } from "../../internals/icon.js";
import { msg, str } from "../../internals/utils/localize.js";
import type { VuCarouselControls, VuCarouselOrientation } from "../carousel.types.js";

export type CarouselControlsRenderContext = {
  controls: VuCarouselControls;
  orientation: VuCarouselOrientation;
  index: number;
  maxIndex: number;
  loop: boolean;
  slidesPerView: number;
  slidesToScroll: number;
  slideCount: number;
  isStatic: boolean;
  loading: boolean;
  prevLabel: string;
  nextLabel: string;
  dotsLabel: string;
  prev(): void;
  next(): void;
  goTo(target: number): void;
};

export function carouselLiveText(ctx: CarouselControlsRenderContext): string {
  if (!ctx.slideCount) return "";
  if (ctx.slidesPerView > 1) {
    return String(
      msg(
        str`Slide ${ctx.index + 1} to ${Math.min(ctx.index + ctx.slidesPerView, ctx.slideCount)} of ${ctx.slideCount}`,
        { desc: "Live region when multiple slides are visible." },
      ),
    );
  }
  return String(
    msg(str`Slide ${ctx.index + 1} of ${ctx.slideCount}`, {
      desc: "Live region announcing the active carousel slide.",
    }),
  );
}

export function renderCarouselArrows(
  ctx: CarouselControlsRenderContext,
): TemplateResult | typeof nothing {
  const showArrows = ctx.controls === "arrows" || ctx.controls === "both";
  if (!showArrows) return nothing;

  const atStart = !ctx.loop && ctx.index <= 0;
  const atEnd = !ctx.loop && ctx.index >= ctx.maxIndex;

  return html`
    <button
      type="button"
      part="prev"
      aria-label=${
        ctx.prevLabel.trim() ||
        msg("Previous slide", {
          desc: "Accessible name for the previous-slide control.",
        })
      }
      ?disabled=${atStart || ctx.isStatic}
      @click=${ctx.prev}
    >
      <slot name="prev-icon">
        <vu-icon
          icon=${ctx.orientation === "horizontal" ? ICONS.chevronLeft : ICONS.chevronUp}
          aria-hidden="true"
        ></vu-icon>
      </slot>
    </button>
    <button
      type="button"
      part="next"
      aria-label=${
        ctx.nextLabel.trim() ||
        msg("Next slide", {
          desc: "Accessible name for the next-slide control.",
        })
      }
      ?disabled=${atEnd || ctx.isStatic}
      @click=${ctx.next}
    >
      <slot name="next-icon">
        <vu-icon
          icon=${ctx.orientation === "horizontal" ? ICONS.chevronRight : ICONS.chevronDown}
          aria-hidden="true"
        ></vu-icon>
      </slot>
    </button>
  `;
}

export function renderCarouselDots(
  ctx: CarouselControlsRenderContext,
): TemplateResult | typeof nothing {
  const showDots = ctx.controls === "dots" || ctx.controls === "both";
  if (!showDots || ctx.isStatic) return nothing;

  const dotCount = Math.max(1, Math.ceil((ctx.maxIndex + 1) / Math.max(1, ctx.slidesToScroll)));
  const dotIndices = Array.from({ length: dotCount }, (_, i) => i);

  return html`
    <div
      part="dots"
      role="tablist"
      aria-label=${
        ctx.dotsLabel.trim() ||
        msg("Choose slide", {
          desc: "Accessible name for the carousel dot indicators.",
        })
      }
    >
      ${repeat(
        dotIndices,
        (i) => i,
        (i) => {
          const target = i * ctx.slidesToScroll;
          const active = ctx.index === target;
          return html`
            <button
              type="button"
              part=${active ? "dot dot-active" : "dot"}
              role="tab"
              aria-label=${msg(str`Go to slide ${i + 1}`, {
                desc: "Accessible name for a carousel dot indicator.",
              })}
              aria-current=${active ? "true" : "false"}
              @click=${() => ctx.goTo(target)}
            ></button>
          `;
        },
      )}
    </div>
  `;
}

export function renderCarouselLive(ctx: CarouselControlsRenderContext): TemplateResult {
  return html`
    <div part="live" aria-live="polite" aria-atomic="true">${carouselLiveText(ctx)}</div>
  `;
}
