/**
 * Centralized routes for the application
 * All route paths should be defined here for consistency and easy maintenance
 */

export const Routes = {
  
  auth: {
    login: '/auth/login',
    register: '/auth/register',
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
  panelLead: (id: string): string => `/panel/ventas/lead/${id}`,
  panelProject: (id: string): string => `/panel/ventas/proyecto/${id}`,
  panelSyncLeads: '/panel/ventas/obtener-clientes',
  panelAddSalesperson: '/panel/ventas/agregar-vendedor',
  panelPlans: '/panel/ventas/planes',
  panelPlanSubscribe: (planId: string): string => `/panel/ventas/planes/suscripcion/${planId}`,
  panelPlanSubscriptionSuccess: "/panel/ventas/planes/suscripcion/success",

  
  // About
  conocenos: '/conocenos',
  
} as const;
