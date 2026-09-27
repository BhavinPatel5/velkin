import type { PopoverPreset, PopoverPresetConfig, PopoverSide } from "./popover-controller.js";
import { MOTION_SPRING } from "../utils/motion.js";

/** Shared easing curves for overlay motion. */
const EASE = {
  materialEnter: "cubic-bezier(0.2, 0, 0, 1)",
  materialExit: "cubic-bezier(0.4, 0, 1, 1)",
  materialEmphasized: "cubic-bezier(0.05, 0.7, 0.1, 1)",
  iosStandard: "cubic-bezier(0.32, 0.72, 0, 1)",
  iosAccelerate: "cubic-bezier(0.4, 0, 1, 1)",
  smoothOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  expoOut: "cubic-bezier(0.23, 1, 0.32, 1)",
  sharpIn: "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
  springSoft: MOTION_SPRING.soft,
  springPop: MOTION_SPRING.pop,
  springExit: MOTION_SPRING.exit,
} as const;

/** Preset-native durations before theme scaling. */
const DUR = {
  snappy: { enter: 160, exit: 120 },
  standard: { enter: 220, exit: 160 },
  menu: { enter: 200, exit: 140 },
  relaxed: { enter: 260, exit: 180 },
  glide: { enter: 300, exit: 200 },
  sheet: { enter: 280, exit: 200 },
} as const;

type PresetDef = {
  name: PopoverPreset;
  defaults: Required<PopoverPresetConfig>;
  getKeyframes: (args: {
    side: PopoverSide;
    phase: "open" | "close";
    cfg: Required<PopoverPresetConfig>;
    origin: string;
  }) => Keyframe[];
};

/** Side-aware offset for enter/exit along the placement axis. */
export function popoverVec(side: PopoverSide, px: number): { x: number; y: number } {
  if (side === "top") return { x: 0, y: px };
  if (side === "bottom") return { x: 0, y: -px };
  if (side === "left") return { x: px, y: 0 };
  return { x: -px, y: 0 };
}

type KfOpts = { filter?: string; offset?: number };

/** WAAPI keyframe with explicit opacity (required for smooth compositing). */
export function popoverKf(opacity: number, transform: string, options?: KfOpts): Keyframe {
  const frame: Keyframe = { opacity, transform };
  if (options?.filter) frame.filter = options.filter;
  if (options?.offset !== undefined) frame.offset = options.offset;
  return frame;
}

function flipAxis(side: PopoverSide): "X" | "Y" {
  return side === "left" || side === "right" ? "Y" : "X";
}

function flipSign(side: PopoverSide): 1 | -1 {
  return side === "top" || side === "left" ? 1 : -1;
}

function slideKeyframes(
  phase: "open" | "close",
  side: PopoverSide,
  cfg: Required<PopoverPresetConfig>,
  scale = 1,
  blur?: { in: number; out: number },
): Keyframe[] {
  const enter = popoverVec(side, cfg.enterPx);
  const exit = popoverVec(side, cfg.exitPx);
  const enterScale = scale === 1 ? "" : ` scale(${cfg.enterScale})`;
  const exitScale = scale === 1 ? "" : ` scale(${cfg.exitScale})`;
  const endScale = scale === 1 ? "" : " scale(1)";

  if (phase === "open") {
    return [
      popoverKf(
        0,
        `translate3d(${enter.x}px, ${enter.y}px, 0)${enterScale}`,
        blur ? { filter: `blur(${blur.in}px)` } : undefined,
      ),
      popoverKf(1, `translate3d(0, 0, 0)${endScale}`, blur ? { filter: "blur(0px)" } : undefined),
    ];
  }

  return [
    popoverKf(1, `translate3d(0, 0, 0)${endScale}`, blur ? { filter: "blur(0px)" } : undefined),
    popoverKf(
      0,
      `translate3d(${exit.x}px, ${exit.y}px, 0)${exitScale}`,
      blur ? { filter: `blur(${blur.out}px)` } : undefined,
    ),
  ];
}

