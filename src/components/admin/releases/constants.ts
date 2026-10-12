/** Producto de una novedad (`SystemRelease.product`). En la UI decimos Negocios, no SaaS. */
export const RELEASE_PRODUCT_ITEMS: Array<{ id: "saas" | "pet" | "all"; label: string }> = [
  { id: "saas", label: "Negocios" },
  { id: "pet", label: "Pet" },
  { id: "all", label: "Ambas" },
];

export const RELEASE_PRODUCT_LABELS: Record<string, string> = {
  saas: "Negocios",
  pet: "Pet",
  all: "Ambas",
};

/** A quién le llega el correo al publicar (mismo criterio que kadesh-back `getReleaseRecipients`). */
export const RELEASE_AUDIENCE: Record<string, string> = {
  saas: "todas las personas con empresa en Kadesh Negocios",
  pet: "todas las personas de Kadesh Pet",
  all: "todas las personas de Kadesh Negocios y Kadesh Pet",
};

export const RELEASE_STATUS_FILTERS = [
  { value: "todas", label: "Todas" },
  { value: "publicadas", label: "Publicadas" },
  { value: "borradores", label: "Borradores" },
] as const;

export const RELEASE_PRODUCT_FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "saas", label: "Negocios" },
  { value: "pet", label: "Pet" },
  { value: "all", label: "Ambas" },
] as const;
