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
  profile: '/perfil',
  profileLead: (id: string): string => `/perfil/ventas/lead/${id}`,
  profileSyncLeads: '/perfil/ventas/obtener-clientes',
  profileAddSalesperson: '/perfil/ventas/agregar-vendedor',
  profilePlans: '/perfil/ventas/planes',
  profilePlanSubscribe: (planId: string): string => `/perfil/ventas/planes/suscripcion/${planId}`,
  profilePlanSubscriptionSuccess: "/perfil/ventas/planes/suscripcion/success",

  
  // About
  conocenos: '/conocenos',
  
} as const;
