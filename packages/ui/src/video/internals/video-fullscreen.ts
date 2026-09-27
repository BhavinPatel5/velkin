type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
};

/** Returns the element currently in browser fullscreen, if any. */
export function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

/** True when `candidate` (or its shadow subtree) owns the active fullscreen element. */
export function isElementFullscreen(
  candidate: Element,
  fsEl: Element | null = getFullscreenElement(),
): boolean {
  if (!fsEl) return false;
  if (fsEl === candidate) return true;

  const shadow = candidate.shadowRoot;
  if (shadow?.contains(fsEl)) return true;

  return candidate.contains(fsEl);
}

/** Enters fullscreen on `el` (standard + WebKit). */
export async function requestElementFullscreen(el: FullscreenCapableElement): Promise<void> {
  if (typeof el.requestFullscreen === "function") {
    await el.requestFullscreen();
    return;
  }
  if (typeof el.webkitRequestFullscreen === "function") {
    await el.webkitRequestFullscreen();
  }
}

/** Exits browser fullscreen (standard + WebKit). */
export async function exitDocumentFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument;
  if (doc.fullscreenElement && typeof doc.exitFullscreen === "function") {
    await doc.exitFullscreen();
    return;
  }
  if (doc.webkitFullscreenElement && typeof doc.webkitExitFullscreen === "function") {
    await doc.webkitExitFullscreen();
  }
}

/** Document event names for fullscreen transitions. */
export const FULLSCREEN_CHANGE_EVENTS = ["fullscreenchange", "webkitfullscreenchange"] as const;
