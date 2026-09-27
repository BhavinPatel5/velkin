/** Press-and-hold repeat state for `<vu-counter>` stepper buttons. */
export type CounterHoldState = {
  disabled: boolean;
  readonly: boolean;
  holdDelay: number;
  holdInterval: number;
  holdAccelerate: boolean;
  holdTimer: number | null;
  holdIntervalId: number | null;
  holdTicks: number;
};

/** Fires once immediately, then repeats `action` after `holdDelay` while the pointer stays down. */
export function startCounterHold(state: CounterHoldState, action: () => void): void {
  if (state.disabled || state.readonly) return;
  stopCounterHold(state);
  state.holdTicks = 0;
  action();
  const delay = Math.max(0, state.holdDelay);
  state.holdTimer = window.setTimeout(() => {
    state.holdTimer = null;
    scheduleCounterHoldTick(state, action);
  }, delay);
}

/** Starts the repeating interval; halves the delay after five ticks when `holdAccelerate` is set. */
export function scheduleCounterHoldTick(state: CounterHoldState, action: () => void): void {
  let interval = Math.max(16, state.holdInterval);
  if (state.holdAccelerate && state.holdTicks >= 5) {
    interval = Math.max(16, Math.floor(interval / 2));
  }
  state.holdIntervalId = window.setInterval(() => {
    state.holdTicks += 1;
    action();
  }, interval);
}

/** Clears press-and-hold timers and resets the tick counter. */
export function stopCounterHold(state: CounterHoldState): void {
  if (state.holdTimer !== null) {
    clearTimeout(state.holdTimer);
    state.holdTimer = null;
  }
  if (state.holdIntervalId !== null) {
    clearInterval(state.holdIntervalId);
    state.holdIntervalId = null;
  }
  state.holdTicks = 0;
}
