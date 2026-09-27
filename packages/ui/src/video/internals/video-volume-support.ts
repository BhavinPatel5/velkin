const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** True when programmatic `HTMLVideoElement.volume` changes stick (false on iOS Safari). */
export async function detectVideoVolumeSupport(mediaEl: HTMLVideoElement): Promise<boolean> {
  const prevVolume = mediaEl.volume;
  mediaEl.volume = prevVolume / 2 + 0.1;

  const abortController = new AbortController();
  const volumeSupported = await Promise.race([
    dispatchedVolumeChange(mediaEl, abortController.signal),
    volumeChanged(mediaEl, prevVolume),
  ]);
  abortController.abort();

  mediaEl.volume = prevVolume;
  return volumeSupported;
}

function dispatchedVolumeChange(mediaEl: HTMLVideoElement, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    mediaEl.addEventListener("volumechange", () => resolve(true), { signal });
  });
}

async function volumeChanged(mediaEl: HTMLVideoElement, prevVolume: number): Promise<boolean> {
  for (let i = 0; i < 10; i++) {
    if (mediaEl.volume === prevVolume) return false;
    await delay(10);
  }
  return mediaEl.volume !== prevVolume;
}
