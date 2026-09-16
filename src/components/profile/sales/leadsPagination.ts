export const LEADS_PAGE_SIZES = [10, 25, 50] as const;
export type LeadsPageSize = (typeof LEADS_PAGE_SIZES)[number];
export const DEFAULT_LEADS_PAGE_SIZE: LeadsPageSize = 10;

export function parseLeadsPageSize(value: string | null): LeadsPageSize {
  const n = value ? Number.parseInt(value, 10) : Number.NaN;
  return (LEADS_PAGE_SIZES as readonly number[]).includes(n)
    ? (n as LeadsPageSize)
    : DEFAULT_LEADS_PAGE_SIZE;
}

export type PageItem = number | "ellipsis";

/** Ventana compacta de páginas (máx. 7 huecos) para no montar un <select> de N opciones. */
export function getVisiblePageItems(
  current: number,
  total: number,
): PageItem[] {
  if (total < 1) return [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", total];
  }
  if (current >= total - 3) {
    return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}
