import { localized } from "@lit/localize";
import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { canUseDocument } from "../internals/utils/env.js";
import { VuIcon } from "../icon/icon.js";
import { renderVideoControls } from "./internals/video-controls.render.js";
import {
  exitDocumentFullscreen,
  FULLSCREEN_CHANGE_EVENTS,
  isElementFullscreen,
  requestElementFullscreen,
} from "./internals/video-fullscreen.js";
import { detectVideoVolumeSupport } from "./internals/video-volume-support.js";
import { videoStyles } from "./video.style.js";
import type {
  VuVideoFit,
  VuVideoPlaybackDetail,
  VuVideoPreload,
  VuVideoSeekDetail,
} from "./video.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuVideoFit,
  VuVideoPlaybackDetail,
  VuVideoPreload,
  VuVideoSeekDetail,
} from "./video.types.js";

const CONTROLS_IDLE_MS = 2500;

/**
 * @element vu-video
 *
 * @summary A video player component with custom overlay controls.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/video
 * @dependency vu-icon
 *
 * @slot - Optional `<source>` or `<track>` elements for the inner `<video>`.
 *
 * @property {string} src - Primary video URL.
 * @property {string} poster - Poster image URL.
 * @property {VuVideoFit} fit - Object-fit preset. Default: `"cover"`.
 * @property {VuVideoPreload} preload - Native preload hint. Default: `"metadata"`.
 * @property {boolean} autoplay - Starts playback when allowed. Default: `false`.
 * @property {boolean} loop - Restarts when the clip ends. Default: `false`.
 * @property {boolean} muted - Mutes audio output. Default: `false`.
 * @property {boolean} playsinline - Sets `playsinline` on mobile. Default: `true`.
 * @property {boolean} controls - Renders the custom control bar. Default: `true`.
 * @property {string} playLabel - Play accessible name (`playlabel` attr).
 * @property {string} pauseLabel - Pause accessible name (`pauselabel` attr).
 * @property {string} muteLabel - Mute accessible name (`mutelabel` attr).
 * @property {string} unmuteLabel - Unmute accessible name (`unmutelabel` attr).
 * @property {string} fullscreenLabel - Enter-fullscreen accessible name (`fullscreenlabel` attr).
 * @property {string} exitFullscreenLabel - Exit-fullscreen accessible name (`exitfullscreenlabel` attr).
 * @property {string} seekLabel - Seek slider accessible name (`seeklabel` attr).
 * @property {string} volumeLabel - Volume slider accessible name (`volumelabel` attr).
 * @property {string} label - Player accessible name.
 *
 * @attr volumeunavailable - Present when programmatic volume is unsupported.
 *
 * @method play - Starts playback.
 * @method pause - Pauses playback.
 * @method togglePlay - Toggles play and pause.
 *
 * @fires {CustomEvent<VuVideoPlaybackDetail>} vu-play - When playback starts.
 * @fires {CustomEvent<VuVideoPlaybackDetail>} vu-pause - When playback pauses.
 * @fires {CustomEvent<VuVideoSeekDetail>} vu-seek - When the user commits a seek.
 * @fires {CustomEvent<VuVideoPlaybackDetail>} vu-ended - When playback ends.
 *
 * @csspart base - Root layout shell.
 * @csspart video - Native `<video>` element.
 * @csspart controls - Full-screen overlay chrome.
 * @csspart top-bar - Top-right volume and fullscreen actions.
 * @csspart volume-shell - Volume button and popover anchor.
 * @csspart volume-popover - Vertical volume slider panel.
 * @csspart volume-rail - Rotated slider layout wrapper.
 * @csspart volume - Vertical volume range input.
 * @csspart bottom-bar - Bottom scrubber row.
 * @csspart seek - Progress seek slider.
 * @csspart play - Center play or pause button.
 * @csspart time-current - Elapsed time readout.
 * @csspart time-remaining - Remaining time readout.
 * @csspart mute - Volume button.
 * @csspart fullscreen - Fullscreen toggle.
 */
