import { GOOGLE_PLACE_CATEGORIES } from "kadesh/constants/constans";
import { INEGI_DENUE_CATEGORIES } from "kadesh/constants/inegiDenueCategories";

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