function scaleKeyframes(
  phase: "open" | "close",
  cfg: Required<PopoverPresetConfig>,
  withOpacity = true,
): Keyframe[] {
  if (phase === "open") {
    return [popoverKf(withOpacity ? 0 : 1, `scale(${cfg.enterScale})`), popoverKf(1, "scale(1)")];
  }
  return [popoverKf(1, "scale(1)"), popoverKf(withOpacity ? 0 : 1, `scale(${cfg.exitScale})`)];
}

/** Full popover animation preset registry. */
export const POPOVER_PRESET_REGISTRY: Record<PopoverPreset, PresetDef> = {
  none: {
    name: "none",
    defaults: {
      enterPx: 0,
      exitPx: 0,
      enterScale: 1,
      exitScale: 1,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "auto",
      easingOpen: EASE.smoothOut,
      easingClose: EASE.materialExit,
      enterDuration: DUR.snappy.enter,
      exitDuration: DUR.snappy.exit,
    },
    getKeyframes: () => [popoverKf(1, "translate3d(0, 0, 0)")],
  },

  fade: {
    name: "fade",
    defaults: {
      enterPx: 0,
      exitPx: 0,
      enterScale: 0.98,
      exitScale: 0.99,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "center",
      easingOpen: EASE.smoothOut,
      easingClose: EASE.materialExit,
      enterDuration: DUR.standard.enter,
      exitDuration: DUR.standard.exit,
    },
    getKeyframes: ({ phase, cfg }) =>
      phase === "open"
        ? [popoverKf(0, `scale(${cfg.enterScale})`), popoverKf(1, "scale(1)")]
        : [popoverKf(1, "scale(1)"), popoverKf(0, `scale(${cfg.exitScale})`)],
  },

  scale: {
    name: "scale",
    defaults: {
      enterPx: 0,
      exitPx: 0,
      enterScale: 0.92,
      exitScale: 0.96,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "corner",
      easingOpen: EASE.springSoft,
      easingClose: EASE.springExit,
      enterDuration: DUR.menu.enter,
      exitDuration: DUR.menu.exit,
    },
    getKeyframes: ({ phase, cfg }) => scaleKeyframes(phase, cfg),
  },

  slide: {
    name: "slide",
    defaults: {
      enterPx: 10,
      exitPx: 6,
      enterScale: 1,
      exitScale: 1,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "auto",
      easingOpen: EASE.expoOut,
      easingClose: EASE.sharpIn,
      enterDuration: DUR.relaxed.enter,
      exitDuration: DUR.relaxed.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => slideKeyframes(phase, side, cfg),
  },

  iosMenu: {
    name: "iosMenu",
    defaults: {
      enterPx: 8,
      exitPx: 5,
      enterScale: 0.94,
      exitScale: 0.97,
      blurInPx: 4,
      blurOutPx: 2,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "auto",
      easingOpen: EASE.iosStandard,
      easingClose: EASE.iosAccelerate,
      enterDuration: DUR.menu.enter,
      exitDuration: DUR.menu.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      return phase === "open"
        ? [
            popoverKf(0, `translate3d(${enter.x}px, ${enter.y}px, 0) scale(${cfg.enterScale})`, {
              filter: `blur(${cfg.blurInPx}px)`,
            }),
            popoverKf(1, "translate3d(0, 0, 0) scale(1)", { filter: "blur(0px)" }),
          ]
        : [
            popoverKf(1, "translate3d(0, 0, 0) scale(1)", { filter: "blur(0px)" }),
            popoverKf(0, `translate3d(${exit.x}px, ${exit.y}px, 0) scale(${cfg.exitScale})`, {
              filter: `blur(${cfg.blurOutPx}px)`,
            }),
          ];
    },
  },

  iosSheet: {
    name: "iosSheet",
    defaults: {
      enterPx: 24,
      exitPx: 16,
      enterScale: 1,
      exitScale: 1,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "auto",
      easingOpen: EASE.iosStandard,
      easingClose: EASE.iosAccelerate,
      enterDuration: DUR.sheet.enter,
      exitDuration: DUR.sheet.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => slideKeyframes(phase, side, cfg),
  },

  materialMenu: {
    name: "materialMenu",
    defaults: {
      enterPx: 6,
      exitPx: 4,
      enterScale: 0.92,
      exitScale: 0.96,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "corner",
      easingOpen: EASE.materialEmphasized,
      easingClose: EASE.materialExit,
      enterDuration: DUR.menu.enter,
      exitDuration: DUR.menu.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      return phase === "open"
        ? [
            popoverKf(0, `translate3d(${enter.x}px, ${enter.y}px, 0) scale(${cfg.enterScale})`),
            popoverKf(1, "translate3d(0, 0, 0) scale(1)"),
          ]
        : [
            popoverKf(1, "translate3d(0, 0, 0) scale(1)"),
            popoverKf(0, `translate3d(${exit.x}px, ${exit.y}px, 0) scale(${cfg.exitScale})`),
          ];
    },
  },

  materialSheet: {
    name: "materialSheet",
    defaults: {
      enterPx: 20,
      exitPx: 14,
      enterScale: 1,
      exitScale: 1,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "auto",
      easingOpen: EASE.materialEmphasized,
      easingClose: EASE.materialExit,
      enterDuration: DUR.sheet.enter,
      exitDuration: DUR.sheet.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => slideKeyframes(phase, side, cfg),
  },

  floaty: {
    name: "floaty",
    defaults: {
      enterPx: 14,
      exitPx: 10,
      enterScale: 0.96,
      exitScale: 0.98,
      blurInPx: 8,
      blurOutPx: 4,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "center",
      easingOpen: EASE.smoothOut,
      easingClose: EASE.materialExit,
      enterDuration: DUR.relaxed.enter,
      exitDuration: DUR.relaxed.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      return phase === "open"
        ? [
            popoverKf(0, `translate3d(${enter.x}px, ${enter.y}px, 0) scale(${cfg.enterScale})`, {
              filter: `blur(${cfg.blurInPx}px)`,
            }),
            popoverKf(1, "translate3d(0, 0, 0) scale(1)", { filter: "blur(0px)" }),
          ]
        : [
            popoverKf(1, "translate3d(0, 0, 0) scale(1)", { filter: "blur(0px)" }),
            popoverKf(0, `translate3d(${exit.x}px, ${exit.y}px, 0) scale(${cfg.exitScale})`, {
              filter: `blur(${cfg.blurOutPx}px)`,
            }),
          ];
    },
  },

  soft: {
    name: "soft",
    defaults: {
      enterPx: 8,
      exitPx: 5,
      enterScale: 0.97,
      exitScale: 0.98,
      blurInPx: 3,
      blurOutPx: 2,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "center",
      easingOpen: EASE.smoothOut,
      easingClose: EASE.materialExit,
      enterDuration: DUR.standard.enter,
      exitDuration: DUR.standard.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      return phase === "open"
        ? [
            popoverKf(0, `translate3d(${enter.x}px, ${enter.y}px, 0) scale(${cfg.enterScale})`, {
              filter: `blur(${cfg.blurInPx}px)`,
            }),
            popoverKf(1, "translate3d(0, 0, 0) scale(1)", { filter: "blur(0px)" }),
          ]
        : [
            popoverKf(1, "translate3d(0, 0, 0) scale(1)", { filter: "blur(0px)" }),
            popoverKf(0, `translate3d(${exit.x}px, ${exit.y}px, 0) scale(${cfg.exitScale})`, {
              filter: `blur(${cfg.blurOutPx}px)`,
            }),
          ];
    },
  },

  sharp: {
    name: "sharp",
    defaults: {
      enterPx: 6,
      exitPx: 4,
      enterScale: 0.97,
      exitScale: 0.98,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "corner",
      easingOpen: EASE.materialEnter,
      easingClose: EASE.materialExit,
      enterDuration: DUR.snappy.enter,
      exitDuration: DUR.snappy.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      return phase === "open"
        ? [
            popoverKf(0, `translate3d(${enter.x}px, ${enter.y}px, 0) scale(${cfg.enterScale})`),
            popoverKf(1, "translate3d(0, 0, 0) scale(1)"),
          ]
        : [
            popoverKf(1, "translate3d(0, 0, 0) scale(1)"),
            popoverKf(0, `translate3d(${exit.x}px, ${exit.y}px, 0) scale(${cfg.exitScale})`),
          ];
    },
  },

  blurIn: {
    name: "blurIn",
    defaults: {
      enterPx: 0,
      exitPx: 0,
      enterScale: 0.99,
      exitScale: 1,
      blurInPx: 14,
      blurOutPx: 8,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "center",
      easingOpen: EASE.smoothOut,
      easingClose: EASE.materialExit,
      enterDuration: DUR.standard.enter,
      exitDuration: DUR.standard.exit,
    },
    getKeyframes: ({ phase, cfg }) =>
      phase === "open"
        ? [
            popoverKf(0, "translate3d(0, 0, 0) scale(0.99)", { filter: `blur(${cfg.blurInPx}px)` }),
            popoverKf(1, "translate3d(0, 0, 0) scale(1)", { filter: "blur(0px)" }),
          ]
        : [
            popoverKf(1, "translate3d(0, 0, 0) scale(1)", { filter: "blur(0px)" }),
            popoverKf(0, "translate3d(0, 0, 0) scale(0.99)", {
              filter: `blur(${cfg.blurOutPx}px)`,
            }),
          ],
  },

  blurFade: {
    name: "blurFade",
    defaults: {
      enterPx: 8,
      exitPx: 6,
      enterScale: 0.99,
      exitScale: 0.99,
      blurInPx: 10,
      blurOutPx: 6,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "center",
      easingOpen: EASE.smoothOut,
      easingClose: EASE.materialExit,
      enterDuration: DUR.relaxed.enter,
      exitDuration: DUR.relaxed.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      return phase === "open"
        ? [
            popoverKf(0, `translate3d(${enter.x}px, ${enter.y}px, 0)`, {
              filter: `blur(${cfg.blurInPx}px)`,
            }),
            popoverKf(1, "translate3d(0, 0, 0)", { filter: "blur(0px)" }),
          ]
        : [
            popoverKf(1, "translate3d(0, 0, 0)", { filter: "blur(0px)" }),
            popoverKf(0, `translate3d(${exit.x}px, ${exit.y}px, 0)`, {
              filter: `blur(${cfg.blurOutPx}px)`,
            }),
          ];
    },
  },

  zoomFromAnchor: {
    name: "zoomFromAnchor",
    defaults: {
      enterPx: 4,
      exitPx: 3,
      enterScale: 0.9,
      exitScale: 0.95,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "anchor",
      easingOpen: EASE.springSoft,
      easingClose: EASE.materialExit,
      enterDuration: DUR.menu.enter,
      exitDuration: DUR.menu.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      return phase === "open"
        ? [
            popoverKf(0, `translate3d(${enter.x}px, ${enter.y}px, 0) scale(${cfg.enterScale})`),
            popoverKf(1, "translate3d(0, 0, 0) scale(1)"),
          ]
        : [
            popoverKf(1, "translate3d(0, 0, 0) scale(1)"),
            popoverKf(0, `translate3d(${exit.x}px, ${exit.y}px, 0) scale(${cfg.exitScale})`),
          ];
    },
  },

  zoomFromCorner: {
    name: "zoomFromCorner",
    defaults: {
      enterPx: 0,
      exitPx: 0,
      enterScale: 0.86,
      exitScale: 0.93,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "corner",
      easingOpen: EASE.springPop,
      easingClose: EASE.springExit,
      enterDuration: DUR.menu.enter,
      exitDuration: DUR.menu.exit,
    },
    getKeyframes: ({ phase, cfg }) => scaleKeyframes(phase, cfg),
  },

  flip3d: {
    name: "flip3d",
    defaults: {
      enterPx: 6,
      exitPx: 4,
      enterScale: 0.98,
      exitScale: 0.99,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 1000,
      rotateDeg: 10,
      tiltDeg: 6,
      origin: "anchor",
      easingOpen: EASE.materialEmphasized,
      easingClose: EASE.materialExit,
      enterDuration: DUR.standard.enter,
      exitDuration: DUR.standard.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const axis = flipAxis(side);
      const sign = flipSign(side);
      const r = cfg.rotateDeg * sign;
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      const p = cfg.perspectivePx;

      return phase === "open"
        ? [
            popoverKf(
              0,
              `perspective(${p}px) translate3d(${enter.x}px, ${enter.y}px, 0) rotate${axis}(${r}deg) scale(${cfg.enterScale})`,
            ),
            popoverKf(1, `perspective(${p}px) translate3d(0, 0, 0) rotate${axis}(0deg) scale(1)`),
          ]
        : [
            popoverKf(1, `perspective(${p}px) translate3d(0, 0, 0) rotate${axis}(0deg) scale(1)`),
            popoverKf(
              0,
              `perspective(${p}px) translate3d(${exit.x}px, ${exit.y}px, 0) rotate${axis}(${r * 0.65}deg) scale(${cfg.exitScale})`,
            ),
          ];
    },
  },

  card3d: {
    name: "card3d",
    defaults: {
      enterPx: 8,
      exitPx: 5,
      enterScale: 0.95,
      exitScale: 0.97,
      blurInPx: 4,
      blurOutPx: 2,
      perspectivePx: 1100,
      rotateDeg: 8,
      tiltDeg: 8,
      origin: "anchor",
      easingOpen: EASE.smoothOut,
      easingClose: EASE.materialExit,
      enterDuration: DUR.standard.enter,
      exitDuration: DUR.standard.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const axis = flipAxis(side);
      const sign = flipSign(side);
      const t = cfg.tiltDeg * sign;
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      const p = cfg.perspectivePx;

      return phase === "open"
        ? [
            popoverKf(
              0,
              `perspective(${p}px) translate3d(${enter.x}px, ${enter.y}px, 0) rotate${axis}(${t}deg) scale(${cfg.enterScale})`,
              { filter: `blur(${cfg.blurInPx}px)` },
            ),
            popoverKf(1, `perspective(${p}px) translate3d(0, 0, 0) rotate${axis}(0deg) scale(1)`, {
              filter: "blur(0px)",
            }),
          ]
        : [
            popoverKf(1, `perspective(${p}px) translate3d(0, 0, 0) rotate${axis}(0deg) scale(1)`, {
              filter: "blur(0px)",
            }),
            popoverKf(
              0,
              `perspective(${p}px) translate3d(${exit.x}px, ${exit.y}px, 0) rotate${axis}(${t * 0.6}deg) scale(${cfg.exitScale})`,
              { filter: `blur(${cfg.blurOutPx}px)` },
            ),
          ];
    },
  },

  tilt3d: {
    name: "tilt3d",
    defaults: {
      enterPx: 6,
      exitPx: 4,
      enterScale: 0.98,
      exitScale: 0.99,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 1000,
      rotateDeg: 8,
      tiltDeg: 10,
      origin: "corner",
      easingOpen: EASE.expoOut,
      easingClose: EASE.sharpIn,
      enterDuration: DUR.standard.enter,
      exitDuration: DUR.standard.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      const rx = side === "top" ? cfg.tiltDeg : side === "bottom" ? -cfg.tiltDeg : 0;
      const ry = side === "left" ? cfg.tiltDeg : side === "right" ? -cfg.tiltDeg : 0;
      const p = cfg.perspectivePx;

      return phase === "open"
        ? [
            popoverKf(
              0,
              `perspective(${p}px) translate3d(${enter.x}px, ${enter.y}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) scale(${cfg.enterScale})`,
            ),
            popoverKf(
              1,
              `perspective(${p}px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)`,
            ),
          ]
        : [
            popoverKf(
              1,
              `perspective(${p}px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)`,
            ),
            popoverKf(
              0,
              `perspective(${p}px) translate3d(${exit.x}px, ${exit.y}px, 0) rotateX(${rx * 0.55}deg) rotateY(${ry * 0.55}deg) scale(${cfg.exitScale})`,
            ),
          ];
    },
  },

  depth3d: {
    name: "depth3d",
    defaults: {
      enterPx: 0,
      exitPx: 0,
      enterScale: 0.88,
      exitScale: 0.93,
      blurInPx: 6,
      blurOutPx: 4,
      perspectivePx: 1000,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "center",
      easingOpen: EASE.smoothOut,
      easingClose: EASE.materialExit,
      enterDuration: DUR.relaxed.enter,
      exitDuration: DUR.relaxed.exit,
    },
    getKeyframes: ({ phase, cfg }) => {
      const p = cfg.perspectivePx;
      const zIn = -48;
      const zOut = -32;
      return phase === "open"
        ? [
            popoverKf(
              0,
              `perspective(${p}px) translate3d(0, 0, ${zIn}px) scale(${cfg.enterScale})`,
              { filter: `blur(${cfg.blurInPx}px)` },
            ),
            popoverKf(1, `perspective(${p}px) translate3d(0, 0, 0) scale(1)`, {
              filter: "blur(0px)",
            }),
          ]
        : [
            popoverKf(1, `perspective(${p}px) translate3d(0, 0, 0) scale(1)`, {
              filter: "blur(0px)",
            }),
            popoverKf(
              0,
              `perspective(${p}px) translate3d(0, 0, ${zOut}px) scale(${cfg.exitScale})`,
              { filter: `blur(${cfg.blurOutPx}px)` },
            ),
          ];
    },
  },

  rotate3d: {
    name: "rotate3d",
    defaults: {
      enterPx: 6,
      exitPx: 4,
      enterScale: 0.98,
      exitScale: 0.99,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 1000,
      rotateDeg: 6,
      tiltDeg: 6,
      origin: "center",
      easingOpen: EASE.springSoft,
      easingClose: EASE.springExit,
      enterDuration: DUR.standard.enter,
      exitDuration: DUR.standard.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      const sign = flipSign(side);
      const r = cfg.rotateDeg * sign;
      const p = cfg.perspectivePx;

      return phase === "open"
        ? [
            popoverKf(
              0,
              `perspective(${p}px) translate3d(${enter.x}px, ${enter.y}px, 0) rotateZ(${r}deg) scale(${cfg.enterScale})`,
            ),
            popoverKf(1, `perspective(${p}px) translate3d(0, 0, 0) rotateZ(0deg) scale(1)`),
          ]
        : [
            popoverKf(1, `perspective(${p}px) translate3d(0, 0, 0) rotateZ(0deg) scale(1)`),
            popoverKf(
              0,
              `perspective(${p}px) translate3d(${exit.x}px, ${exit.y}px, 0) rotateZ(${r * 0.6}deg) scale(${cfg.exitScale})`,
            ),
          ];
    },
  },

  springy: {
    name: "springy",
    defaults: {
      enterPx: 10,
      exitPx: 6,
      enterScale: 0.92,
      exitScale: 0.96,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "anchor",
      easingOpen: EASE.springSoft,
      easingClose: EASE.materialExit,
      enterDuration: DUR.standard.enter,
      exitDuration: DUR.standard.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      return phase === "open"
        ? [
            popoverKf(0, `translate3d(${enter.x}px, ${enter.y}px, 0) scale(${cfg.enterScale})`),
            popoverKf(1, "translate3d(0, 0, 0) scale(1)"),
          ]
        : [
            popoverKf(1, "translate3d(0, 0, 0) scale(1)"),
            popoverKf(0, `translate3d(${exit.x}px, ${exit.y}px, 0) scale(${cfg.exitScale})`),
          ];
    },
  },

  bouncy: {
    name: "bouncy",
    defaults: {
      enterPx: 12,
      exitPx: 8,
      enterScale: 0.88,
      exitScale: 0.94,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "anchor",
      easingOpen: EASE.springPop,
      easingClose: EASE.springExit,
      enterDuration: DUR.standard.enter,
      exitDuration: DUR.standard.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      return phase === "open"
        ? [
            popoverKf(0, `translate3d(${enter.x}px, ${enter.y}px, 0) scale(${cfg.enterScale})`),
            popoverKf(1, "translate3d(0, 0, 0) scale(1)"),
          ]
        : [
            popoverKf(1, "translate3d(0, 0, 0) scale(1)"),
            popoverKf(0, `translate3d(${exit.x}px, ${exit.y}px, 0) scale(${cfg.exitScale})`),
          ];
    },
  },

  glide: {
    name: "glide",
    defaults: {
      enterPx: 22,
      exitPx: 14,
      enterScale: 1,
      exitScale: 1,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "center",
      easingOpen: EASE.materialEmphasized,
      easingClose: EASE.materialExit,
      enterDuration: DUR.glide.enter,
      exitDuration: DUR.glide.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => slideKeyframes(phase, side, cfg),
  },

  pop: {
    name: "pop",
    defaults: {
      enterPx: 0,
      exitPx: 0,
      enterScale: 0.82,
      exitScale: 0.92,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "center",
      easingOpen: EASE.springPop,
      easingClose: EASE.springExit,
      enterDuration: DUR.menu.enter,
      exitDuration: DUR.menu.exit,
    },
    getKeyframes: ({ phase, cfg }) => scaleKeyframes(phase, cfg),
  },

  drop: {
    name: "drop",
    defaults: {
      enterPx: 28,
      exitPx: 18,
      enterScale: 0.99,
      exitScale: 1,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "center",
      easingOpen: EASE.materialEmphasized,
      easingClose: EASE.sharpIn,
      enterDuration: DUR.relaxed.enter,
      exitDuration: DUR.standard.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => slideKeyframes(phase, side, cfg),
  },

  grow: {
    name: "grow",
    defaults: {
      enterPx: 4,
      exitPx: 3,
      enterScale: 0.93,
      exitScale: 0.97,
      blurInPx: 0,
      blurOutPx: 0,
      perspectivePx: 900,
      rotateDeg: 8,
      tiltDeg: 6,
      origin: "anchor",
      easingOpen: EASE.springSoft,
      easingClose: EASE.materialExit,
      enterDuration: DUR.menu.enter,
      exitDuration: DUR.menu.exit,
    },
    getKeyframes: ({ phase, side, cfg }) => {
      const enter = popoverVec(side, cfg.enterPx);
      const exit = popoverVec(side, cfg.exitPx);
      return phase === "open"
        ? [
            popoverKf(0, `translate3d(${enter.x}px, ${enter.y}px, 0) scale(${cfg.enterScale})`),
            popoverKf(1, "translate3d(0, 0, 0) scale(1)"),
          ]
        : [
            popoverKf(1, "translate3d(0, 0, 0) scale(1)"),
            popoverKf(0, `translate3d(${exit.x}px, ${exit.y}px, 0) scale(${cfg.exitScale})`),
          ];
    },
  },
};
