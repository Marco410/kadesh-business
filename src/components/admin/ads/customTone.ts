/**
 * Shades of a custom card color (`tone` = `#rrggbb`). Same math in kadesh-landing
 * (`components/ads/customTone.ts`) and kadesh-pet-mobile (`modules/ads/domain/custom-tone.ts`):
 * change the three together.
 */

type Rgb = readonly [number, number, number];

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];
/** The dark background the card sits on (`night-raised`). */
const DARK_SURFACE: Rgb = [0x1c, 0x24, 0x33];
const INK: Rgb = [0x12, 0x12, 0x12];
/** Contrast the brand line needs against the card (WCAG AA for small text). */
const MIN_CONTRAST = 4.5;

export const CUSTOM_TONE_RE = /^#[0-9a-f]{6}$/i;

export interface CustomToneColors {
  /** Card background, light and dark. */
  card: string;
  cardDark: string;
  /** Brand line, icon and dots, light and dark. */
  accent: string;
  accentDark: string;
  /** The button is the color itself; its text is black or white. */
  button: string;
  buttonText: string;
  /** A color close to the card's (white, cream) gets an edge so the button still shows; otherwise `transparent`. */
  buttonBorder: string;
}

function parse(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex(rgb: Rgb): string {
  return `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

/** `t` of `to` over `from`. */
function mix(from: Rgb, to: Rgb, t: number): Rgb {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t];
}

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as unknown as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Rgb, b: Rgb): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** The color moved toward `toward` just enough to read on `background`. */
function readable(color: Rgb, toward: Rgb, background: Rgb): Rgb {
  for (let t = 0; t <= 1; t += 0.05) {
    const candidate = mix(color, toward, t);
    if (contrast(candidate, background) >= MIN_CONTRAST) return candidate;
  }
  return toward;
}

export function customToneColors(hex: string): CustomToneColors {
  const color = parse(hex);
  const card = mix(WHITE, color, 0.12);
  const cardDark = mix(DARK_SURFACE, color, 0.15);
  return {
    card: toHex(card),
    cardDark: toHex(cardDark),
    accent: toHex(readable(color, BLACK, card)),
    accentDark: toHex(readable(color, WHITE, cardDark)),
    button: toHex(color),
    buttonText: contrast(INK, color) >= contrast(WHITE, color) ? "#121212" : "#ffffff",
    buttonBorder: contrast(color, card) < 1.5 ? toHex(readable(color, BLACK, card)) : "transparent",
  };
}
