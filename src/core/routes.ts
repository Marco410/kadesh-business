/**
 * Centralized routes for the application
 * All route paths should be defined here for consistency and easy maintenance
 */

export const Routes = {
  
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    registerWithReferral: (code: string): string => `/auth/register?referral=${code}`,
  },
  // Home
  home: '/',
  
  // Navigation sections (anchors on home page)
  navigation: {
    whatIsKadesh: '#que-es-kadesh',
    lostAnimals: '#animales',
    veterinarians: '#veterinarias',
    stories: '#historias',
    donations: '#donaciones',
    howItWorks: '#como-funciona',
    roadmap: '#roadmap',
  },
  
  // Legal
  terms: '/terminos',
  privacy: '/privacidad',
  contact: '/contacto',
  
  // Profile
  panel: '/panel',
  panelLead: (id: string): string => `/panel/clientes/lead/${id}`,
  panelProject: (id: string): string => `/panel/clientes/proyecto/${id}`,
  panelQuotation: (id: string): string => `/panel/cotizacion/${id}`,
  publicQuotation: (slug: string): string => `/cotizacion/${slug}`,
  panelAddLead: '/panel/clientes/lead/agregar',
  panelAddSalesperson: '/panel/clientes/agregar-vendedor',
  panelAddCompanyUser: '/panel/espacios/agregar-usuario',
  panelPlans: '/panel/clientes/planes',
  panelPlanSubscribe: (planId: string): string => `/panel/clientes/planes/suscripcion/${planId}`,
  panelPlanSubscriptionSuccess: "/panel/clientes/planes/suscripcion/success",

  
  // About
  conocenos: '/conocenos',
  precios: '/precios',
  
} as const;
