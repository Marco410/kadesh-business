import { PET_PLACE_PUBLIC_ORIGIN } from "kadesh/components/admin/constants";

/** Sub-sections of Operaciones → Kadesh Pet → Tienda (`&seccion=`). No value = products. */
export const STORE_SECTIONS = {
  PRODUCTS: "productos",
  CATEGORIES: "categorias",
  BRANDS: "marcas",
  REVIEWS: "resenas",
} as const;

export type StoreSection = (typeof STORE_SECTIONS)[keyof typeof STORE_SECTIONS];

export const STORE_SECTION_ITEMS: Array<{ id: StoreSection; label: string }> = [
  { id: STORE_SECTIONS.PRODUCTS, label: "Productos" },
  { id: STORE_SECTIONS.CATEGORIES, label: "Categorías" },
  { id: STORE_SECTIONS.BRANDS, label: "Marcas" },
  { id: STORE_SECTIONS.REVIEWS, label: "Reseñas" },
];

export function parseStoreSection(value: string | null): StoreSection {
  return STORE_SECTION_ITEMS.find((item) => item.id === value)?.id ?? STORE_SECTIONS.PRODUCTS;
}

/** Same values as `STORE_PRODUCT_SOURCE` in kadesh-back. */
export const STORE_SOURCE = {
  OWN: "own",
  DROPI: "dropi",
  MERCADO_LIBRE: "mercado_libre",
} as const;

export const STORE_SOURCE_LABELS: Record<string, string> = {
  own: "Propio",
  dropi: "Dropi",
  mercado_libre: "Mercado Libre",
};

export const STORE_SOURCE_OPTIONS = Object.entries(STORE_SOURCE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const STORE_SOURCE_CLASS: Record<string, string> = {
  own: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  dropi: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  mercado_libre: "bg-yellow-100 text-yellow-900 dark:bg-yellow-500/15 dark:text-yellow-200",
};

/** Same values as `STORE_PRODUCT_STATUS` in kadesh-back. Only `active` is visible to shoppers. */
export const STORE_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  ARCHIVED: "archived",
} as const;

export const STORE_STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  active: "Activo",
  paused: "Pausado",
  archived: "Archivado",
};

export const STORE_STATUS_CLASS: Record<string, string> = {
  draft: "bg-dash-surface-2 text-dash-soft",
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  paused: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  archived: "bg-stone-200 text-stone-700 dark:bg-stone-500/20 dark:text-stone-300",
};

export const STORE_STATUS_DOT: Record<string, string> = {
  draft: "bg-stone-400",
  active: "bg-emerald-500",
  paused: "bg-amber-500",
  archived: "bg-stone-600",
};

export const STORE_INVENTORY = {
  TRACKED: "tracked",
  UNTRACKED: "untracked",
} as const;

export const STORE_INVENTORY_OPTIONS = [
  { value: STORE_INVENTORY.TRACKED, label: "Con stock contado" },
  { value: STORE_INVENTORY.UNTRACKED, label: "Sin stock (sobre pedido)" },
];

export const STORE_REVIEW_STATUS = {
  PUBLISHED: "published",
  HIDDEN: "hidden",
} as const;

export type StoreReviewFilter = "todas" | "published" | "hidden";

export const STORE_REVIEW_FILTER_OPTIONS: Array<{ value: StoreReviewFilter; label: string }> = [
  { value: "todas", label: "Todas" },
  { value: "published", label: "Publicadas" },
  { value: "hidden", label: "Ocultas" },
];

export const ADMIN_STORE_PRODUCTS_PAGE_SIZE = 25;
export const ADMIN_STORE_REVIEWS_PAGE_SIZE = 20;
/** Categories and brands are short lists: one page. */
export const ADMIN_STORE_TAXONOMY_TAKE = 200;
export const ADMIN_STORE_MAX_IMAGES = 12;
export const ADMIN_STORE_MAX_VARIANTS = 50;

/** `?producto=` value that opens the editor empty. */
export const STORE_NEW_PRODUCT = "nuevo";

export function storeProductPublicUrl(slug: string | null | undefined): string | null {
  return slug ? `${PET_PLACE_PUBLIC_ORIGIN}/tienda/${slug}` : null;
}

const MONEY = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

/** MXN cents → "$1,250.00". */
export function formatCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return MONEY.format(cents / 100);
}

/** MXN cents → the text of a money field ("1250" or "1250.50"). */
export function centsToInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  const pesos = cents / 100;
  return Number.isInteger(pesos) ? String(pesos) : pesos.toFixed(2);
}

/** Text of a money field → MXN cents. `null` when empty; `NaN` when it is not a valid amount. */
export function inputToCents(value: string): number | null {
  const text = value.trim().replace(/[$,\s]/g, "");
  if (!text) return null;
  const pesos = Number(text);
  if (!Number.isFinite(pesos) || pesos < 0) return Number.NaN;
  return Math.round(pesos * 100);
}

/** Text of a whole-number field → integer. `null` when empty; `NaN` when not a whole number ≥ 0. */
export function inputToInt(value: string): number | null {
  const text = value.trim();
  if (!text) return null;
  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed < 0) return Number.NaN;
  return parsed;
}