@localized()
@customElement("vu-video")
@withComponentPresets
export class VuVideo extends LitElement {
  static override styles = videoStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
  };

  /** Primary video URL. */
  @property({ type: String })
  src = "";

  /** Poster image URL. */
  @property({ type: String })
  poster = "";

  /** Object-fit preset. */
  @property({ type: String, reflect: true })
  fit: VuVideoFit = "cover";

  /** Native preload hint. */
  @property({ type: String })
  preload: VuVideoPreload = "metadata";

  /** Starts playback when allowed. */
  @property({ type: Boolean })
  autoplay = false;

  /** Restarts when the clip ends. */
  @property({ type: Boolean })
  loop = false;

  /** Mutes audio output. */
  @property({ type: Boolean, reflect: true })
  muted = false;

  /** Sets `playsinline` on mobile. */
  @property({ type: Boolean })
  playsinline = true;

  /** Renders the custom control bar. */
  @property({ type: Boolean, reflect: true })
  controls = true;

  /** Play accessible name. */
  @property({ type: String })
  playLabel = "";

  /** Pause accessible name. */
  @property({ type: String })
  pauseLabel = "";

  /** Mute accessible name. */
  @property({ type: String })
  muteLabel = "";

  /** Unmute accessible name. */
  @property({ type: String })
  unmuteLabel = "";

  /** Enter-fullscreen accessible name. */
  @property({ type: String })
  fullscreenLabel = "";

  /** Exit-fullscreen accessible name. */
  @property({ type: String })
  exitFullscreenLabel = "";

  /** Seek slider accessible name. */
  @property({ type: String })
  seekLabel = "";

  /** Volume slider accessible name. */
  @property({ type: String })
  volumeLabel = "";

  /** Player accessible name. */
  @property({ type: String })
  label = "";

  @state()
  private _playing = false;

  @state()
  private _currentTime = 0;

  @state()
  private _duration = 0;

  @state()
  private _volume = 1;

  @state()
  private _fullscreen = false;

  @state()
  private _volumeOpen = false;

  @state()
  private _volumeUnavailable = false;

  @state()
  private _controlsHidden = false;

  @query('[part="base"]')
  private _baseEl!: HTMLElement;

  @query('[part="video"]')
  private _videoEl!: HTMLVideoElement;

  private _idleTimer: ReturnType<typeof setTimeout> | null = null;

  private _seekPreviousTime = 0;

  private _volumeSupportChecked = false;

  private _volumeCheckGeneration = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!canUseDocument()) return;
    for (const eventName of FULLSCREEN_CHANGE_EVENTS) {
      document.addEventListener(eventName, this._onFullscreenChange);
    }
  }

  override disconnectedCallback(): void {
    if (canUseDocument()) {
      for (const eventName of FULLSCREEN_CHANGE_EVENTS) {
        document.removeEventListener(eventName, this._onFullscreenChange);
      }
    }
    this._volumeCheckGeneration++;
    this._clearIdleTimer();
    super.disconnectedCallback();
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("muted") && this._videoEl) {
      this._videoEl.muted = this.muted;
    }
  }

  /** Starts playback (returns the native `play()` promise). */
  async play(): Promise<void> {
    await this._videoEl?.play();
  }

  /** Pauses playback. */
  pause(): void {
    this._videoEl?.pause();
  }

  /** Toggles play / pause. */
  togglePlay(): void {
    if (this._playing) this.pause();
    else void this.play();
  }

  override render() {
    const progressPercent =
      this._duration > 0 ? Math.min(100, (this._currentTime / this._duration) * 100) : 0;

    return html`
      <div
        part="base"
        tabindex="0"
        @keydown=${this._onHostKeydown}
        @pointermove=${this._onPointerActivity}
        @pointerenter=${this._onPointerActivity}
        @focusin=${this._onPointerActivity}
        @pointerleave=${this._onPointerLeave}
        @click=${this._onBaseClick}
      >
        <video
          part="video"
          src=${ifDefined(this.src.trim() || undefined)}
          poster=${ifDefined(this.poster.trim() || undefined)}
          aria-label=${ifDefined(this.label.trim() || undefined)}
          preload=${this.preload}
          ?autoplay=${this.autoplay}
          ?loop=${this.loop}
          ?muted=${this.muted}
          ?playsinline=${this.playsinline}
          @click=${this._onVideoClick}
          @play=${this._onVideoPlay}
          @pause=${this._onVideoPause}
          @timeupdate=${this._onTimeUpdate}
          @loadedmetadata=${this._onLoadedMetadata}
          @durationchange=${this._onLoadedMetadata}
          @volumechange=${this._onVolumeChange}
          @ended=${this._onEnded}
        >
          <slot></slot>
        </video>
        ${renderVideoControls({
          controls: this.controls,
          controlsHidden: this._controlsHidden,
          playing: this._playing,
          muted: this.muted,
          volumeUnavailable: this._volumeUnavailable,
          volumeOpen: this._volumeOpen,
          fullscreen: this._fullscreen,
          currentTime: this._currentTime,
          duration: this._duration,
          progressPercent,
          volumePercent: this._volume * 100,
          playLabel: this.playLabel,
          pauseLabel: this.pauseLabel,
          muteLabel: this.muteLabel,
          unmuteLabel: this.unmuteLabel,
          fullscreenLabel: this.fullscreenLabel,
          exitFullscreenLabel: this.exitFullscreenLabel,
          seekLabel: this.seekLabel,
          volumeLabel: this.volumeLabel,
          onPlayToggle: () => this.togglePlay(),
          onVolumeButtonClick: () => this._onVolumeButtonClick(),
          onVolumeClose: () => this._closeVolumePopover(),
          onFullscreenToggle: () => void this._toggleFullscreen(),
          onSeekInput: (event) => this._onSeekInput(event),
          onSeekChange: (event) => this._onSeekChange(event),
          onVolumeInput: (event) => this._onVolumeInput(event),
        })}
      </div>
    `;
  }

  private _onBaseClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('[part="controls"]')) {
      if (!target.closest('[part="volume-shell"]')) {
        this._closeVolumePopover();
      }
      return;
    }

    this._closeVolumePopover();

    if (this._playing) {
      if (this._controlsHidden) {
        this._revealControls();
        this._scheduleControlsHide();
      } else {
        this._controlsHidden = true;
        this._clearIdleTimer();
      }
      return;
    }

    void this.play();
  }

  private _onVideoClick(event: Event): void {
    event.stopPropagation();
    this._onBaseClick(event);
  }

  private _onVideoPlay(): void {
    this._playing = true;
    this._controlsHidden = false;
    this._scheduleControlsHide();
    this.dispatchEvent(
      new CustomEvent<VuVideoPlaybackDetail>("vu-play", {
        detail: { currentTime: this._currentTime },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onVideoPause(): void {
    this._playing = false;
    this._controlsHidden = false;
    this._clearIdleTimer();
    this.dispatchEvent(
      new CustomEvent<VuVideoPlaybackDetail>("vu-pause", {
        detail: { currentTime: this._currentTime },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onTimeUpdate(): void {
    this._currentTime = this._videoEl.currentTime;
  }

  private _onLoadedMetadata(): void {
    this._duration = Number.isFinite(this._videoEl.duration) ? this._videoEl.duration : 0;
    this._currentTime = this._videoEl.currentTime;
    this._volume = this._videoEl.volume;
    this._playing = !this._videoEl.paused;
    void this._checkVolumeSupport();
  }

  private _onVolumeChange(): void {
    this._volume = this._videoEl.volume;
    this.muted = this._videoEl.muted;
  }

  private _onEnded(): void {
    this._playing = false;
    this._controlsHidden = false;
    this.dispatchEvent(
      new CustomEvent<VuVideoPlaybackDetail>("vu-ended", {
        detail: { currentTime: this._currentTime },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onVolumeButtonClick(): void {
    if (this._volumeUnavailable) {
      this._toggleMute();
      return;
    }
    this._toggleVolumePopover();
  }

  private _toggleMute(): void {
    this.muted = !this.muted;
    if (this._videoEl) this._videoEl.muted = this.muted;
    this._revealControls();
    if (this._playing) this._scheduleControlsHide();
  }

  private _toggleVolumePopover(): void {
    this._volumeOpen = !this._volumeOpen;
    this._revealControls();
    if (this._playing) this._scheduleControlsHide();
  }

  private _closeVolumePopover(): void {
    if (!this._volumeOpen) return;
    this._volumeOpen = false;
  }

  private _onVolumeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const next = Number(input.value);
    if (!Number.isFinite(next) || !this._videoEl) return;
    this._videoEl.volume = next;
    this._volume = next;
    if (next > 0 && this.muted) {
      this.muted = false;
      this._videoEl.muted = false;
    }
    if (next === 0) {
      this.muted = true;
      this._videoEl.muted = true;
    }
    this._revealControls();
    if (this._playing) this._scheduleControlsHide();
  }

  private _onSeekInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const next = Number(input.value);
    if (!Number.isFinite(next) || !this._videoEl) return;
    if (this._seekPreviousTime === 0) this._seekPreviousTime = this._currentTime;
    this._videoEl.currentTime = next;
    this._currentTime = next;
    this._revealControls();
  }

  private _onSeekChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const next = Number(input.value);
    const previousTime = this._seekPreviousTime || this._currentTime;
    this._seekPreviousTime = 0;
    if (!Number.isFinite(next) || !this._videoEl) return;
    this._videoEl.currentTime = next;
    this._currentTime = next;
    this.dispatchEvent(
      new CustomEvent<VuVideoSeekDetail>("vu-seek", {
        detail: { currentTime: next, previousTime },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private async _toggleFullscreen(): Promise<void> {
    if (this._fullscreen) {
      await exitDocumentFullscreen();
      return;
    }

    await requestElementFullscreen(this);
  }

  private _onFullscreenChange = (): void => {
    this._fullscreen = isElementFullscreen(this);
    this._revealControls();
  };

  private _onHostKeydown(event: KeyboardEvent): void {
    if (event.target !== this._baseEl) return;

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      this.togglePlay();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      this._seekBy(-5);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      this._seekBy(5);
      return;
    }

    if (event.key === "Escape" && this._volumeOpen) {
      event.preventDefault();
      this._closeVolumePopover();
    }
  }

  private _seekBy(delta: number): void {
    if (!this._videoEl) return;
    const previousTime = this._videoEl.currentTime;
    const next = Math.max(0, Math.min(this._duration, previousTime + delta));
    this._videoEl.currentTime = next;
    this._currentTime = next;
    this.dispatchEvent(
      new CustomEvent<VuVideoSeekDetail>("vu-seek", {
        detail: { currentTime: next, previousTime },
        bubbles: true,
        composed: true,
      }),
    );
    this._revealControls();
  }

  private _onPointerActivity(): void {
    this._revealControls();
    if (this._playing) this._scheduleControlsHide();
  }

  private _onPointerLeave(): void {
    if (this._playing) this._scheduleControlsHide();
  }

  private _revealControls(): void {
    this._controlsHidden = false;
  }

  private _scheduleControlsHide(): void {
    if (!this.controls || !this._playing) return;
    this._clearIdleTimer();
    this._idleTimer = setTimeout(() => {
      this._controlsHidden = true;
      this._volumeOpen = false;
    }, CONTROLS_IDLE_MS);
  }

  private _clearIdleTimer(): void {
    if (this._idleTimer) {
      clearTimeout(this._idleTimer);
      this._idleTimer = null;
    }
  }

  private async _checkVolumeSupport(): Promise<void> {
    if (!this._videoEl || this._volumeSupportChecked) return;
    const generation = ++this._volumeCheckGeneration;
    const supported = await detectVideoVolumeSupport(this._videoEl);
    if (generation !== this._volumeCheckGeneration) return;
    this._volumeSupportChecked = true;
    this._volumeUnavailable = !supported;
    if (this._volumeUnavailable) {
      this._closeVolumePopover();
      this.setAttribute("volumeunavailable", "");
    } else {
      this.removeAttribute("volumeunavailable");
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-video": VuVideo;
  }
}
