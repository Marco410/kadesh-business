// El backend es compartido con Kadesh Pet: este blog solo muestra contenido del SaaS (o de ambos).
export const BLOG_PRODUCT_FILTER = { in: ['saas', 'all'] } as const;

// Mapeo de valores de categorías a sus etiquetas.
// Deben coincidir con `POST_CATEGORIES` del backend (models/Blog/Category).
export const POST_CATEGORIES_MAP: Record<string, string> = {
  'prospecting': 'Prospección B2B',
  'crm_sales': 'CRM y ventas',
  'lead_gen': 'Generación de leads',
  'case_studies': 'Casos de éxito',
  'product_updates': 'Producto',
  'news': 'Noticias',
  'tips': 'Consejos',
  'other': 'Otro',
};

// Colores para las categorías
export const CATEGORY_COLORS: Record<string, { border: string; text: string; bg: string }> = {
  'prospecting': { border: 'border-2 border-orange-600', text: 'text-orange-700', bg: 'bg-orange-50' },
  'crm_sales': { border: 'border-2 border-blue-600', text: 'text-blue-700', bg: 'bg-blue-50' },
  'lead_gen': { border: 'border-2 border-green-600', text: 'text-green-700', bg: 'bg-green-50' },
  'case_studies': { border: 'border-2 border-purple-600', text: 'text-purple-700', bg: 'bg-purple-50' },
  'product_updates': { border: 'border-2 border-indigo-600', text: 'text-indigo-700', bg: 'bg-indigo-50' },
  'news': { border: 'border-2 border-yellow-600', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  'tips': { border: 'border-2 border-pink-600', text: 'text-pink-700', bg: 'bg-pink-50' },
  'other': { border: 'border-2 border-gray-600', text: 'text-gray-700', bg: 'bg-gray-50' },
};

// Función helper para obtener el label de una categoría
export function getCategoryLabel(value: string | null | undefined): string {
  if (!value) return 'Sin categoría';
  return POST_CATEGORIES_MAP[value] || value;
}

// Función helper para obtener los colores de una categoría
export function getCategoryColors(value: string | null | undefined) {
  const defaultColors = { border: 'border-2 border-orange-600', text: 'text-orange-700', bg: 'bg-orange-50' };
  if (!value) return defaultColors;
  return CATEGORY_COLORS[value] || defaultColors;
}

