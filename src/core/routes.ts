/**
 * Centralized routes for the application
 * All route paths should be defined here for consistency and easy maintenance
 */

export const Routes = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    registerWithReferral: (code: string): string =>
      `/auth/register?referral=${code}`,
  },
  // Home
  home: "/",

  // Navigation sections (anchors on home page)
  navigation: {
    whatIsKadesh: "#que-es-kadesh",
    lostAnimals: "#animales",
    veterinarians: "#veterinarias",
    stories: "#historias",
    donations: "#donaciones",
    howItWorks: "#como-funciona",
    kadeshAi: "#kadesh-ai",
    roadmap: "#roadmap",
  },

  // Legal
  terms: "/terminos",
  privacy: "/privacidad",
  contact: "/contacto",

  // Profile
  /** `/panel` sin `?tab=` es Extracción B2B. Cualquier `?tab=` abre Panel de control. */
  panel: "/panel",
  panelProfile: "/panel?tab=profile",
  panelAi: "/panel?tab=ai",
  panelLead: (id: string): string => `/panel/clientes/lead/${id}`,
  panelProject: (id: string): string => `/panel/clientes/proyecto/${id}`,
  panelQuotation: (id: string): string => `/panel/cotizacion/${id}`,
  publicQuotation: (slug: string): string => `/cotizacion/${slug}`,
  panelAddLead: "/panel/clientes/lead/agregar",
  panelAddSalesperson: "/panel/clientes/agregar-vendedor",
  panelAddCompanyUser: "/panel/espacios/agregar-usuario",
  panelPlans: "/panel/clientes/planes",
  /** Operaciones internas. Solo rol `admin` de plataforma. */
  panelAdmin: "/panel/clientes/admin",
  panelPlanSubscribe: (planId: string): string =>
    `/panel/clientes/planes/suscripcion/${planId}`,
  panelPlanSubscriptionSuccess: "/panel/clientes/planes/suscripcion/success",
  panelCredits: "/panel/creditos",
  panelCreditPurchase: (creditId: string): string =>
    `/panel/creditos/comprar/${creditId}`,
  panelCreditPurchaseSuccess: "/panel/creditos/comprar/success",

  // About
  conocenos: "/conocenos",
  precios: "/precios",
  novedades: "/novedades",

  // Blog
  blog: {
    index: "/blog",
    post: (url: string): string => `/blog/${url}`,
    /** Portada estable para compartir (la del CMS es una URL firmada que caduca). */
    postImage: (url: string): string => `/blog/${url}/og`,
  },
} as const;
