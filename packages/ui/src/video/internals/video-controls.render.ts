import { html, nothing, type TemplateResult } from "lit";
import { ICONS } from "../../internals/icon.js";
import { msg } from "../../internals/utils/localize.js";
import { formatVideoRemaining, formatVideoTime } from "./video-format.js";

export type VideoControlsContext = {
  controls: boolean;
  controlsHidden: boolean;
  playing: boolean;
  muted: boolean;
  volumeUnavailable: boolean;
  volumeOpen: boolean;
  fullscreen: boolean;
  currentTime: number;
  duration: number;
  progressPercent: number;
  volumePercent: number;
  playLabel: string;
  pauseLabel: string;
  muteLabel: string;
  unmuteLabel: string;
  fullscreenLabel: string;
  exitFullscreenLabel: string;
  seekLabel: string;
  volumeLabel: string;
  onPlayToggle(): void;
  onVolumeButtonClick(): void;
  onVolumeClose(): void;
  onFullscreenToggle(): void;
  onSeekInput(event: Event): void;
  onSeekChange(event: Event): void;
  onVolumeInput(event: Event): void;
};

export function renderVideoControls(ctx: VideoControlsContext): TemplateResult | typeof nothing {
  if (!ctx.controls) return nothing;

  const playPauseLabel = ctx.playing
    ? ctx.pauseLabel.trim() ||
      String(msg("Pause", { desc: "Accessible name for the video pause control." }))
    : ctx.playLabel.trim() ||
      String(msg("Play", { desc: "Accessible name for the video play control." }));

  const muteToggleLabel = ctx.muted
    ? ctx.unmuteLabel.trim() ||
      String(msg("Unmute", { desc: "Accessible name for the video unmute control." }))
    : ctx.muteLabel.trim() ||
      String(msg("Mute", { desc: "Accessible name for the video mute control." }));

  const volumeButtonLabel = ctx.volumeUnavailable
    ? muteToggleLabel
    : ctx.volumeLabel.trim() ||
      String(
        msg("Volume", {
          id: "nu.video.volumeControl",
          desc: "Accessible name for the video volume control.",
        }),
      );

  const volumeSliderLabel =
    ctx.volumeLabel.trim() ||
    String(
      msg("Volume", {
        id: "nu.video.volumeSlider",
        desc: "Accessible name for the video volume slider.",
      }),
    );

  const fullscreenLabel = ctx.fullscreen
    ? ctx.exitFullscreenLabel.trim() ||
      String(msg("Exit fullscreen", { desc: "Accessible name for exiting video fullscreen." }))
    : ctx.fullscreenLabel.trim() ||
      String(msg("Enter fullscreen", { desc: "Accessible name for entering video fullscreen." }));

  const seekLabel =
    ctx.seekLabel.trim() ||
    String(msg("Seek", { desc: "Accessible name for the video seek slider." }));

  const currentText = formatVideoTime(ctx.currentTime);
  const remainingText = formatVideoRemaining(ctx.currentTime, ctx.duration);
  const timeText = `${currentText} / ${formatVideoTime(ctx.duration)}`;
  const showChrome = !ctx.controlsHidden || !ctx.playing;
  const volumeFill = ctx.muted ? 0 : ctx.volumePercent;
  const volumeValue = ctx.muted ? 0 : ctx.volumePercent / 100;
  const volumeIcon = ctx.muted || ctx.volumePercent === 0 ? ICONS.volumeMute : ICONS.volumeHigh;

  return html`
    <div part="controls" data-visible=${showChrome ? "" : nothing}>
      <div part="top-bar">
        <div part="volume-shell">
          <button
            type="button"
            part="mute"
            aria-label=${volumeButtonLabel}
            aria-haspopup=${ctx.volumeUnavailable ? nothing : "true"}
            aria-expanded=${ctx.volumeUnavailable ? nothing : ctx.volumeOpen ? "true" : "false"}
            aria-pressed=${ctx.muted ? "true" : "false"}
            @click=${(event: Event) => {
              event.stopPropagation();
              ctx.onVolumeButtonClick();
            }}
          >
            <vu-icon .icon=${volumeIcon} aria-hidden="true"></vu-icon>
          </button>
          ${
            ctx.volumeUnavailable
              ? nothing
              : html`
                  <div part="volume-popover" data-open=${ctx.volumeOpen ? "" : nothing}>
                    <div part="volume-rail" style=${`--video-volume: ${volumeFill}%`}>
                      <input
                        part="volume"
                        type="range"
                        orient="vertical"
                        min="0"
                        max="1"
                        step="0.05"
                        .value=${String(volumeValue)}
                        style=${`--video-volume: ${volumeFill}%`}
                        aria-label=${volumeSliderLabel}
                        aria-valuemin="0"
                        aria-valuemax="1"
                        aria-valuenow=${volumeValue}
                        @input=${ctx.onVolumeInput}
                        @click=${(event: Event) => event.stopPropagation()}
                      />
                    </div>
                  </div>
                `
          }
        </div>
        <button
          type="button"
          part="fullscreen"
          aria-label=${fullscreenLabel}
          aria-pressed=${ctx.fullscreen ? "true" : "false"}
          @click=${(event: Event) => {
            event.stopPropagation();
            ctx.onFullscreenToggle();
          }}
        >
          <vu-icon
            .icon=${ctx.fullscreen ? ICONS.fullscreenExit : ICONS.fullscreen}
            aria-hidden="true"
          ></vu-icon>
        </button>
      </div>

      <button type="button" part="play" aria-label=${playPauseLabel} @click=${ctx.onPlayToggle}>
        <vu-icon .icon=${ctx.playing ? ICONS.pause : ICONS.play} aria-hidden="true"></vu-icon>
      </button>

      <div part="bottom-bar">
        <span part="time-current" aria-hidden="true">${currentText}</span>
        <input
          part="seek"
          type="range"
          min="0"
          max=${ctx.duration || 0}
          step="0.1"
          .value=${String(ctx.currentTime)}
          style=${`--video-progress: ${ctx.progressPercent}%`}
          aria-label=${seekLabel}
          aria-valuemin="0"
          aria-valuemax=${ctx.duration || 0}
          aria-valuenow=${ctx.currentTime}
          aria-valuetext=${timeText}
          @input=${ctx.onSeekInput}
          @change=${ctx.onSeekChange}
        />
        <span part="time-remaining" aria-hidden="true">${remainingText}</span>
      </div>
    </div>
  `;
}
