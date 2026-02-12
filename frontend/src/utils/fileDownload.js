const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]+/g;
const DEFAULT_REVOKE_DELAY_MS = 60_000;

/**
 * Best-effort filename sanitizer for browser downloads.
 * @param {string} value
 * @param {string} fallback
 */
const sanitizeFilename = (value, fallback = 'download') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  const cleaned = trimmed.replace(INVALID_FILENAME_CHARS, '_').replace(/\s+/g, ' ');
  return cleaned || fallback;
};

/**
 * Basic mobile check based on user-agent tokens. Not perfect, but good enough for download UX decisions.
 */
const isLikelyMobileBrowser = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
};

/**
 * Opens a new tab/window early (while we still have a user gesture) so we can navigate to a blob URL later.
 * Returns the window reference or null if blocked.
 */
const openPreparingWindow = (title = 'Preparing download', message = 'Preparing your file...') => {
  if (typeof window === 'undefined') return null;

  let win = null;
  try {
    win = window.open('', '_blank');
  } catch (error) {
    return null;
  }

  if (!win) return null;

  try {
    win.document.title = title;
    win.document.body.style.margin = '0';
    win.document.body.style.padding = '16px';
    win.document.body.style.fontFamily =
      'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
    win.document.body.innerHTML = `<p>${message}</p>`;
  } catch (error) {
    // Ignore DOM write errors (some browsers restrict scripting new tabs).
  }

  return win;
};

/**
 * Triggers a download for a Blob using an anchor click. Optionally opens in a new tab when download attr is ignored.
 */
const downloadBlob = (blob, filename, { openInNewTab = false } = {}) => {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return null;
  if (!blob) return null;

  const safeName = sanitizeFilename(filename, 'download');
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = safeName;
  link.rel = 'noopener';
  if (openInNewTab) link.target = '_blank';

  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoke later so the PDF viewer has time to load from the blob URL on mobile.
  setTimeout(() => URL.revokeObjectURL(url), DEFAULT_REVOKE_DELAY_MS);
  return url;
};

/**
 * Attempts to share a Blob as a File via the Web Share API (works best on mobile).
 * Returns true if the share UI was shown and completed, otherwise false.
 */
const tryShareBlobAsFile = async (blob, filename, { title, text } = {}) => {
  if (typeof navigator === 'undefined') return false;
  if (typeof navigator.share !== 'function') return false;
  if (typeof File === 'undefined') return false;

  const safeName = sanitizeFilename(filename, 'download');
  const file = new File([blob], safeName, {
    type: blob?.type || 'application/octet-stream',
  });

  if (typeof navigator.canShare === 'function') {
    try {
      if (!navigator.canShare({ files: [file] })) return false;
    } catch (error) {
      // Ignore canShare failures and try share anyway.
    }
  }

  try {
    await navigator.share({
      title: title || safeName,
      text,
      files: [file],
    });
    return true;
  } catch (error) {
    return false;
  }
};

export {
  downloadBlob,
  isLikelyMobileBrowser,
  openPreparingWindow,
  sanitizeFilename,
  tryShareBlobAsFile,
};

