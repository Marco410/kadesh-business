import { GOOGLE_PLACE_CATEGORIES } from "kadesh/constants/constans";
import { INEGI_DENUE_CATEGORIES } from "kadesh/constants/inegiDenueCategories";

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function getCategoryLabel(value: string | null | undefined): string {
  if (!value) return "—";
  const normalized = value.trim().toLowerCase();
  const google = GOOGLE_PLACE_CATEGORIES.find(
    (c) => c.value.toLowerCase() === normalized,
  );
  if (google) return google.label;

  const inegiById = INEGI_DENUE_CATEGORIES.find((c) => c.id === normalized);
  if (inegiById) return inegiById.label;

  const inegiByLabel = INEGI_DENUE_CATEGORIES.find(
    (c) => c.label.toLowerCase() === normalized,
  );
  if (inegiByLabel) return inegiByLabel.label;

  const inegiByValue = INEGI_DENUE_CATEGORIES.find(
    (c) => c.value.toLowerCase() === normalized,
  );
  return inegiByValue ? inegiByValue.label : value;
}

/**
 * Valores de `TechBusinessLead.category` que corresponden a la opción del filtro.
 * Google guarda el `value` (p. ej. `médicos`); INEGI suele guardar el keyword (`medicina`)
 * o el `id`. Misma etiqueta en UI → mismo filtro.
 */
export function expandCategoryFilterValues(selected: string): string[] {
  const key = selected.trim();
  if (!key) return [];

  const lower = key.toLowerCase();
  const ascii = stripDiacritics(lower);
  const values = new Set<string>([key, lower, ascii]);

  const google =
    GOOGLE_PLACE_CATEGORIES.find((c) => c.value.toLowerCase() === lower) ??
    GOOGLE_PLACE_CATEGORIES.find(
      (c) => stripDiacritics(c.value.toLowerCase()) === ascii,
    );

  const label = (google?.label ?? getCategoryLabel(key)).toLowerCase();

  for (const c of GOOGLE_PLACE_CATEGORIES) {
    if (c.label.toLowerCase() !== label) continue;
    values.add(c.value);
    values.add(c.value.toLowerCase());
    values.add(stripDiacritics(c.value.toLowerCase()));
  }

  for (const c of INEGI_DENUE_CATEGORIES) {
    const sameLabel = c.label.toLowerCase() === label;
    const sameId = c.id === ascii || c.id === lower;
    const sameValue =
      c.value.toLowerCase() === lower || c.value.toLowerCase() === ascii;
    if (!sameLabel && !sameId && !sameValue) continue;
    values.add(c.id);
    values.add(c.value);
    values.add(c.label);
    values.add(c.label.toLowerCase());
  }

  return [...values].filter(Boolean);
}
