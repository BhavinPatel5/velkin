/** Shared scroll lock so nested/stacked dialogs restore chrome once. */

let _openCount = 0;
let _savedScrollY = 0;
let _savedPaddingInlineEnd = "";
let _bodyFixed = false;

function scrollbarGapPx(): number {
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

/** Locks page scroll while at least one overlay is open — without jumping to top. */
export function lockDialogScroll(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (_openCount === 0) {
    const html = document.documentElement;
    const body = document.body;
    _savedScrollY = window.scrollY || window.pageYOffset || 0;
    _savedPaddingInlineEnd = html.style.paddingInlineEnd;

    const gap = scrollbarGapPx();
    if (gap > 0) {
      html.style.paddingInlineEnd = `${gap}px`;
    }

    html.setAttribute("data-vu-dialog-open", "true");

    /* iOS / overflow:hidden gaps: pin body so the viewport stays visually put. */
    body.style.position = "fixed";
    body.style.top = `-${_savedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    _bodyFixed = true;
  }

  _openCount++;
}

/** Releases scroll lock when the last overlay closes. */
export function unlockDialogScroll(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  _openCount = Math.max(0, _openCount - 1);
  if (_openCount !== 0) return;

  const html = document.documentElement;
  const body = document.body;
  html.removeAttribute("data-vu-dialog-open");
  html.style.paddingInlineEnd = _savedPaddingInlineEnd;

  if (_bodyFixed) {
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    _bodyFixed = false;
    try {
      window.scrollTo(0, _savedScrollY);
    } catch {
      /* jsdom may define scrollTo but not implement it */
    }
  }

  _savedScrollY = 0;
  _savedPaddingInlineEnd = "";
}
