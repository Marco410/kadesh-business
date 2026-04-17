export function itemBelongsToCrmColumn(
  itemStatusCrmId: string | null | undefined,
  columnId: string,
  fallbackColumnId: string | null
): boolean {
  if (itemStatusCrmId) return itemStatusCrmId === columnId;
  if (fallbackColumnId != null) return columnId === fallbackColumnId;
  return false;
}

export function filterByCrmStatusColumn<T extends { statusCrm?: { id: string } | null }>(
  items: T[],
  columnId: string,
  fallbackColumnId: string | null
): T[] {
  return items.filter((item) =>
    itemBelongsToCrmColumn(item.statusCrm?.id, columnId, fallbackColumnId)
  );
}
