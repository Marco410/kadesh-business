import { PET_PLACE_PUBLIC_ORIGIN } from "kadesh/components/admin/constants";

/** Sub-sections of Operaciones → Kadesh Pet → Tienda (`&seccion=`). No value = orders. */
export const STORE_SECTIONS = {
  ORDERS: "pedidos",
  PRODUCTS: "productos",
  CATEGORIES: "categorias",
  BRANDS: "marcas",
  REVIEWS: "resenas",
  SETTINGS: "ajustes",
} as const;

export type StoreSection = (typeof STORE_SECTIONS)[keyof typeof STORE_SECTIONS];

export const STORE_SECTION_ITEMS: Array<{ id: StoreSection; label: string }> = [
  { id: STORE_SECTIONS.ORDERS, label: "Pedidos" },
  { id: STORE_SECTIONS.PRODUCTS, label: "Productos" },
  { id: STORE_SECTIONS.CATEGORIES, label: "Categorías" },
  { id: STORE_SECTIONS.BRANDS, label: "Marcas" },
  { id: STORE_SECTIONS.REVIEWS, label: "Reseñas" },
  { id: STORE_SECTIONS.SETTINGS, label: "Ajustes" },
];

export function parseStoreSection(value: string | null): StoreSection {
  return STORE_SECTION_ITEMS.find((item) => item.id === value)?.id ?? STORE_SECTIONS.ORDERS;
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

// ─── Orders ─────────────────────────────────────────────────────────────────────────────────

export const ADMIN_STORE_ORDERS_PAGE_SIZE = 25;

/** Working queues of `adminStoreOrders(queue)`. `""` = every order. */
export type StoreOrderQueue = "" | "toReview" | "toFulfill" | "awaitingPayment" | "shipped" | "completed" | "cancelled";

export const STORE_ORDER_QUEUE_OPTIONS: Array<{ value: StoreOrderQueue; label: string; dot?: string }> = [
  { value: "toReview", label: "Comprobantes por revisar", dot: "bg-amber-500" },
  { value: "toFulfill", label: "Por surtir", dot: "bg-orange-500" },
  { value: "awaitingPayment", label: "Esperando pago", dot: "bg-stone-400" },
  { value: "shipped", label: "En camino", dot: "bg-sky-500" },
  { value: "completed", label: "Entregados", dot: "bg-emerald-500" },
  { value: "cancelled", label: "Cancelados", dot: "bg-stone-600" },
  { value: "", label: "Todos" },
];

/** Same values as `STORE_PAYMENT_STATUS` in kadesh-back. */
export const STORE_PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Esperando pago",
  in_review: "Comprobante por revisar",
  paid: "Pagado",
  failed: "Pago fallido",
  refunded: "Reembolsado",
};

export const STORE_PAYMENT_STATUS_CLASS: Record<string, string> = {
  pending: "bg-dash-surface-2 text-dash-soft",
  in_review: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  refunded: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
};

/** Same values as `STORE_FULFILLMENT_STATUS` in kadesh-back. */
export const STORE_FULFILLMENT_LABELS: Record<string, string> = {
  unfulfilled: "Por surtir",
  partial: "Surtido parcial",
  shipped: "En camino",
  delivered: "Entregado",
  returned: "Devuelto",
};

export const STORE_FULFILLMENT_CLASS: Record<string, string> = {
  unfulfilled: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  partial: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  shipped: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  returned: "bg-stone-200 text-stone-700 dark:bg-stone-500/20 dark:text-stone-300",
};

export const STORE_PAYMENT_METHOD_LABELS: Record<string, string> = {
  stripe_card: "Tarjeta",
  bank_transfer: "Transferencia",
};

/** Same values as `STORE_SHIPMENT_STATUS` in kadesh-back, in the order a package goes through them. */
export const STORE_SHIPMENT_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "pending", label: "Por preparar" },
  { value: "pending_approval", label: "Por pedir a Dropi" },
  { value: "requested", label: "Pedido a Dropi" },
  { value: "label_created", label: "Guía generada" },
  { value: "in_transit", label: "En camino" },
  { value: "delivered", label: "Entregado" },
  { value: "exception", label: "Incidencia" },
  { value: "returned", label: "Devuelto" },
  { value: "cancelled", label: "Cancelado" },
];

export const STORE_SHIPMENT_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  STORE_SHIPMENT_STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

export const STORE_SHIPMENT_PROVIDER_LABELS: Record<string, string> = {
  own: "Lo envía Kadesh",
  dropi: "Lo surte Dropi",
};

/** Whether an order is cancelled as a whole (its payment and shipping badges then say little). */
export function isStoreOrderCancelled(status: string): boolean {
  return status === "cancelled";
}
