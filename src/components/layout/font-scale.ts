export const FONT_SCALE_STORAGE_KEY = "kadesh-font-scale";
export const FONT_SCALE_MIN = 0.85;
export const FONT_SCALE_MAX = 1.3;
export const FONT_SCALE_STEP = 0.05;
export const FONT_SCALE_DEFAULT = 1;

export function clampFontScale(value: number): number {
  if (Number.isNaN(value)) return FONT_SCALE_DEFAULT;
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, value));
}

export function applyFontScale(scale: number): void {
  const next = clampFontScale(scale);
  document.documentElement.style.setProperty(
    "--kadesh-font-scale",
    String(next),
  );
}

export function readStoredFontScale(): number {
  try {
    const raw = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
    if (!raw) return FONT_SCALE_DEFAULT;
    return clampFontScale(parseFloat(raw));
  } catch {
    return FONT_SCALE_DEFAULT;
  }
}

export function persistFontScale(scale: number): void {
  const next = clampFontScale(scale);
  applyFontScale(next);
  try {
    localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(next));
  } catch {
    /* ignore quota / private mode */
  }
}
