import type { CSSProperties } from "react";
import {
  Bone01Icon,
  Megaphone01Icon,
  ShoppingBag01Icon,
  Stethoscope02Icon,
  UserSearch01Icon,
} from "@hugeicons/core-free-icons";
import { CUSTOM_TONE_RE, customToneColors } from "./customTone";

/**
 * Operaciones → Kadesh Pet → Anuncios. Values are the same as in kadesh-back
 * (`models/Pet/Ad/constants.ts`): change them there first. See kadesh-back models/Pet/Ad/README.md.
 */

/** Sub-sections (`&seccion=`). No value = the list. */
export const AD_SECTIONS = {
  LIST: "anuncios",
  SUMMARY: "resumen",
} as const;

export type AdSection = (typeof AD_SECTIONS)[keyof typeof AD_SECTIONS];

export const AD_SECTION_ITEMS: Array<{ id: AdSection; label: string }> = [
  { id: AD_SECTIONS.LIST, label: "Anuncios" },
  { id: AD_SECTIONS.SUMMARY, label: "Resumen" },
];

export function parseAdSection(value: string | null): AdSection {
  return AD_SECTION_ITEMS.find((item) => item.id === value)?.id ?? AD_SECTIONS.LIST;
}

export const AD_KIND = {
  HOUSE: "house",
  STORE_PRODUCT: "store_product",
  PET_PLACE: "pet_place",
  ANIMAL: "animal",
  BRAND: "brand",
} as const;

export type AdKind = (typeof AD_KIND)[keyof typeof AD_KIND];

export const AD_KIND_OPTIONS: Array<{ value: AdKind; label: string; hint: string }> = [
  { value: AD_KIND.BRAND, label: "Marca o servicio externo", hint: "Lleva a la página del anunciante." },
  { value: AD_KIND.PET_PLACE, label: "Veterinaria o negocio", hint: "Lleva a su ficha en Kadesh Pet." },
  { value: AD_KIND.STORE_PRODUCT, label: "Producto de la tienda", hint: "Lleva al producto en la tienda." },
  { value: AD_KIND.ANIMAL, label: "Animal", hint: "Adopción o reporte: lleva a su ficha." },
  { value: AD_KIND.HOUSE, label: "Kadesh (de la casa)", hint: "Productos de Kadesh. Salen cuando no hay otro." },
];

export const AD_KIND_LABELS: Record<string, string> = Object.fromEntries(
  AD_KIND_OPTIONS.map((option) => [option.value, option.label]),
);

/** Icon next to the brand line of the card. */
export const AD_KIND_ICON = {
  [AD_KIND.HOUSE]: UserSearch01Icon,
  [AD_KIND.BRAND]: Megaphone01Icon,
  [AD_KIND.PET_PLACE]: Stethoscope02Icon,
  [AD_KIND.STORE_PRODUCT]: ShoppingBag01Icon,
  [AD_KIND.ANIMAL]: Bone01Icon,
} as const;

/** Which kinds point to something of Kadesh Pet instead of a link. */
export function adKindTarget(kind: string): "storeProduct" | "petPlace" | "animal" | null {
  if (kind === AD_KIND.STORE_PRODUCT) return "storeProduct";
  if (kind === AD_KIND.PET_PLACE) return "petPlace";
  if (kind === AD_KIND.ANIMAL) return "animal";
  return null;
}

export const AD_STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "active", label: "Activo" },
  { value: "paused", label: "Pausado" },
  { value: "ended", label: "Terminado" },
];

export const AD_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  AD_STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

export const AD_STATUS_CLASS: Record<string, string> = {
  draft: "bg-dash-surface-2 text-dash-soft",
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  paused: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  ended: "bg-stone-200 text-stone-700 dark:bg-stone-500/20 dark:text-stone-300",
};

export const AD_PLACEMENT = {
  ANIMAL_DETAIL: "animal_detail",
  VET_DETAIL: "vet_detail",
  BLOG: "blog",
  STORE: "store",
} as const;

export const AD_PLACEMENT_OPTIONS = [
  { value: AD_PLACEMENT.ANIMAL_DETAIL, label: "Detalle de animal", hint: "Web y app" },
  { value: AD_PLACEMENT.VET_DETAIL, label: "Detalle de veterinaria", hint: "Web" },
  { value: AD_PLACEMENT.BLOG, label: "Blog", hint: "Web" },
  { value: AD_PLACEMENT.STORE, label: "Tienda", hint: "Web" },
];

export const AD_PLACEMENT_LABELS: Record<string, string> = Object.fromEntries(
  AD_PLACEMENT_OPTIONS.map((option) => [option.value, option.label]),
);

const ALL_PLACEMENTS = AD_PLACEMENT_OPTIONS.map((option) => option.value) as string[];

/** Only a suggestion: ticked when the kind is picked; the admin decides. Same as kadesh-back. */
export const AD_SUGGESTED_PLACEMENTS: Record<AdKind, string[]> = {
  house: ALL_PLACEMENTS,
  store_product: ALL_PLACEMENTS,
  pet_place: [AD_PLACEMENT.ANIMAL_DETAIL, AD_PLACEMENT.BLOG, AD_PLACEMENT.STORE],
  animal: [AD_PLACEMENT.ANIMAL_DETAIL, AD_PLACEMENT.VET_DETAIL, AD_PLACEMENT.BLOG],
  brand: ALL_PLACEMENTS,
};

/** Why a placement outside the suggestion may not fit (the warning in the editor). */
export const AD_PLACEMENT_WARNING: Partial<Record<AdKind, Partial<Record<string, string>>>> = {
  pet_place: { vet_detail: "Saldría en la ficha de otra veterinaria, que es su competencia." },
  animal: { store: "Un animal en la tienda suele verse fuera de lugar." },
};

