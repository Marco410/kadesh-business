/**
 * Misma paleta en las tarjetas y en los puntos del mapa.
 * El color sale del nombre de la categoría, no del volumen: Médicos no cambia a naranja si crece.
 */
const LEAD_CATEGORY_PALETTE = [
  {
    hex: "#f97316",
    badge:
      "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
  },
  {
    hex: "#3b82f6",
    badge:
      "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  },
  {
    hex: "#10b981",
    badge:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  {
    hex: "#a855f7",
    badge:
      "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  },
  {
    hex: "#f59e0b",
    badge:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  },
  {
    hex: "#ec4899",
    badge:
      "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
  },
  {
    hex: "#06b6d4",
    badge:
      "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
  },
  {
    hex: "#6366f1",
    badge:
      "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
  },
  {
    hex: "#84cc16",
    badge:
      "bg-lime-500/10 text-lime-700 dark:bg-lime-500/20 dark:text-lime-400",
  },
  {
    hex: "#f43f5e",
    badge:
      "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  },
  {
    hex: "#14b8a6",
    badge:
      "bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400",
  },
  {
    hex: "#8b5cf6",
    badge:
      "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
  },
  {
    hex: "#0ea5e9",
    badge: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
  },
  {
    hex: "#d946ef",
    badge:
      "bg-fuchsia-500/10 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-400",
  },
  {
    hex: "#65a30d",
    badge:
      "bg-lime-600/10 text-lime-800 dark:bg-lime-600/20 dark:text-lime-300",
  },
  {
    hex: "#ea580c",
    badge:
      "bg-orange-600/10 text-orange-700 dark:bg-orange-600/20 dark:text-orange-300",
  },
  {
    hex: "#2563eb",
    badge: "bg-blue-600/10 text-blue-700 dark:bg-blue-600/20 dark:text-blue-300",
  },
  {
    hex: "#059669",
    badge:
      "bg-emerald-600/10 text-emerald-800 dark:bg-emerald-600/20 dark:text-emerald-300",
  },
  {
    hex: "#db2777",
    badge: "bg-pink-600/10 text-pink-700 dark:bg-pink-600/20 dark:text-pink-300",
  },
  {
    hex: "#7c3aed",
    badge:
      "bg-violet-600/10 text-violet-700 dark:bg-violet-600/20 dark:text-violet-300",
  },
  {
    hex: "#0f766e",
    badge: "bg-teal-700/10 text-teal-800 dark:bg-teal-700/20 dark:text-teal-300",
  },
  {
    hex: "#b45309",
    badge:
      "bg-amber-700/10 text-amber-800 dark:bg-amber-700/20 dark:text-amber-300",
  },
  {
    hex: "#be123c",
    badge: "bg-rose-700/10 text-rose-800 dark:bg-rose-700/20 dark:text-rose-300",
  },
] as const;

/** FNV-1a. La misma categoría cae siempre en el mismo índice. */
function hashCategory(category: string): number {
  const value = category.trim().toLowerCase();
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function colorForCategory(category: string): {
  hex: string;
  badge: string;
} {
  if (category === UNCATEGORIZED_LEAD_CATEGORY) return UNCATEGORIZED_COLOR;
  const index = hashCategory(category) % LEAD_CATEGORY_PALETTE.length;
  return LEAD_CATEGORY_PALETTE[index];
}

const UNCATEGORIZED_COLOR = {
  hex: "#9e9e9e",
  badge: "bg-[#f0f0f0] text-[#616161] dark:bg-[#333] dark:text-[#b0b0b0]",
};

export const UNCATEGORIZED_LEAD_CATEGORY = "sin_categoria";

export interface LeadCategoryStat {
  category: string;
  count: number;
  hex: string;
  badge: string;
}

export function buildLeadCategoryStats(
  leads: Array<{ category: string | null }>,
): { total: number; categories: LeadCategoryStat[] } {
  const counts: Record<string, number> = {};
  for (const lead of leads) {
    const cat = lead.category ?? UNCATEGORIZED_LEAD_CATEGORY;
    counts[cat] = (counts[cat] ?? 0) + 1;
  }

  const sorted = Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const categories = sorted.map((item) => {
    const color = colorForCategory(item.category);
    return { ...item, hex: color.hex, badge: color.badge };
  });

  return { total: leads.length, categories };
}

export function readLeadCoordinate(
  lat: number | null | undefined,
  lng: number | null | undefined,
): { lat: number; lng: number } | null {
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }
  return { lat, lng };
}

/** Píxeles. Chico a propósito: el pin de búsqueda sigue siendo el gesto principal. */
export function clientDotRadius(zoom: number): number {
  if (zoom >= 15) return 6;
  if (zoom >= 13) return 5;
  if (zoom >= 11) return 4;
  return 3;
}
