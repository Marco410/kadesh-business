import { GOOGLE_PLACE_CATEGORIES } from "kadesh/constants/constans";

export function getCategoryLabel(value: string | null | undefined): string {
    if (!value) return "—";
    const normalized = value.trim().toLowerCase();
    const found = GOOGLE_PLACE_CATEGORIES.find(
      (c) => c.value.toLowerCase() === normalized,
    );
    return found ? found.label : value;
  }