/** Card colors. Same classes as the card of kadesh-landing (HouseAd.tsx). */
export const AD_TONES = {
  orange: {
    label: "Naranja",
    card: "bg-[#fff3eb] text-[#c96b2c] dark:bg-[#f7945e]/15 dark:text-[#ffb47e]",
    button: "bg-[#f7945e] text-[#121212]",
  },
  green: {
    label: "Verde",
    card: "bg-[#ECF1EB] text-[#387F39] dark:bg-[#70B56A]/15 dark:text-[#8fcb8a]",
    button: "bg-[#70B56A] text-[#121212]",
  },
  sky: {
    label: "Azul",
    card: "bg-[#e4edfe] text-[#1e60e1] dark:bg-[#1d2f51] dark:text-[#6497fc]",
    button: "bg-[#216BFA] text-white",
  },
  violet: {
    label: "Morado",
    card: "bg-[#f2edfb] text-[#6b46b8] dark:bg-[#9a78e0]/15 dark:text-[#c4adf2]",
    button: "bg-[#9a78e0] text-[#121212]",
  },
  neutral: {
    label: "Neutro",
    card: "bg-[#f3f4f6] text-[#4b5563] dark:bg-white/10 dark:text-[#c5ccd8]",
    button: "bg-[#121212] text-white dark:bg-white dark:text-[#121212]",
  },
} as const;

export type AdTone = keyof typeof AD_TONES;

/** Starting point of «Personalizado» when the ad has no custom color yet. */
export const AD_CUSTOM_TONE_DEFAULT = "#1f8a70";

export function isPresetTone(value: string): value is AdTone {
  return value in AD_TONES;
}

/** `#abc`, `abcdef` or `#ABCDEF` → `#abcdef`; anything else → `null`. */
export function normalizeHexTone(value: string): string | null {
  const text = value.trim().toLowerCase().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/.test(text)) return `#${text.replace(/./g, (c) => c + c)}`;
  return /^[0-9a-f]{6}$/.test(text) ? `#${text}` : null;
}

export interface AdToneStyle {
  card: string;
  button: string;
  /** Only a custom color: the CSS variables the classes read, and the button colors. */
  vars?: CSSProperties;
  buttonStyle?: CSSProperties;
}

/** A custom color reads its shades from CSS variables, so light and dark still switch with `dark:`. */
const CUSTOM_TONE_CLASSES = {
  card: "bg-(--ad-card) text-(--ad-accent) dark:bg-(--ad-card-dark) dark:text-(--ad-accent-dark)",
  button: "border",
};

/** Classes (and, for a custom `#rrggbb`, styles) of a card color. Same result as the card of kadesh-landing. */
export function adTone(value: string | null | undefined): AdToneStyle {
  if (value && CUSTOM_TONE_RE.test(value)) {
    const colors = customToneColors(value);
    return {
      ...CUSTOM_TONE_CLASSES,
      vars: {
        "--ad-card": colors.card,
        "--ad-card-dark": colors.cardDark,
        "--ad-accent": colors.accent,
        "--ad-accent-dark": colors.accentDark,
      } as CSSProperties,
      buttonStyle: { backgroundColor: colors.button, color: colors.buttonText, borderColor: colors.buttonBorder },
    };
  }
  return AD_TONES[value && isPresetTone(value) ? value : "orange"];
}

export const AD_PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "waived", label: "Sin costo" },
];

export const AD_PAYMENT_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  AD_PAYMENT_STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

export const AD_PAYMENT_STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  waived: "bg-dash-surface-2 text-dash-soft",
};

export const AD_PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "Sin definir" },
  { value: "transfer", label: "Transferencia" },
  { value: "cash", label: "Efectivo" },
  { value: "stripe_link", label: "Liga de pago (Stripe)" },
  { value: "other", label: "Otro" },
];

/** Longest texts that fit the card. Same as `AD_TEXT_LIMITS` in kadesh-back. */
export const AD_TEXT_LIMITS = { title: 70, body: 160, brandLabel: 24, ctaLabel: 20 } as const;
export const AD_RADIUS_KM = { MIN: 1, MAX: 300 } as const;
export const AD_WEIGHT = { MIN: 1, MAX: 10 } as const;

/** Periods of the report (`&dias=`). Same as `AD_STATS_DAYS` in kadesh-back. */
export const AD_STATS_DAY_OPTIONS = [
  { value: "7", label: "7 días" },
  { value: "30", label: "30 días" },
  { value: "90", label: "90 días" },
] as const;
export const AD_STATS_DEFAULT_DAYS = 30;

export const ADMIN_ADS_PAGE_SIZE = 20;

/** `?anuncio=` value that opens the editor empty. */
export const AD_NEW = "nuevo";

/** Click-through rate as "2.4 %", or "—" with no impressions. */
export function formatCtr(clicks: number, impressions: number): string {
  if (impressions <= 0) return "—";
  const pct = (clicks / impressions) * 100;
  return `${pct.toLocaleString("es-MX", { maximumFractionDigits: pct < 10 ? 1 : 0 })} %`;
}

/** Today in Mexico City as `YYYY-MM-DD`, for the date inputs. */
export function mxTodayYmd(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** `YYYY-MM-DD` + n days. */
export function addDaysYmd(ymd: string, days: number): string {
  const date = new Date(`${ymd}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Quick periods of the price packages. */
export const AD_PERIOD_PRESETS = [7, 15, 30] as const;
